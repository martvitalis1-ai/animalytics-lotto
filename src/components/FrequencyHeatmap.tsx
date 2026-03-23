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
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).limit(500);
      setData(res || []);
    }
    load();
  }, [lotteryId]);

  const getColor = (count: number) => {
    if (count === 0) return 'text-slate-200';
    if (count === 1) return 'bg-yellow-400 text-slate-900';
    if (count === 2) return 'bg-blue-500 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-2xl overflow-hidden">
      <h3 className="font-black text-3xl uppercase italic mb-8 flex items-center gap-4 text-slate-900"><Grid3X3 className="text-emerald-500" /> Matriz de Frecuencia Atómica</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-slate-900">
          <thead><tr className="bg-slate-900 text-white"><th className="p-4 border border-slate-700">Animal</th>{times.map(t => <th key={t} className="p-2 border border-slate-700 text-[8px] h-20 rotate-45">{t}</th>)}</tr></thead>
          <tbody>{codes.map(code => (
              <tr key={code} className="hover:bg-slate-50">
                <td className="p-2 border border-slate-200 flex items-center gap-2"><img src={getAnimalImageUrl(code)} className="w-10 h-10" /><span className="font-black text-[10px] text-slate-900">#{code}</span></td>
                {times.map(t => {
                  const hits = data.filter(r => r.draw_time === t && r.result_number === code).length;
                  return <td key={t} className={`border border-slate-100 text-center font-black text-xs ${getColor(hits)}`}>{hits || '-'}</td>;
                })}
              </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
