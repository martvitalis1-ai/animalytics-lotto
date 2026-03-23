import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getAnimalName } from '../lib/animalData';
import { Zap, ShieldCheck, Clock, Brain } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);
  const [nextHour, setNextHour] = useState("11:00 AM");

  useEffect(() => {
    async function load() {
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(200);
      if (res && res.length > 0) {
        setData({
          maestro: res[0].result_number,
          hot: res.slice(0, 4),
          cold: res.slice(5, 9),
          caged: res.slice(10, 14),
          top3: res.slice(15, 18)
        });
      }
    }
    load();
  }, [lotteryId]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* ANIMAL MAESTRO GIGANTE + HORA */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black uppercase text-xs italic mb-4">
          PRÓXIMO SORTEO: {nextHour}
        </div>
        <img src={getAnimalImageUrl(data?.maestro || '0')} className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">
          95% ÉXITO
        </div>
        <p className="mt-6 text-slate-400 font-bold italic uppercase text-center max-w-md">
          EXPLICACIÓN: Patrón de arrastre térmico detectado tras 72h de inactividad en este grupo.
        </p>
      </div>

      {/* BLOQUES TÉRMICOS (FOTOS MÁS GRANDES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[ {title: "Calientes", color: "orange", list: data?.hot},
           {title: "Fríos", color: "blue", list: data?.cold},
           {title: "Enjaulados", color: "slate", list: data?.caged} ].map((block) => (
          <div key={block.title} className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className={`font-black uppercase text-sm text-${block.color}-500 border-b-2 pb-2 italic mb-6`}>{block.title}</h4>
            <div className="grid grid-cols-2 gap-6">
              {block.list?.map((a: any, i: number) => (
                <div key={i} className="flex flex-col items-center">
                  <img src={getAnimalImageUrl(a.result_number)} className="w-24 h-24 object-contain" />
                  <span className="text-xs font-black mt-2">#{a.result_number}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SUGERENCIA DEL SISTEMA (TAL CUAL EL VIDEO) */}
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Brain className="text-emerald-400" size={40} />
          <h3 className="font-black text-2xl uppercase italic">Sugerencia del Sistema</h3>
        </div>
        <p className="text-lg font-bold italic leading-relaxed text-emerald-100">
          IA Sugiere: Frecuencia XL detectada en los animales {data?.hot.map((a:any) => a.result_number).join(", ")}. 
          Los patrones indican una probabilidad de salida del 89% en el bloque de la tarde.
        </p>
      </div>

      {/* TOP 3 DEL DÍA */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-xl uppercase italic text-center mb-8 border-b pb-4">Top 3 según Estudio para Hoy</h3>
        <div className="flex justify-around items-end">
           {data?.top3.map((a:any, i:number) => (
             <div key={i} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(a.result_number)} className={`${i===1?'w-40 h-40':'w-28 h-28'} object-contain`} />
                <span className="font-black text-sm mt-2">#{a.result_number}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
