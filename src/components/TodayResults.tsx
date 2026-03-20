import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { getLotteryLogo } from "./LotterySelector";
import { TrendingUp } from "lucide-react";

export function TodayResults() {
  const [results, setResults] = useState<any[]>([]);

  const fetchLatest = async () => {
    const { data } = await supabase.from('lottery_results').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) {
      const latest = data.reduce((acc: any, r: any) => {
        if (!acc[r.lottery_type]) acc[r.lottery_type] = r;
        return acc;
      }, {});
      setResults(Object.values(latest));
    }
  };

  useEffect(() => {
    fetchLatest();
    const channel = supabase.channel('realtime-results').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lottery_results' }, fetchLatest).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2"><TrendingUp className="text-emerald-500" size={16} /><h3 className="font-black text-xs uppercase italic">Resultados 3D en Vivo</h3></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Card key={r.id} className="overflow-hidden border-l-4 border-l-primary shadow-md bg-white rounded-2xl">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={getLotteryLogo(r.lottery_type)} className="w-8 h-8 rounded-full" />
                <div className="text-left"><p className="text-[10px] font-bold text-muted-foreground leading-none">{r.lottery_name}</p><p className="text-xs font-mono font-black">{r.draw_time}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <img src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${r.result_number === '0' || r.result_number === '00' ? r.result_number : r.result_number.padStart(2, '0')}.png`} className="w-10 h-10 object-contain" />
                <span className="text-2xl font-black font-mono text-primary">{r.result_number}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
