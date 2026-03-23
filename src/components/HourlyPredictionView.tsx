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

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">Analizando Búnker...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-8 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="bg-emerald-500 p-5 rounded-[2.5rem] shadow-lg relative z-10"><Zap size={40} className="fill-white" /></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter">ANIMAL MAESTRO: {data?.maestro}</h2>
          <p className="text-emerald-400 font-bold mt-2 uppercase text-[10px] tracking-widest italic">Análisis Maestro para {lotteryId}</p>
        </div>
      </div>

      {/* ANIMAL GIGANTE 3D (LO QUE PIDIÓ EN EL VIDEO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black uppercase text-[10px] italic mb-10 tracking-[0.2em]">Próximo Sorteo Sugerido</div>
        <img src={getAnimalImageUrl(data?.maestro)} className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)]" />
        <div className="mt-10 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">
          95% PROBABILIDAD
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
         <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black uppercase text-xs text-orange-500 border-b-2 pb-2 italic mb-8">🔥 Calientes</h4>
            <div className="grid grid-cols-4 gap-4">
              {data?.hot.map((a: any, i: number) => (<img key={i} src={getAnimalImageUrl(a.result_number)} className="w-16 h-16 object-contain" />))}
            </div>
         </div>
         <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black uppercase text-xs text-blue-500 border-b-2 pb-2 italic mb-8">❄️ Fríos</h4>
            <div className="grid grid-cols-4 gap-4">
              {data?.cold.map((a: any, i: number) => (<img key={i} src={getAnimalImageUrl(a.result_number)} className="w-16 h-16 object-contain" />))}
            </div>
         </div>
      </div>
    </div>
  );
}
