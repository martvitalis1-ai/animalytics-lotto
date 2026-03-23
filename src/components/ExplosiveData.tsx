import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { TrendingUp, Star } from "lucide-react";

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId).limit(200);
      const freq: any = {};
      data?.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
      const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]).slice(0, 3);
      setList(sorted.map(([code, count]: any) => ({ code, fuerza: Math.min(65 + (count * 4), 98) + "%" })));
    }
    load();
  }, [lotteryId]);

  return (
    <div className="space-y-12 animate-in zoom-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {list.map((a, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative group">
            <div className="absolute top-8 right-8 bg-orange-500 text-white px-5 py-2 rounded-full font-black text-xs italic">FUERZA: {a.fuerza}</div>
            <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl group-hover:scale-110 transition-all" />
            <h4 className="mt-6 font-black text-4xl">#{a.code}</h4>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl">
         <h3 className="font-black text-2xl uppercase italic mb-10 flex items-center justify-center gap-3"><Star className="text-emerald-400" fill="currentColor" /> REGALOS DEL MAESTRO</h3>
         <div className="flex justify-around flex-wrap gap-8">
            {['12', '00', '31'].map(c => (<div key={c} className="flex flex-col items-center"><img src={getAnimalImageUrl(c)} className="w-32 h-32 object-contain" /><span className="font-black text-emerald-400 text-2xl mt-4">#{c}</span></div>))}
         </div>
      </div>
    </div>
  );
}
