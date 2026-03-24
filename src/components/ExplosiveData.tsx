import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExplosives() {
      setLoading(true);
      
      // 🛡️ SOLUCIÓN PARA GRANJITA:
      // Buscamos tanto "la_granjita" como "granjita" para asegurar que jale la data
      const idsABuscar = [lotteryId, lotteryId.replace('la_', '')];

      const { data, error } = await supabase
        .from('lottery_results')
        .select('result_number')
        .in('lottery_type', idsABuscar) // Busca cualquier coincidencia
        .order('draw_date', { ascending: false })
        .limit(250);
      
      if (data && data.length > 0) {
        const freq: any = {};
        data.forEach(r => {
          const num = r.result_number?.trim();
          if (num) freq[num] = (freq[num] || 0) + 1;
        });

        const sorted = Object.entries(freq)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);
        
        setList(sorted.map(([code, count]: any) => ({
          code,
          fuerza: Math.min(65 + (count * 4), 98) + "%"
        })));
      } else {
        setList([]); 
      }
      setLoading(false);
    }
    fetchExplosives();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">BUSCANDO EXPLOSIVOS...</div>;

  if (list.length === 0) return (
    <div className="p-20 text-center flex flex-col items-center">
      <p className="font-black text-slate-300 uppercase italic text-2xl">SIN DATOS PARA ESTA LOTERÍA</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-40 animate-in zoom-in duration-500">
      {list.map((a, i) => (
        <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute top-8 right-8 bg-orange-500 text-white px-5 py-2 rounded-full font-black text-xs italic shadow-lg">
            FUERZA: {a.fuerza}
          </div>
          <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl" alt="" />
          <h4 className="mt-6 font-black text-4xl italic uppercase text-slate-900">#{a.code}</h4>
        </div>
      ))}
    </div>
  );
}
