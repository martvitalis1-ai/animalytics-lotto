import { useState, useEffect, useMemo } from 'react';
import { supabase } from "../integrations/supabase/client";
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
      try {
        const { data } = await supabase
          .from('lottery_results')
          .select('*')
          .eq('draw_date', date)
          .eq('lottery_type', lotteryId);
        setResults(data || []);
      } catch (err) {
        console.error("Err:", err);
      }
      setLoading(false);
    };
    fetchResults();
  }, [date, lotteryId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-[2.5rem] border-b-4 border-emerald-500 shadow-xl">
        <h3 className="font-black uppercase italic text-xl flex items-center gap-3">
          <History className="text-emerald-400" /> Bóveda Histórica
        </h3>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="bg-white text-slate-900 border-none rounded-xl px-4 py-2 font-black text-sm" 
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allTimes.map((time) => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div 
              key={time} 
              className={`relative p-6 rounded-[4rem] border-2 border-slate-900 bg-white flex flex-col items-center justify-center min-h-[250px] md:min-h-[320px] transition-all`}
              style={{ opacity: res ? 1 : 0.3 }}
            >
               <div className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-[10px] italic border border-emerald-500/30">
                  {time}
               </div>
               {res ? (
                 <img 
                    src={getAnimalImageUrl(res.result_number)} 
                    className="w-48 h-48 md:w-56 md:h-56 object-contain mt-6" 
                    alt="Animal" 
                  />
               ) : (
                 <div className="w-32 h-32 flex items-center justify-center border-4 border-dashed border-slate-100 rounded-full italic text-slate-200 font-black uppercase text-[8px] text-center px-4">
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
