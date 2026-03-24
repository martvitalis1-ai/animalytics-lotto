import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { Grid3X3 } from "lucide-react";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const times = getDrawTimesForLottery(lotteryId);
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function load() {
      // 🛡️ AQUÍ ESTABA EL ERROR, YA COINCIDE CON EL SQL
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).limit(800);
      setData(res || []);
    }
    load();
  }, [lotteryId]);

  const getColor = (count: number) => {
    if (count === 0) return 'text-slate-200';
    if (count === 1) return 'bg-yellow-400 text-slate-900';
    if (count === 2) return 'bg-blue-500 text-white';
    return 'bg-red-600 text-white shadow-lg';
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-10 shadow-2xl overflow-hidden relative">
      <h3 className="font-black text-2xl md:text-3xl uppercase italic mb-8 flex items-center gap-4 text-slate-900">
        <Grid3X3 className="text-emerald-500" size={32} /> MATRIZ ATÓMICA
      </h3>
      <div className="overflow-x-auto border-4 border-slate-900 rounded-3xl">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-6 border-r border-slate-700 min-w-[120px] md:min-w-[160px]">ANIMAL</th>
              {times.map(t => <th key={t} className="p-2 border-r border-slate-700 text-[10px] h-24 rotate-45 font-black whitespace-nowrap">{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code} className="border-b-2 border-slate-100">
                <td className="p-4 border-r-4 border-slate-900 flex justify-center bg-white sticky left-0 z-10">
                   <img src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-md" />
                </td>
                {times.map(t => {
                  const hits = data.filter(r => r.draw_time.trim() === t.trim() && r.result_number.trim() === code.trim()).length;
                  return (
                    <td key={t} className={`border-r border-slate-200 text-center font-black text-2xl md:text-4xl ${getColor(hits)}`}>
                      {hits || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
