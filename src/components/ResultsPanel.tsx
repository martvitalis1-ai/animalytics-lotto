import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', lotteryId).eq('draw_date', selectedDate);
      setResults(data || []);
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-3xl uppercase italic tracking-tighter">Bóveda de Resultados</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white text-slate-900 px-6 py-2 rounded-2xl font-black border-4 border-slate-900 shadow-lg"/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {times.map(time => {
          const res = results.find(r => r.draw_time === time);
          return (
            <div key={time} className={`bg-white border-4 border-slate-900 rounded-[3rem] p-6 flex flex-col items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative min-h-[250px] transition-all ${res ? 'opacity-100' : 'opacity-30'}`}>
              <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-[10px]">{time}</span>
              {res ? <img src={getAnimalImageUrl(res.result_number)} className="w-32 h-32 md:w-48 md:h-48 mt-4 object-contain drop-shadow-2xl" /> : <div className="flex-1 flex items-center justify-center text-slate-200 font-black italic uppercase">Pendiente</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
