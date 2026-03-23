import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Star } from "lucide-react";

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const dbId = lotteryId === 'granjita' ? 'la_granjita' : lotteryId === 'lotto_rey' ? 'lotto_rey' : lotteryId;
      const { data } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', dbId).limit(300);
      const freq: any = {};
      data?.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
      const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]).slice(0, 3);
      setList(sorted.map(([code, count]: any) => ({ code, fuerza: Math.min(65 + (count * 5), 99) + "%" })));
    }
    load();
  }, [lotteryId]);

  return (
    <div className="space-y-12 animate-in zoom-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {list.map((a, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-xl relative">
            <div className="absolute top-8 right-8 bg-orange-500 text-white px-5 py-2 rounded-full font-black text-xs italic shadow-lg">FUERZA: {a.fuerza}</div>
            <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl" />
            <h4 className="mt-6 font-black text-4xl italic uppercase">#{a.code}</h4>
          </div>
        ))}
      </div>

      {/* ANIMALES DE REGALO (COMO EL VIDEO) */}
      <div className="bg-slate-50 border-4 border-slate-900 p-12 rounded-[4rem] shadow-2xl">
         <h3 className="font-black text-2xl uppercase italic mb-10 flex items-center justify-center gap-3 text-slate-900">
           <Star className="text-emerald-500" fill="currentColor" /> ANIMALES DE REGALO
         </h3>
         <div className="flex justify-around flex-wrap gap-8">
            {['12', '00', '31'].map(c => (
              <div key={c} className="flex flex-col items-center bg-white p-6 rounded-[3rem] border-2 border-slate-200 shadow-md">
                <img src={getAnimalImageUrl(c)} className="w-40 h-40 object-contain" />
                <span className="font-black text-3xl mt-4 text-slate-900">#{c}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
