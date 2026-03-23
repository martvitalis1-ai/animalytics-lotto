import { useState, useEffect, useMemo } from 'react';
import { supabase } from "../integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { History, Loader2 } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const drawTimes = useMemo(() => getDrawTimesForLottery(lotteryId), [lotteryId]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const { data } = await supabase.from('lottery_results').select('*').eq('draw_date', date).eq('lottery_type', lotteryId);
      setResults(data || []);
      setLoading(false);
    };
    fetchResults();
  }, [date, lotteryId]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] border-b-4 border-emerald-500 flex justify-between items-center">
        <h3 className="font-black uppercase italic text-xl">Bóveda Histórica</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white text-slate-900 rounded-xl px-4 py-1 font-black text-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {drawTimes.map((time) => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div key={time} className="relative p-6 rounded-[4rem] border-2 border-slate-900 bg-white flex flex-col items-center justify-center min-h-[250px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <div className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-[10px] italic border border-emerald-500/30">{time}</div>
               {res ? <img src={getAnimalImageUrl(res.result_number)} className="w-48 h-48 object-contain mt-6" alt="" /> : <div className="text-slate-200 font-black uppercase text-[8px]">Pendiente</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
