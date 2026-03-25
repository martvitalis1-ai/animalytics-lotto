import { useState, useEffect, useMemo } from 'react';
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
      // 🛡️ USAMOS EL ID QUE YA SABEMOS QUE FUNCIONA EN EL HISTORIAL
      const { data: res, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', lotteryId) 
        .order('draw_date', { ascending: false })
        .limit(2000);

      if (error) console.error("Error absorbiendo matriz:", error);
      setData(res || []);
      setLoading(false);
    }
    loadFrequencies();
  }, [lotteryId]);

  // Normalizador de tiempo para que "01:00 PM" y "1:00 PM" sean lo mismo
  const normT = (t: string) => t.toString().replace(/\s/g, '').toUpperCase();
  const normN = (n: string) => n.toString().trim().padStart(2, '0').replace('000', '00');

  const freqMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const key = `${normT(r.draw_time)}-${normN(r.result_number)}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'text-slate-200 opacity-20';
    if (count === 1) return 'bg-yellow-400 text-slate-900 shadow-inner';
    if (count === 2) return 'bg-blue-500 text-white shadow-md';
    return 'bg-red-600 text-white shadow-xl scale-105';
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">Conectando Túnel Atómico...</div>;

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-10 shadow-2xl overflow-hidden relative">
      <h3 className="font-black text-2xl md:text-3xl uppercase italic mb-8 flex items-center gap-4 text-slate-900">
        <Grid3X3 className="text-emerald-500" size={32} /> MATRIZ ATÓMICA
      </h3>
      <div className="overflow-x-auto border-4 border-slate-900 rounded-3xl">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-6 border-r-4 border-slate-700 min-w-[120px] md:min-w-[160px] sticky left-0 bg-slate-900 z-20 uppercase font-black">Animal</th>
              {times.map(t => (
                <th key={t} className="p-2 border-r border-slate-700 text-[10px] h-28 rotate-45 font-black whitespace-nowrap text-center">
                  <span className="inline-block -rotate-45 translate-y-4">{t}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code} className="border-b-2 border-slate-100">
                <td className="p-4 border-r-4 border-slate-900 flex justify-center bg-white sticky left-0 z-10 shadow-xl">
                   <img src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-lg" alt="" />
                </td>
                {times.map(t => {
                  const hits = freqMap[`${normT(t)}-${normN(code)}`] || 0;
                  return (
                    <td key={t} className={`border-r border-slate-200 text-center font-black text-2xl md:text-5xl ${getColor(hits)}`}>
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
