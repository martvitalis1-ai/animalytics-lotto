import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', lotteryId).order('draw_time', { ascending: true });
      setResults(data || []);
    }
    fetchResults();
  }, [lotteryId]);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl">
        <h2 className="font-black text-3xl uppercase italic tracking-tighter">Bóveda Histórica: {lotteryId.replace('_',' ')}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {times.map(time => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div key={time} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 flex flex-col items-center shadow-xl relative min-h-[220px]">
              <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black">{time}</span>
              {res ? (
                <img src={getAnimalImageUrl(res.result_number)} className="w-32 h-32 mt-4 object-contain" />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-200 font-black italic uppercase">Pendiente</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
