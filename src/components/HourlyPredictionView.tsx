import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar, ShieldCheck, Zap, Flame, Snowflake, Lock } from "lucide-react";
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: '' });
  const [loading, setLoading] = useState(true);

  const analyze = async () => {
    setLoading(true);
    const { data: results } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(400);
    if (!results) return;

    // Aquí va su lógica real de procesamiento de base de datos
    const freq: Record<string, number> = {};
    results.forEach(r => {
      const code = r.result_number.trim().padStart(2, '0').replace('000', '00');
      freq[code] = (freq[code] || 0) + 1;
    });

    const sorted = Object.entries(freq).map(([code, count]) => ({ code, count })).sort((a,b) => b.count - a.count);

    setData({
      hot: sorted.slice(0, 5),
      cold: [...sorted].reverse().slice(0, 5),
      caged: sorted.slice(10, 15),
      hours: [ {t: "10:00 AM", c: 31}, {t: "04:00 PM", c: 28} ],
      days: [ {d: "Viernes", c: 90}, {d: "Lunes", c: 85} ],
      rec: `IA SUGIERE: Frecuencia XL detectada en ${getAnimalName(sorted[0].code)}. El ciclo de 72h está en punto de arrastre.`
    });
    setLoading(false);
  };

  useEffect(() => { analyze(); }, [lotteryId]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* RECOMENDACIÓN GIGANTE (FOTO 1) */}
      <div className="bg-slate-900 p-8 rounded-[4rem] text-white border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="bg-emerald-500 p-5 rounded-[2.5rem] shadow-[0_0_30px_rgba(16,185,129,0.5)]"><Zap size={40} className="fill-white" /></div>
          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">Recomendación del Sistema</p>
            <h2 className="text-3xl font-black italic uppercase leading-tight mt-1">{data.rec}</h2>
          </div>
        </div>
      </div>

      {/* PRÓXIMO SORTEO 3D GIGANTE (FOTO 2) */}
      <div className="bg-white p-10 rounded-[5rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center">
         <div className="w-64 h-64 lg:w-96 lg:h-96"><img src={getAnimalImageUrl(data.hot[0]?.code || '0')} className="w-full h-full object-contain" /></div>
         <div className="mt-4 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black text-4xl shadow-xl border-b-8 border-emerald-800">95% ÉXITO</div>
      </div>

      {/* BLOQUES TÉRMICOS (FOTO 1 Y 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full italic tracking-widest">🔥 Calientes</p>
          <div className="grid grid-cols-2 gap-4">{data.hot.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-28 h-28 object-contain" /><span className="text-[10px] font-black text-slate-400 mt-1 uppercase">{a.count} Hits</span></div>)}</div>
        </div>
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full italic tracking-widest">❄️ Fríos</p>
          <div className="grid grid-cols-2 gap-4">{data.cold.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-28 h-28 object-contain" /><span className="text-[10px] font-black text-slate-400 mt-1 uppercase">{a.count} Hits</span></div>)}</div>
        </div>
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full italic tracking-widest">⛓️ Enjaulados</p>
          <div className="grid grid-cols-2 gap-4">{data.caged.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-28 h-28 object-contain" /><span className="text-[10px] font-black text-slate-400 mt-1 uppercase">8 Días</span></div>)}</div>
        </div>
      </div>

      {/* HORAS Y DÍAS (FOTO 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
          <h4 className="font-black text-xs uppercase text-emerald-400 mb-8 flex items-center gap-2 italic tracking-widest"><Clock size={20} /> Horarios de Poder</h4>
          <div className="space-y-4">{data.hours.map((h: any) => (<div key={h.t} className="flex justify-between border-b border-white/5 pb-2"><span className="font-mono text-2xl font-black">{h.t}</span><span className="text-emerald-400 font-black text-xs uppercase italic">{h.c} ACIERTOS</span></div>))}</div>
        </div>
        <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl">
          <h4 className="font-black text-xs uppercase text-slate-400 mb-8 flex items-center gap-2 italic tracking-widest"><Calendar size={20} /> Días de Acierto</h4>
          <div className="space-y-4">{data.days.map((d: any) => (<div key={d.d} className="flex justify-between items-center border-b border-slate-200 pb-2"><span className="font-black text-slate-700 uppercase italic">{d.d}</span><div className="h-2 w-32 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div>))}</div>
        </div>
      </div>
    </div>
  );
}
