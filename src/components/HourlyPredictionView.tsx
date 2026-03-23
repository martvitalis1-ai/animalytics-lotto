import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, ShieldCheck, Zap, Flame, Snowflake, Lock, TrendingUp } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';

export function HourlyPredictionView() {
  const [lotteryId, setLotteryId] = useState('lotto_activo');
  const [data, setData] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: [] });
  const [loading, setLoading] = useState(true);

  const analyze = async () => {
    setLoading(true);
    const { data: results } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(400);
    if (!results) return;

    // MATEMÁTICA DE FRECUENCIA REAL
    const freq: Record<string, number> = {};
    const lastSeen: Record<string, number> = {};
    const today = new Date().getTime();

    results.forEach(r => {
      const code = r.result_number.trim().padStart(2, '0').replace('000', '00');
      freq[code] = (freq[code] || 0) + 1;
      if (!lastSeen[code]) lastSeen[code] = new Date(r.draw_date).getTime();
    });

    const sorted = Object.entries(freq).map(([code, count]) => ({
      code, count, daysSince: Math.floor((today - lastSeen[code]) / 86400000)
    })).sort((a,b) => b.count - a.count);

    setData({
      hot: sorted.slice(0, 5),
      cold: [...sorted].reverse().slice(0, 5),
      caged: sorted.filter(a => a.daysSince >= 5).slice(0, 5),
      hours: [ {t: "10:00 AM", a: "37, 67, 41"}, {t: "04:00 PM", a: "15, 22, 00"} ],
      days: [ {d: "DOMINGO", a: "70, 57"}, {d: "VIERNES", a: "05, 11"} ],
      rec: sorted.slice(0, 4) // Top 4 para recomendación
    });
    setLoading(false);
  };

  useEffect(() => { analyze(); }, [lotteryId]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* SELECTOR DE LOTERÍA INTERNO */}
      <div className="flex justify-center">
        <Select value={lotteryId} onValueChange={setLotteryId}>
          <SelectTrigger className="w-64 h-12 rounded-2xl border-4 border-slate-900 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><SelectValue /></SelectTrigger>
          <SelectContent className="border-2 border-slate-900 rounded-2xl shadow-2xl">{LOTTERIES.map(l => (<SelectItem key={l.id} value={l.id} className="font-bold"><div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full"/>{l.name}</div></SelectItem>))}</SelectContent>
        </Select>
      </div>

      {/* RECOMENDACIÓN (Foto 1) */}
      <div className="bg-slate-900 p-8 rounded-[4rem] text-white border-b-8 border-emerald-600 shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="bg-emerald-500 p-5 rounded-[2.5rem] shadow-[0_0_30px_rgba(16,185,129,0.5)]"><Zap size={40} className="fill-white" /></div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none">Recomendación Blindada</h2>
            <p className="text-sm mt-3 text-slate-300">El algoritmo detectó una presión térmica en el historial de {lotteryId}. Jugar fuerte estos 4 animales:</p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
               {data.rec.map((a: any) => (<div key={a.code} className="bg-white/10 p-2 rounded-2xl border border-white/10 flex items-center gap-3"><img src={getAnimalImageUrl(a.code)} className="w-12 h-12" /><span className="font-black text-emerald-400 text-lg">#{a.code}</span></div>))}
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUES TÉRMICOS (Foto 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full italic tracking-widest">🔥 Calientes</p>
          <div className="grid grid-cols-2 gap-6">{data.hot.map((a: any) => (<div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-32 h-32 object-contain" /><span className="text-[11px] font-black text-slate-400 mt-2 uppercase">{a.count} Hits</span></div>))}</div>
        </div>
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full italic tracking-widest">❄️ Fríos</p>
          <div className="grid grid-cols-2 gap-6">{data.cold.map((a: any) => (<div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-32 h-32 object-contain" /><span className="text-[11px] font-black text-slate-400 mt-2 uppercase">{a.count} Hits</span></div>))}</div>
        </div>
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full italic tracking-widest">⛓️ Enjaulados</p>
          <div className="grid grid-cols-2 gap-6">{data.caged.map((a: any) => (<div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-32 h-32 object-contain" /><span className="text-[11px] font-black text-slate-400 mt-2 uppercase">{a.daysSince} Días</span></div>))}</div>
        </div>
      </div>

      {/* HORAS Y DÍAS (Foto 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white border-b-8 border-emerald-500 shadow-2xl">
          <h4 className="font-black text-xs uppercase text-emerald-400 mb-10 flex items-center gap-2 italic tracking-widest"><Clock size={20} /> Horarios de Poder</h4>
          <div className="space-y-6">{data.hours.map((h: any) => (<div key={h.t} className="flex justify-between items-center border-b border-white/5 pb-4"><span className="font-mono text-3xl font-black">{h.t}</span><div className="flex gap-2">{h.a.split(',').map(n=>(<span key={n} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black border border-emerald-500/30">#{n.trim()}</span>))}</div></div>))}</div>
        </div>
        <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="font-black text-xs uppercase text-slate-400 mb-10 flex items-center gap-2 italic tracking-widest"><Calendar size={20} /> Días de Acierto</h4>
          <div className="space-y-6">{data.days.map((d: any) => (<div key={d.d} className="flex justify-between items-center border-b border-slate-200 pb-4"><span className="font-black text-slate-700 uppercase italic text-xl">{d.d}</span><div className="flex gap-2">{d.a.split(',').map(n=>(<span key={n} className="bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-black border-none shadow-md">#{n.trim()}</span>))}</div></div>))}</div>
        </div>
      </div>
    </div>
  );
}
