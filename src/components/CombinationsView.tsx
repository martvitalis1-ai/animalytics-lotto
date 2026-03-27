import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Microscope, Zap, TrendingUp, ShieldCheck } from "lucide-react";

export function CombinationsView({ lotteryId }: { lotteryId: string }) {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";
  
  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      // Mapeo idéntico al historial
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      // 🛡️ Buscamos en la tabla del estudio SQL de afinidad
      const { data } = await supabase
        .from('analisis_jaladeras_maestro' as any)
        .select('*')
        .eq('lottery_type', dbId)
        .order('veces_juntos', {ascending: false})
        .limit(15);
      
      setCombos(data || []);
      setLoading(false);
    };
    fetchCombos();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black text-emerald-500 animate-pulse uppercase">Analizando Familias Atómicas...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700 text-slate-900">
      
      {/* HEADER DE SECCIÓN */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-10 -right-10 -top-10 w-64 h-64 grayscale" />
        <div className="relative z-10">
           <div className="flex items-center gap-4">
              <Microscope className="text-emerald-400" size={40} />
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Familias de Poder</h2>
           </div>
           <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 italic">Uniones con mayor atracción en {lotteryId.replace('_',' ')}</p>
        </div>
      </div>

      {/* LISTA DE UNIONES DETECTADAS */}
      <div className="grid gap-8">
         {combos.length > 0 ? combos.map((c, i) => (
           <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="flex justify-between items-center mb-8 border-b-2 pb-4 border-slate-50">
                 <span className="font-black text-slate-400 uppercase text-[10px] md:text-xs italic">Afinidad: {c.porcentaje_afinidad}%</span>
                 <div className="bg-slate-900 text-emerald-400 px-4 py-1 rounded-full font-black text-[10px] border-2 border-emerald-500 shadow-lg uppercase">Ranking #{c.fuerza_ranking}</div>
              </div>

              <div className="flex justify-center items-center gap-4 md:gap-20 relative z-10">
                 <div className="flex flex-col items-center gap-2">
                    <img src={getAnimalImageUrl(c.animal_base)} className="w-28 h-28 md:w-64 md:h-64 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
                    <span className="bg-slate-900 text-white px-3 py-0.5 rounded-lg font-black text-[10px]">BASE</span>
                 </div>
                 <TrendingUp className="text-emerald-500 animate-pulse" size={40} />
                 <div className="flex flex-col items-center gap-2">
                    <img src={getAnimalImageUrl(c.animal_asociado)} className="w-28 h-28 md:w-64 md:h-64 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
                    <span className="bg-emerald-500 text-slate-900 px-3 py-0.5 rounded-lg font-black text-[10px]">JALA A</span>
                 </div>
              </div>

              <div className="mt-10 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-center">
                <p className="font-black text-sm md:text-xl uppercase italic text-slate-600">
                  Históricamente han coincidido <span className="text-emerald-600">{c.veces_juntos} veces</span> el mismo día.
                </p>
              </div>

              <img src={WATERMARK} className="absolute inset-0 opacity-[0.03] w-full h-full object-contain pointer-events-none" />
           </div>
         )) : (
           <div className="p-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
              <p className="font-black text-slate-400 uppercase italic">Cargando base de datos de combinaciones...</p>
           </div>
         )}
      </div>

      {/* NOTA DE PROTOCOLO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl relative">
         <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="text-emerald-500" size={32} />
            <h3 className="font-black text-xl md:text-2xl uppercase italic text-white">Lógica Atómica</h3>
         </div>
         <p className="text-slate-400 font-bold text-sm md:text-lg leading-relaxed border-l-4 border-emerald-500 pl-6 italic">
            CUANDO EL ANIMAL BASE APARECE EN LOS PRIMEROS SORTEOS, LA PRESIÓN TÉRMICA SE DESPLAZA HACIA EL ANIMAL ASOCIADO PARA EL RESTO DE LA JORNADA.
         </p>
      </div>
    </div>
  );
}
