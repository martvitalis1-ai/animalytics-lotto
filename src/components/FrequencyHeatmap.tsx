import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { Grid3X3 } from "lucide-react";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const times = getDrawTimesForLottery(lotteryId);
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function loadFrequencies() {
      setLoading(true);
      const cleanId = lotteryId.toLowerCase().trim();

      const { data: res, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .ilike('lottery_type', cleanId)
        .limit(1500); // Subimos el límite para más precisión

      if (error) console.error("Error en Matriz:", error);
      setData(res || []);
      setLoading(false);
    }
    loadFrequencies();
  }, [lotteryId]);

  const getColor = (count: number) => {
    if (count === 0) return 'text-slate-200';
    if (count === 1) return 'bg-yellow-400 text-slate-900';
    if (count === 2) return 'bg-blue-500 text-white';
    return 'bg-red-600 text-white shadow-lg';
  };

  // Función para comparar números sin errores (0 = 00 = 0)
  const isMatch = (dbNum: string, codeNum: string) => {
    const db = dbNum.trim().padStart(2, '0').replace('000', '00');
    const cd = codeNum.trim().padStart(2, '0').replace('000', '00');
    return db === cd;
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">Calculando Matriz Atómica...</div>;

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
              {times.map(t => (
                <th key={t} className="p-2 border-r border-slate-700 text-[10px] h-24 rotate-45 font-black whitespace-nowrap">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code} className="border-b-2 border-slate-100">
                <td className="p-4 border-r-4 border-slate-900 flex justify-center bg-white sticky left-0 z-10">
                   <img src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-md" />
                </td>
                {times.map(t => {
                  const hits = data.filter(r => 
                    r.draw_time.trim().toUpperCase() === t.trim().toUpperCase() && 
                    isMatch(r.result_number, code)
                  ).length;

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
