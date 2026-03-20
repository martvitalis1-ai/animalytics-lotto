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
    try {
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
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchLatest(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <h3 className="font-black text-xs uppercase italic">Resultados 3D en Vivo</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => {
          const lottery = LOTTERIES.find(l => l.id === r.lottery_type);
          // RUTA MAESTRA BLINDADA
          const imgUrl = `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${r.result_number === '0' || r.result_number === '00' ? r.result_number : r.result_number.padStart(2, '0')}.png`;

          return (
            <Card key={r.lottery_type} className="overflow-hidden border-l-4 border-l-primary shadow-md bg-white">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img src={getLotteryLogo(r.lottery_type)} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-black text-[9px] uppercase text-muted-foreground truncate">{lottery?.name || r.lottery_type}</p>
                    <p className="text-sm font-mono font-bold">{r.draw_time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={imgUrl} className="w-12 h-12 object-contain drop-shadow-md" alt="" crossOrigin="anonymous" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                    <p className="font-mono font-black text-3xl text-primary leading-none">{r.result_number}</p>
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
