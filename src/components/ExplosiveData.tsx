import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExplosives() {
      setLoading(true);
      
      // 🛡️ Sincronización exacta con los IDs de tu base de datos (SQL)
      // Esto asegura que Granjita, Guacharito y Rey jalen datos.
      let dbId = lotteryId;
      if (lotteryId === 'granjita') dbId = 'la_granjita';
      if (lotteryId === 'lotto_rey') dbId = 'lotto_rey';
      if (lotteryId === 'guacharito') dbId = 'guacharito';

      const { data } = await supabase.from('lottery_results')
        .select('result_number')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .limit(150); // Mantenemos límite para que sea veloz
      
      if (data && data.length > 0) {
        const freq: any = {};
        data.forEach(r => {
          const num = r.result_number.trim();
          freq[num] = (freq[num] || 0) + 1;
        });

        const sorted = Object.entries(freq)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);
        
        setList(sorted.map(([code, count]: any) => ({
          code,
          fuerza: Math.min(65 + (count * 5), 98) + "%"
        })));
      } else {
        setList([]); // Limpiar si no hay datos
      }
      setLoading(false);
    }
    fetchExplosives();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">BUSCANDO EXPLOSIVOS...</div>;

  if (list.length === 0) return <div className="p-20 text-center font-black text-slate-300">SIN DATOS PARA ESTA LOTERÍA</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-40 animate-in zoom-in duration-500">
      {list.map((a, i) => (
        <div key={i} className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute top-8 right-8 bg-orange-500 text-white px-5 py-2 rounded-full font-black text-xs italic shadow-lg">
            FUERZA: {a.fuerza}
          </div>
          <img src={getAnimalImageUrl(a.code)} className="w-56 h-56 object-contain drop-shadow-2xl" alt="" />
          <h4 className="mt-6 font-black text-4xl italic uppercase">#{a.code}</h4>
        </div>
      ))}
    </div>
  );
}
