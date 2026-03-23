import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { TrendingUp, Star } from "lucide-react";

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [explosives, setExplosives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExplosives() {
      setLoading(true);
      // Filtramos por el ID que usted me dio (lottery_type)
      const { data } = await supabase.from('lottery_results')
        .select('result_number')
        .eq('lottery_type', lotteryId);
      
      if (data && data.length > 0) {
        const freq: any = {};
        data.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
        const sorted = Object.entries(freq)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);
        
        setExplosives(sorted.map(([code, count]: any) => ({
          code,
          fuerza: Math.min(75 + (count * 2), 99) + "%"
        })));
      }
      setLoading(false);
    }
    fetchExplosives();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-emerald-500">PROCESANDO HISTORIAL...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {explosives.map((a, i) => (
          <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute top-6 right-8 bg-orange-500 text-white px-4 py-1 rounded-full font-black text-xs italic flex items-center gap-1">
               <TrendingUp size={12} /> FUERZA: {a.fuerza}
            </div>
            <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl group-hover:scale-110 transition-all" />
            <h4 className="mt-6 font-black uppercase italic text-3xl tracking-tighter">#{a.code}</h4>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl text-center">
         <h3 className="font-black text-2xl uppercase italic mb-8 flex items-center justify-center gap-3">
            <Star className="text-emerald-400" fill="currentColor" /> REGALOS DEL DÍA
         </h3>
         <div className="flex justify-center gap-10 flex-wrap">
            {['12', '00', '31'].map(code => (
              <img key={code} src={getAnimalImageUrl(code)} className="w-28 h-28 object-contain" />
            ))}
         </div>
      </div>
    </div>
  );
}
