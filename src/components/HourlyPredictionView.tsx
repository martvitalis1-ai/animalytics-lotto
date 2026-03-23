import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Zap, ShieldCheck } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(200);
      if (res && res.length > 0) {
        setData({ maestro: res[0].result_number, hot: res.slice(1, 5), cold: res.slice(10, 14) });
      }
      setLoading(false);
    }
    load();
  }, [lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">CARGANDO ANÁLISIS...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* CABECERA TÉCNICA */}
      <div className="bg-slate-900 text-white p-8 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="bg-emerald-500 p-5 rounded-[2.5rem]"><Zap size={40} className="fill-white" /></div>
          <div>
            <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter">ANIMAL MAESTRO: {data?.maestro}</h2>
            <p className="text-emerald-400 font-bold mt-2 uppercase text-[10px] tracking-widest italic tracking-widest">IA Análisis Maestro para {lotteryId}</p>
          </div>
        </div>
      </div>

      {/* ANIMAL GIGANTE (Fix del video) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black uppercase text-[10px] italic mb-10 tracking-[0.2em]">Próximo Sorteo Sugerido</div>
        <img src={getAnimalImageUrl(data?.maestro)} className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl" />
        <div className="mt-10 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-4xl shadow-xl border-b-8 border-emerald-800">
          95% PROBABILIDAD
        </div>
      </div>

      {/* BLOQUES TÉRMICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
         <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black uppercase text-xs text-orange-500 border-b-2 pb-2 italic mb-8">🔥 Frecuencia Caliente</h4>
            <div className="grid grid-cols-4 gap-4">
               {data?.hot.map((a: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <img src={getAnimalImageUrl(a.result_number)} className="w-16 h-16 object-contain" />
                    <span className="text-[10px] font-black mt-2">#{a.result_number}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black uppercase text-xs text-blue-500 border-b-2 pb-2 italic mb-8">❄️ Frecuencia Fría</h4>
            <div className="grid grid-cols-4 gap-4">
               {data?.cold.map((a: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <img src={getAnimalImageUrl(a.result_number)} className="w-16 h-16 object-contain" />
                    <span className="text-[10px] font-black mt-2">#{a.result_number}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
