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
    const fetchLatest = async () => {
      setLoading(true);
      
      // 🚀 CAMBIO CLAVE: Usamos 'calculadora_analitica' que ya tiene el ORDEN MILITAR corregido
      // Quitamos el filtro .eq('draw_date', today) para que si hoy no hay nada aún, 
      // muestre lo último de ayer y no se vea la pantalla vacía.
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(40);
      
      if (error) {
        console.error("Error en TodayResults:", error);
      }

      if (data) {
        // Agrupar por lotería y obtener solo el ÚLTIMO de cada una
        const latestByLottery = data.reduce((acc: Record<string, any>, r: any) => {
          if (!acc[r.lottery_type]) {
            acc[r.lottery_type] = r;
          }
          return acc;
        }, {} as Record<string, any>);

        setResults(Object.values(latestByLottery));
      }
      setLoading(false);
    };
    
    fetchLatest();
    
    // Suscripción en tiempo real corregida
    const channel = supabase
      .channel('today-results-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lottery_results' },
        () => fetchLatest()
      )
      .subscribe();
    
    return () => { 
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
          <p>Sincronizando últimos sorteos…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm italic uppercase tracking-tighter">Monitoreo en Tiempo Real</h3>
        </div>
        <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold animate-pulse">EN VIVO</span>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r: any) => {
          const lottery = LOTTERIES.find(l => l.id === r.lottery_type);
          return (
            <Card key={r.lottery_type} className="glass-card overflow-hidden border-l-4 border-l-primary/50 shadow-lg hover:translate-y-[-2px] transition-transform">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={getLotteryLogo(r.lottery_type)} alt="" className="w-12 h-12 rounded-full border-2 border-primary/10" />
                    <span className="absolute -bottom-1 -right-1 bg-background text-[8px] font-black px-1 rounded border border-border">
                      {r.draw_time.includes('AM') ? 'AM' : 'PM'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] uppercase truncate text-muted-foreground">{lottery?.name || r.lottery_type}</p>
                    <p className="text-lg font-mono font-black leading-none">{r.draw_time.split(' ')[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-3xl text-primary tracking-tighter">{r.result_number}</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground opacity-80">
                      {r.animal_name || ANIMAL_MAPPING[r.result_number] || '---'}
                    </p>
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
