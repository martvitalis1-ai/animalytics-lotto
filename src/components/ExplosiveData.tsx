import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchExplosives() {
      const { data } = await supabase.from('lottery_results')
        .select('result_number')
        .eq('lottery_type', lotteryId)
        .limit(100);
      
      const freq: any = {};
      data?.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
      const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]).slice(0, 3);
      setList(sorted.map(([code, count]: any) => ({ code, fuerza: Math.min(65 + (count * 5), 98) + "%" })));
    }
    fetchExplosives();
  }, [lotteryId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-40">
      {list.map((a, i) => (
        <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute top-8 right-8 bg-orange-500 text-white px-5 py-2 rounded-full font-black text-xs italic shadow-lg">FUERZA: {a.fuerza}</div>
          <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl" />
          <h4 className="mt-6 font-black text-4xl italic uppercase">#{a.code}</h4>
        </div>
      ))}
    </div>
  );
}
