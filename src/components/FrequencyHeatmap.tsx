import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '@/lib/animalData';

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const allCodes = ["0", "00", ...Array.from({length: 99}, (_, i) => String(i+1).padStart(2, '0'))];

  useEffect(() => {
    const fetch = async () => {
      const { data: res } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId).limit(1000);
      setData(res || []);
    };
    fetch();
  }, [lotteryId]);

  return (
    <div className="bg-white p-10 rounded-[4rem] bunker-border space-y-10">
      <h3 className="font-black text-3xl uppercase italic text-slate-900 border-b-4 border-slate-50 pb-6">Matriz de Frecuencia Total</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-4">
        {allCodes.map(code => {
          const hits = data.filter(r => r.result_number.trim() === code).length;
          return (
            <div key={code} className="flex flex-col items-center p-2 hover:scale-110 transition-transform bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
               <img src={getAnimalImageUrl(code)} className="w-20 h-20 object-contain" />
               <div className="bg-slate-900 text-white w-full py-1 rounded-xl text-[10px] font-black text-center mt-2">
                  {hits} HITS
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
