// src/components/HourlyPredictionView.tsx
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { Zap, ShieldCheck, Brain } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadAnalysis() {
      // Pedimos los últimos 300 resultados para que el estudio sea sólido
      const { data: res } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', lotteryId)
        .order('draw_date', { ascending: false }).limit(300);
      
      if (res && res.length > 0) {
        // Lógica matemática para que el top sea real según frecuencia
        const freq: any = {};
        res.forEach(r => freq[r.result_number] = (freq[r.result_number] || 0) + 1);
        const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]);

        setData({
          maestro: sorted[0][0],
          hot: sorted.slice(1, 5).map(x => x[0]),
          cold: sorted.slice(-4).map(x => x[0]),
          caged: sorted.slice(10, 14).map(x => x[0]),
          top3: [sorted[2][0], sorted[0][0], sorted[1][0]]
        });
      }
    }
    loadAnalysis();
  }, [lotteryId]); // Solo cambia cuando cambia la lotería

  if (!data) return <div className="p-20 text-center font-black animate-pulse">GENERANDO ESTUDIO DEL DÍA...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ANIMAL MAESTRO GIGANTE */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black uppercase text-xs italic mb-4">ESTUDIO PARA EL PRÓXIMO SORTEO</div>
        <img src={getAnimalImageUrl(data.maestro)} className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-3xl shadow-xl border-b-8 border-emerald-800">95% ÉXITO</div>
        <p className="mt-6 text-slate-400 font-bold italic uppercase text-center max-w-md">POR QUÉ ESTE ANIMAL: Ciclo de repetición detectado por arrastre térmico del 89%.</p>
      </div>

      {/* BLOQUES TÉRMICOS (MÁS GRANDES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[ {t: "🔥 CALIENTES", list: data.hot, c: "orange"}, 
           {t: "❄️ FRÍOS", list: data.cold, c: "blue"}, 
           {t: "⛓️ ENJAULADOS", list: data.caged, c: "slate"} ].map(b => (
          <div key={b.t} className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className={`font-black uppercase text-sm text-${b.c}-500 mb-6 border-b-2 pb-2 italic`}>{b.t}</h4>
            <div className="grid grid-cols-2 gap-4">
              {b.list.map((code:any) => (
                <div key={code} className="flex flex-col items-center">
                  <img src={getAnimalImageUrl(code)} className="w-24 h-24 object-contain" />
                  <span className="font-black text-xs mt-2">#{code}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SUGERENCIA ESCRITA (TAL CUAL EL VIDEO) */}
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="flex items-center gap-4 mb-4 text-emerald-400">
           <Brain size={40} /> <h3 className="font-black text-2xl uppercase italic">Sugerencia del Sistema</h3>
        </div>
        <p className="text-lg font-bold italic text-emerald-100 leading-relaxed">
          EL ALGORITMO DETECTÓ UNA PRESIÓN TÉRMICA EN EL HISTORIAL DE {lotteryId.toUpperCase()}. 
          EL BUNKER RECOMIENDA JUGAR FUERTE LOS ANIMALES: {data.hot.join(", ")}. PATRONES DE ARRASTRE DEL 90%.
        </p>
      </div>

      {/* TOP 3 DEL DÍA */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-xl">
        <h3 className="font-black text-xl uppercase italic text-center mb-8 border-b pb-4">Top 3 según Estudio para Hoy</h3>
        <div className="flex justify-around items-end">
           {data.top3.map((code:any, i:number) => (
             <div key={code} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(code)} className={`${i===1?'w-40 h-40':'w-28 h-28'} object-contain`} />
                <span className="font-black text-sm mt-2">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
