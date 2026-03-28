import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Microscope, Zap, TrendingUp, ShieldCheck, Star, Layers } from "lucide-react";

export function CombinationsView({ lotteryId }: { lotteryId: string }) {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";
  
  useEffect(() => {
    const fetchFamilies = async () => {
      setLoading(true);
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      // 🛡️ Buscamos las combinaciones variadas (Cuartetos, Tríos y Dúos)
      const { data } = await supabase
        .from('expert_families')
        .select('*')
        .eq('lottery_type', dbId)
        .order('hits', {ascending: false});
      
      setFamilies(data || []);
      setLoading(false);
    };
    fetchFamilies();
  }, [lotteryId]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-8 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase italic">Escaneando Familias Atómicas...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700 text-slate-900">
      
      {/* HEADER MODO EXPERTO */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-10 -right-10 -top-10 w-64 h-64 grayscale" />
        <div className="relative z-10">
           <div className="flex items-center gap-4">
              <Microscope className="text-emerald-400" size={40} />
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Modo Experto</h2>
           </div>
           <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 italic">Estudio de Sincronía en {lotteryId.replace('_',' ')}</p>
        </div>
      </div>

      {/* 🛡️ RENDERIZADO DE FAMILIAS (CUARTETOS, TRÍOS, DÚOS) */}
      <div className="grid gap-10">
         {families.length > 0 ? families.map((f, i) => {
           const nums = f.numbers.split('-');
           return (
             <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                
                {/* Badge de Tipo y Fuerza */}
                <div className="flex justify-between items-center mb-8 border-b-4 border-slate-50 pb-4 relative z-20">
                   <div className="flex items-center gap-2">
                      <Layers className="text-emerald-500" size={20} />
                      <span className="font-black text-sm uppercase text-slate-900 italic">{f.combo_type} DETECTADO</span>
                   </div>
                   <div className="bg-slate-900 text-emerald-400 px-6 py-1.5 rounded-full font-black text-[10px] md:text-xs border-2 border-emerald-500 shadow-lg uppercase italic">
                      🔥 Fuerza: {f.strength}
                   </div>
                </div>

                {/* IMÁGENES GIGANTES EN GRID SEGÚN EL TIPO */}
                <div className={`grid gap-4 md:gap-8 justify-items-center items-center relative z-10 ${nums.length === 4 ? 'grid-cols-2 md:grid-cols-4' : nums.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                   {nums.map((n: string) => (
                     <div key={n} className="relative flex flex-col items-center group-hover:scale-110 transition-transform">
                        <img src={getAnimalImageUrl(n.trim())} className="w-full h-auto max-w-[120px] md:max-w-[220px] object-contain drop-shadow-2xl" />
                     </div>
                   ))}
                </div>

                <div className="mt-10 bg-slate-900 text-white p-5 rounded-[2rem] flex justify-between items-center border-l-8 border-emerald-500 shadow-xl relative z-10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Coincidencias Históricas</span>
                      <span className="font-black text-xl italic">{f.hits} VECES EN LA MISMA JORNADA</span>
                   </div>
                   <Star className="text-yellow-400 fill-yellow-400 hidden md:block" size={32} />
                </div>

                {/* Marca de agua única por cuadro */}
                <img src={WATERMARK} className="absolute inset-0 opacity-[0.03] w-full h-full object-contain pointer-events-none" />
             </div>
           );
         }) : (
           <div className="p-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
              <p className="font-black text-slate-400 uppercase italic">El Búnker está calculando nuevas uniones...</p>
           </div>
         )}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="text-emerald-500" size={32} />
            <h3 className="font-black text-xl md:text-2xl uppercase italic text-white">Análisis Atómico</h3>
         </div>
         <p className="text-slate-400 font-bold text-sm md:text-lg leading-relaxed border-l-4 border-emerald-500 pl-6 italic">
            LAS "FAMILIAS DE PODER" SON GRUPOS DE ANIMALES QUE HAN DEMOSTRADO UNA ATRACCIÓN MAGNÉTICA DURANTE EL ÚLTIMO CICLO ANUAL. CUANDO UN MIEMBRO DE LA FAMILIA APARECE, EL SISTEMA ACTIVA LA ALERTA DE SEGUIMIENTO PARA LOS COMPAÑEROS RESTANTES.
         </p>
      </div>
    </div>
  );
}
