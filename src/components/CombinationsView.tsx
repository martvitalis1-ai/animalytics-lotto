import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Microscope, Zap, Star, ShieldCheck } from "lucide-react";

export function CombinationsView({ lotteryId }: { lotteryId: string }) {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";
  
  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data } = await supabase.from('trilogias_maestras' as any).select('*').eq('lottery_type', dbId).order('coincidencias', {ascending: false}).limit(15);
      setCombos(data || []);
      setLoading(false);
    };
    fetchCombos();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black text-emerald-500 animate-pulse uppercase">Analizando Trilogías Atómicas...</div>;

  return (
    <div className="space-y-12 pb-40 px-1 animate-in fade-in duration-700 text-slate-900">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden text-left">
        <img src={WATERMARK} className="absolute opacity-10 -right-10 -top-10 w-64 h-64 grayscale" />
        <div className="relative z-10">
           <div className="flex items-center gap-4">
              <Microscope className="text-emerald-400" size={40} />
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Combinaciones</h2>
           </div>
           <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-2 italic">Trilogías de alta sincronía en {lotteryId.replace('_',' ')}</p>
        </div>
      </div>

      <div className="grid gap-10">
         {combos.map((c, i) => (
           <div key={i} className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="flex justify-between items-center mb-8 border-b-4 border-slate-50 pb-4 relative z-20">
                 <div className="flex items-center gap-2"><Star className="text-emerald-500 fill-emerald-500" size={20} /><span className="font-black text-sm uppercase italic">TRILOGÍA DETECTADA</span></div>
                 <div className="bg-slate-900 text-emerald-400 px-6 py-1.5 rounded-full font-black text-[10px] md:text-xs border-2 border-emerald-500 shadow-lg uppercase italic">🔥 Fuerza: {c.fuerza_score}%</div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-10 justify-items-center relative z-10">
                 <img src={getAnimalImageUrl(c.n1)} className="w-full h-auto max-w-[120px] md:max-w-[250px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
                 <img src={getAnimalImageUrl(c.n2)} className="w-full h-auto max-w-[120px] md:max-w-[250px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
                 <img src={getAnimalImageUrl(c.n3)} className="w-full h-auto max-w-[120px] md:max-w-[250px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
              </div>
              <div className="mt-8 bg-slate-900 text-white p-5 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl relative z-10 flex justify-between items-center">
                 <span className="font-black text-lg italic uppercase">{c.coincidencias} VECES VISTOS EL MISMO DÍA</span>
                 <Zap className="text-yellow-400 fill-yellow-400" />
              </div>
              <img src={WATERMARK} className="absolute inset-0 opacity-[0.03] w-full h-full object-contain pointer-events-none" />
           </div>
         ))}
      </div>
    </div>
  );
}
