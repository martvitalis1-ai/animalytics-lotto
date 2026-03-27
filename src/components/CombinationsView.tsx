import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Microscope, TrendingUp } from "lucide-react";

export function CombinationsView({ lotteryId }: { lotteryId: string }) {
  const [combos, setCombos] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchCombos = async () => {
      const { data } = await supabase.from('analisis_jaladeras_maestro' as any).select('*').eq('lottery_type', lotteryId).order('veces_juntos', {ascending: false}).limit(10);
      setCombos(data || []);
    };
    fetchCombos();
  }, [lotteryId]);

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700 text-slate-900">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4"><Microscope className="text-emerald-400" size={40} /> FAMILIAS DE PODER</h2>
        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 italic">Uniones más fuertes en {lotteryId.replace('_',' ')}</p>
      </div>
      <div className="grid gap-8">
         {combos.map((c, i) => (
           <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 border-b-2 pb-4"><span className="font-black text-slate-400 uppercase text-xs">Afinidad: {c.porcentaje_afinidad}%</span><span className="bg-slate-900 text-emerald-400 px-4 py-1 rounded-full font-black text-[10px] border-2 border-emerald-500 shadow-lg uppercase">Fuerza {c.fuerza_ranking}</span></div>
              <div className="flex justify-center items-center gap-6 md:gap-20">
                 <img src={getAnimalImageUrl(c.animal_base)} className="w-28 h-28 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
                 <TrendingUp className="text-slate-200" size={40} />
                 <img src={getAnimalImageUrl(c.animal_asociado)} className="w-28 h-28 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
              </div>
              <p className="mt-8 text-center font-black text-lg md:text-xl uppercase italic text-slate-500">Cuando sale el #{c.animal_base}, el #{c.animal_asociado} tiene un imán del {c.veces_juntos}x.</p>
           </div>
         ))}
      </div>
    </div>
  );
}
