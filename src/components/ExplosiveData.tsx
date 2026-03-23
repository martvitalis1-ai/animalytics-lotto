import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const validCodes = getCodesForLottery(lotteryId);
      const { data } = await supabase.from('lottery_results').select('result_number').eq('lottery_type', lotteryId);
      
      const freq: any = {};
      data?.forEach(r => { if(validCodes.includes(r.result_number)) freq[r.result_number] = (freq[r.result_number] || 0) + 1 });
      
      const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]).slice(0, 3);
      setList(sorted.map(([code, count]: any) => ({
        code,
        fuerza: Math.min(50 + (count * 3), 98) + "%"
      })));
    }
    load();
  }, [lotteryId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in duration-500">
      {list.map((a, i) => (
        <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute top-6 right-8 bg-orange-500 text-white px-4 py-1 rounded-full font-black text-xs">FUERZA: {a.fuerza}</div>
          <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain" />
          <h4 className="mt-4 font-black text-3xl italic">#{a.code}</h4>
        </div>
      ))}
    </div>
  );
}
