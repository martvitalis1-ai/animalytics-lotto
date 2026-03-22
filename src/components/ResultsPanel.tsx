import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '@/lib/animalData';
import { getDrawTimesForLottery } from '@/lib/constants';
import { History, Loader2 } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const allTimes = getDrawTimesForLottery(lotteryId);

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-[2.5rem] bunker-border">
        <h3 className="font-black uppercase italic text-xl flex items-center gap-2">
          <History className="text-emerald-400" /> Bóveda Histórica
        </h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white text-slate-900 border-none rounded-xl px-4 py-2 font-black text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTimes.map((time) => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div key={time} className={`p-6 rounded-[3.5rem] bunker-border bg-white flex flex-col items-center justify-center min-h-[300px] transition-all ${res ? 'glow-green' : 'opacity-40 grayscale'}`}>
               <span className="bg-slate-900 text-white px-6 py-1 rounded-full font-mono font-black text-lg mb-6 tracking-tighter">
                  {time}
               </span>
               {res ? (
                 <img src={getAnimalImageUrl(res.result_number)} className="w-52 h-52 object-contain" alt="" />
               ) : (
                 <div className="w-52 h-52 flex items-center justify-center border-4 border-dashed border-slate-100 rounded-full italic text-slate-300 font-black uppercase text-xs">
                    Sorteo Pendiente
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
