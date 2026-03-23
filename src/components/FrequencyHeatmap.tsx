import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Grid3X3, BarChart3 } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: res } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId).limit(2000);
      setData(res || []);
    };
    fetch();
  }, [lotteryId]);

  const allCodes = ["0", "00", ...Array.from({length: 99}, (_, i) => String(i+1).padStart(2, '0'))].filter(c => {
      const n = parseInt(c);
      if (lotteryId === 'guacharito') return true;
      if (lotteryId === 'guacharo') return c === '0' || c === '00' || n <= 75;
      return c === '0' || c === '00' || n <= 36;
  });

  return (
    <div className="bg-white p-10 rounded-[5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-10 overflow-hidden">
      <div className="flex items-center gap-4 border-b-4 border-slate-50 pb-8">
        <BarChart3 className="text-emerald-500" size={40} />
        <h3 className="font-black text-3xl md:text-4xl uppercase italic text-slate-900 tracking-tighter leading-none">Matriz de Frecuencia Atómica</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-10">
        {allCodes.map(code => {
          const hits = data.filter(r => r.result_number.trim() === code).length;
          return (
            <div key={code} className="flex flex-col items-center p-6 bg-white rounded-[4rem] border-2 border-slate-100 hover:border-emerald-500 hover:scale-105 transition-all group shadow-sm">
               <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                  <img src={getAnimalImageUrl(code)} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
               </div>
               <div className="bg-slate-900 text-emerald-400 w-full py-3 rounded-[2rem] text-sm md:text-lg font-mono font-black text-center mt-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-lg">
                  {hits} IMPACTOS
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
