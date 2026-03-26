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
      
      // 🛡️ MISMO TÚNEL QUE EL HISTORIAL (ID LIMPIO SEGÚN SQL)
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data: res, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .limit(1500);

      if (error) console.error("Error en Matriz:", error);

      setData(res || []);
      setLoading(false);
    }
    loadFrequencies();
  }, [lotteryId]);

  // 🛡️ LÓGICA DE NORMALIZACIÓN (PARA EL CRUCE DE HITS)
  const cleanFormat = (val: string) => val.toString().replace(/\s/g, '').toUpperCase();
  const cleanNum = (n: string) => n.toString().trim().padStart(2, '0').replace('000', '00');

  const freqMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const key = `${cleanFormat(r.draw_time)}-${cleanNum(r.result_number)}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [data]);

  // 🛡️ COLORES CON BORDES PARA DIVISIÓN CLARA
  const getCellStyle = (count: number) => {
    if (count === 0) return 'text-slate-200 opacity-20 border-slate-100';
    if (count === 1) return 'bg-yellow-400 text-slate-900 border-white shadow-inner';
    if (count === 2) return 'bg-blue-500 text-white border-white';
    return 'bg-red-600 text-white border-white shadow-md'; // Rojo con borde blanco
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase italic text-xs">Sincronizando Matriz...</p>
    </div>
  );

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-3 md:p-6 shadow-2xl overflow-hidden relative">
      <div className="flex items-center gap-3 mb-6 px-2">
        <Grid3X3 className="text-emerald-500" size={24} />
        <h3 className="font-black text-xl md:text-2xl uppercase italic text-slate-900 tracking-tighter">MATRIZ ATÓMICA</h3>
      </div>
      
      {/* CONTENEDOR MÁS COMPACTO */}
      <div className="overflow-x-auto border-4 border-slate-900 rounded-2xl">
        <table className="w-full border-collapse bg-white table-fixed">
          <thead>
            <tr className="bg-slate-900 text-white">
              {/* Columna animal más angosta */}
              <th className="p-2 border-r-4 border-slate-700 w-20 md:w-28 sticky left-0 bg-slate-900 z-20 font-black text-[10px] uppercase">Animal</th>
              {times.map(t => (
                <th key={t} className="p-1 border-r border-slate-700 text-[9px] h-20 rotate-45 font-black whitespace-nowrap">
                  <span className="inline-block -rotate-45 translate-y-2">{t}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code} className="border-b border-slate-100">
                <td className="p-2 border-r-4 border-slate-900 flex justify-center bg-white sticky left-0 z-10 shadow-lg">
                   <img 
                    src={getAnimalImageUrl(code)} 
                    className="w-14 h-14 md:w-20 md:h-20 object-contain" 
                    alt="" 
                   />
                </td>
                {times.map(t => {
                  const hits = freqMap[`${cleanFormat(t)}-${cleanNum(code)}`] || 0;

                  return (
                    <td 
                      key={t} 
                      className={`border-2 text-center font-black text-xl md:text-3xl transition-all ${getCellStyle(hits)}`}
                    >
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
