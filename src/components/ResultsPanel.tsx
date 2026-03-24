import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const { data } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', lotteryId).eq('draw_date', selectedDate);
      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 pb-40">
      <div className="bg-slate-900 text-white p-6 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex justify-between items-center">
        <h2 className="font-black text-2xl uppercase italic">Bóveda: {lotteryId}</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-sm border-4 border-slate-900 shadow-lg"/>
      </div>
      {loading ? <div className="p-20 text-center font-black animate-pulse">ABRIENDO...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {times.map(time => {
            const res = results.find(r => r.draw_time.trim() === time.trim());
            return (
              <div key={time} className={`bg-white border-4 border-slate-900 rounded-[3rem] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative min-h-[220px] ${res ? 'opacity-100' : 'opacity-20'}`}>
                <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-[10px]">{time}</span>
                {res && <img src={getAnimalImageUrl(res.result_number)} className="w-32 h-32 md:w-44 md:h-44 mt-4 object-contain" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
