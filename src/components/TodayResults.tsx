import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { Clock, TrendingUp } from "lucide-react";

export function TodayResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const currentHour = new Date().getHours();
      const currentMinutes = new Date().getMinutes();
      
      // Format current time to compare with draw_time
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', today)
        .order('draw_time', { ascending: false })
        .limit(30);
      
      if (data) {
        // Filter results to only show those before current time
        const filteredResults = data.filter(r => {
          // Parse draw_time like "10:00 AM" or "2:00 PM"
          const timeParts = r.draw_time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!timeParts) return true; // Include if can't parse
          
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const period = timeParts[3].toUpperCase();
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          const drawTimeMinutes = hours * 60 + minutes;
          const currentTimeMinutes = currentHour * 60 + currentMinutes;
          
          return drawTimeMinutes <= currentTimeMinutes;
        });
        
        setResults(filteredResults);
      }
      setLoading(false);
    };
    
    fetchToday();
    
    // Suscripción en tiempo real
    const channel = supabase
      .channel('today-results')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lottery_results' },
        () => fetchToday()
      )
      .subscribe();
    
    // Refresh every minute to update time-based filtering
    const interval = setInterval(fetchToday, 60000);
    
    return () => { 
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
          <p>Cargando análisis de hoy…</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay resultados disponibles para esta hora</p>
          <p className="text-xs mt-1">Los resultados aparecerán después de cada sorteo</p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por lotería y obtener el último de cada una
  const latestByLottery = results.reduce((acc, r) => {
    if (!acc[r.lottery_type]) {
      acc[r.lottery_type] = r;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm">Últimos Resultados de Hoy</h3>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(latestByLottery).map((r: any) => {
          const lottery = LOTTERIES.find(l => l.id === r.lottery_type);
          return (
            <Card key={r.lottery_type} className="glass-card overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img src={getLotteryLogo(r.lottery_type)} alt="" className="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{lottery?.name}</p>
                    <p className="text-xs text-muted-foreground">{r.draw_time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-2xl">{r.result_number}</p>
                    {lottery?.type === 'animals' && (
                      <p className="text-xs text-muted-foreground">
                        {r.animal_name || ANIMAL_MAPPING[r.result_number] || ''}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
