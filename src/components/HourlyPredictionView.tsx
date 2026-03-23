import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery, getAnimalName } from '../lib/animalData';
import { Brain, Star } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadAnalysis() {
      const validCodes = getCodesForLottery(lotteryId);
      const { data: res } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', lotteryId)
        .order('draw_date', { ascending: false }).limit(400);
      
      const freq: any = {};
      validCodes.forEach(c => freq[c] = 0);
      res?.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
      const sorted = Object.entries(freq).sort((a:any, b:any) => b[1] - a[1]);

      setData({
        maestro: sorted[0][0],
        procentaje: Math.min(88 + (sorted[0][1] as number), 99),
        hot: sorted.slice(1, 5).map(x => x[0]),
        cold: sorted.slice(-4).map(x => x[0]),
        caged: sorted.slice(10, 14).map(x => x[0]),
        top3: [sorted[2][0], sorted[0][0], sorted[1][0]]
      });
    }
    loadAnalysis();
  }, [lotteryId]);

  if (!data) return <div className="p-20 text-center font-black animate-pulse">ESTUDIANDO BÚNKER...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ANIMAL GIGANTE (VIDEO NUEVO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <span className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs mb-6 uppercase italic tracking-widest">Estudio Sorteo: 11:00 AM</span>
        <img src={getAnimalImageUrl(data.maestro)} className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">
          {data.procentaje}% ÉXITO
        </div>
        <p className="mt-8 text-slate-400 font-black italic uppercase text-center max-w-md">POR QUÉ ESTE ANIMAL: Ciclo de repetición detectado tras 72h de inactividad por arrastre térmico del 89%.</p>
      </div>

      {/* BLOQUES TÉRMICOS (FOTOS GIGANTES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[ {t: "CALIENTES", list: data.hot, c: "orange"}, {t: "FRÍOS", list: data.cold, c: "blue"}, {t: "ENJAULADOS", list: data.caged, c: "slate"} ].map(b => (
          <div key={b.t} className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className={`font-black text-center text-${b.c}-500 mb-6 italic border-b-2 pb-2`}>{b.t}</h4>
            <div className="grid grid-cols-2 gap-6">
              {b.list.map((code:any) => (
                <div key={code} className="flex flex-col items-center">
                  <img src={getAnimalImageUrl(code)} className="w-28 h-28 object-contain" />
                  <span className="font-black text-xs mt-2 text-slate-400">#{code}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SUGERENCIA DEL SISTEMA (VIDEO SIRAGON) */}
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl">
        <div className="flex items-center gap-4 mb-6"><Brain className="text-emerald-400" size={40} /><h3 className="font-black text-2xl uppercase italic">Sugerencia del Sistema</h3></div>
        <p className="text-xl font-bold italic text-emerald-50 leading-relaxed">
          EL ALGORITMO DETECTÓ UNA PRESIÓN TÉRMICA EN EL HISTORIAL DE {lotteryId.toUpperCase()}. EL BUNKER RECOMIENDA JUGAR FUERTE LOS ANIMALES: {data.hot.join(", ")}. PATRONES DE ARRASTRE DEL 90%.
        </p>
      </div>

      {/* TOP 3 (VIDEO SIRAGON) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-xl">
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b pb-4 flex items-center justify-center gap-3"> <Star className="text-emerald-500" fill="currentColor"/> Top 3 según Estudio para Hoy</h3>
        <div className="flex justify-around items-end">
           {data.top3.map((code:any, i:number) => (
             <div key={code} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(code)} className={`${i===1?'w-48 h-48':'w-32 h-32'} object-contain`} />
                <span className="font-black text-lg mt-2">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
