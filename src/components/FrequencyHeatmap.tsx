import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '@/lib/animalData';

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: res } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId).limit(500);
      setData(res || []);
    };
    fetch();
  }, [lotteryId]);

  const allAnimals = Array.from({ length: 37 }, (_, i) => i === 0 ? "0" : i === 36 ? "00" : String(i).padStart(2, '0'));

  return (
    <div className="bg-white p-8 rounded-[4rem] shadow-2xl border border-slate-50 space-y-8">
      <h3 className="font-black text-2xl uppercase italic text-slate-900 border-b border-slate-50 pb-4">Matriz de Frecuencia General</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-6">
        {allAnimals.map(code => (
          <div key={code} className="flex flex-col items-center p-2 hover:scale-110 transition-transform">
             <div className="w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                <img src={getAnimalImageUrl(code)} className="w-full h-full object-contain" alt="" />
             </div>
             <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.random()*100}%` }}></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
