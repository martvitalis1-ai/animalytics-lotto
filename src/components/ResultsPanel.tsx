import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { History, Loader2, Clock } from "lucide-react";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const allTimes = useMemo(() => getDrawTimesForLottery(lotteryId), [lotteryId]);

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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-600 shadow-2xl">
        <h3 className="font-black uppercase italic text-2xl flex items-center gap-4 tracking-tighter">
          <History className="text-emerald-400" size={30} /> Bóveda Histórica
        </h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white text-slate-900 border-none rounded-2xl px-6 py-3 font-black text-sm shadow-inner" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allTimes.map((time) => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div key={time} className="relative p-6 rounded-[4.5rem] border-2 border-slate-900 bg-white flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="absolute top-6 bg-slate-900 text-white px-5 py-2 rounded-full font-mono font-black text-sm md:text-lg italic tracking-tighter border-2 border-emerald-500">
                  {time}
               </div>
               {res ? (
                 <img src={getAnimalImageUrl(res.result_number)} className="w-52 h-52 md:w-64 md:h-64 object-contain mt-8 drop-shadow-2xl" alt="" />
               ) : (
                 <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center border-4 border-dashed border-slate-100 rounded-full italic text-slate-200 font-black uppercase text-[10px] text-center px-4">
                   Pendiente
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
