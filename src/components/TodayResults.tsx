import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { Clock, TrendingUp } from "lucide-react";

export function TodayResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(40);
    
    if (data) {
      const latestByLottery = data.reduce((acc: Record<string, any>, r: any) => {
        if (!acc[r.lottery_type]) acc[r.lottery_type] = r;
        return acc;
      }, {} as Record<string, any>);
      setResults(Object.values(latestByLottery));
    }
    setLoading(false);
  };

  useEffect(() => { fetchLatest(); }, []);

  if (loading) return <div className="p-10 text-center animate-pulse font-black uppercase text-xs">Sincronizando Búnker...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <h3 className="font-black text-xs uppercase italic">Monitoreo 3D en Vivo</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Card key={r.lottery_type} className="overflow-hidden border-l-4 border-l-primary shadow-md bg-white">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <img src={getLotteryLogo(r.lottery_type)} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-black text-[9px] uppercase text-muted-foreground">{r.lottery_name}</p>
                  <p className="text-sm font-mono font-bold">{r.draw_time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${r.result_number === '0' || r.result_number === '00' ? r.result_number : r.result_number.padStart(2, '0')}.png`} 
                    className="w-12 h-12 object-contain drop-shadow-md" 
                    alt="" 
                  />
                  <p className="font-mono font-black text-3xl text-primary leading-none">{r.result_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
