import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '@/lib/animalData';
import { Grid3X3, BarChart3 } from "lucide-react";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const allCodes = ["0", "00", ...Array.from({length: 99}, (_, i) => String(i+1).padStart(2, '0'))].filter(c => {
      const n = parseInt(c);
      if (lotteryId === 'guacharito') return true;
      if (lotteryId === 'guacharo') return c === '0' || c === '00' || n <= 75;
      return c === '0' || c === '00' || n <= 36;
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: res } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId).limit(2000);
      setData(res || []);
    };
    fetch();
  }, [lotteryId]);

  return (
    <div className="bg-white p-10 rounded-[4rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
      <div className="flex items-center gap-3 border-b-4 border-slate-50 pb-6">
        <BarChart3 className="text-emerald-500" size={32} />
        <h3 className="font-black text-3xl uppercase italic text-slate-900 tracking-tighter">Matriz de Frecuencia 3D</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
        {allCodes.map(code => {
          const hits = data.filter(r => r.result_number.trim() === code).length;
          return (
            <div key={code} className="flex flex-col items-center p-4 bg-slate-50 rounded-[3rem] border-2 border-slate-100 hover:border-emerald-500 hover:scale-105 transition-all group">
               <img src={getAnimalImageUrl(code)} className="w-32 h-32 object-contain" />
               <div className="bg-slate-900 text-white w-full py-2 rounded-2xl text-xs font-black text-center mt-4 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">
                  {hits} IMPACTOS
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
