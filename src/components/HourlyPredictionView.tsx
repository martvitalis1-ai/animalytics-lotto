import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar, ShieldCheck, Zap, Flame, Snowflake, Lock, ChevronRight, Loader2 } from "lucide-react";
import { getAnimalImageUrl, getAnimalName, getAnimalEmoji } from '@/lib/animalData';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: '' });

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data: results } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(400);
      if (!results || results.length === 0) return;
      setHistory(results);

      const freq: Record<string, number> = {};
      const lastSeen: Record<string, number> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};
      const today = new Date().getTime();

      results.forEach(r => {
        const code = r.result_number.trim().padStart(2, '0').replace('000', '00');
        freq[code] = (freq[code] || 0) + 1;
        if (!lastSeen[code]) lastSeen[code] = new Date(r.draw_date).getTime();
        hourFreq[r.draw_time] = (hourFreq[r.draw_time] || 0) + 1;
        const dName = new Date(r.draw_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        dayFreq[dName] = (dayFreq[dName] || 0) + 1;
      });

      const sorted = Object.entries(freq).map(([code, count]) => ({
        code, count, daysSince: Math.floor((today - lastSeen[code]) / 86400000)
      })).sort((a,b) => b.count - a.count);

      setStats({
        hot: sorted.slice(0, 5),
        cold: [...sorted].reverse().slice(0, 5),
        caged: sorted.filter(a => a.daysSince >= 5).sort((a,b)=>b.daysSince - a.daysSince).slice(0, 5),
        hours: Object.entries(hourFreq).sort((a,b)=>b[1]-a[1]).slice(0, 4),
        days: Object.entries(dayFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3),
        rec: `ALTA PROBABILIDAD DETECTADA EN EL CICLO DE ${getAnimalName(sorted[0].code)}. LA IA RECOMIENDA FIJAR JUGADAS.`
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { runAnalysis(); }, [lotteryId]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const forecast = generateDayForecast(lotteryId, ["10:00 AM"], history, todayStr);
    return forecast[0]?.topPick;
  }, [history, lotteryId]);

  if (loading) return <div className="py-20 text-center animate-pulse font-black text-slate-300">CALCULANDO MATRICES...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* RECOMENDACIÓN MAESTRA */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border-b-8 border-emerald-500">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
        <div className="flex items-center gap-2 mb-3"><Zap size={20} className="fill-emerald-400 text-emerald-400" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sugerencia Técnica de Inteligencia</span></div>
        <p className="text-2xl font-black italic uppercase leading-tight">{stats.rec}</p>
      </div>

      {/* PRÓXIMO SORTEO 3D GIGANTE */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-2xl flex flex-col items-center">
        <div className="bg-primary text-white px-8 py-2 rounded-full font-black text-sm mb-8 flex items-center gap-2">
          <Clock size={16}/> PRÓXIMO SORTEO
        </div>
        <div className="relative w-72 h-72 lg:w-96 lg:h-96 flex items-center justify-center">
           <img src={getAnimalImageUrl(pred?.code || '0')} className="w-full h-full object-contain z-10 drop-shadow-2xl" />
           <span className="absolute inset-0 flex items-center justify-center text-[180px] lg:text-[250px] font-black text-emerald-500/5 select-none font-mono">
              {pred?.code.padStart(2, '0')}
           </span>
        </div>
        <div className="mt-6 bg-emerald-600 text-white px-10 py-4 rounded-3xl font-black text-3xl shadow-xl border-b-8 border-emerald-800">
          {pred?.probability || 0}% ÉXITO
        </div>
      </div>

      {/* BLOQUES TÉRMICOS (CALIENTES/FRÍOS/ENJAULADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full">🔥 Calientes</p>
          <div className="grid grid-cols-2 gap-4">
            {stats.hot.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-24 h-24 object-contain" /><span className="text-[10px] font-black text-slate-300 uppercase mt-1">{a.count} Hits</span></div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full">❄️ Fríos</p>
          <div className="grid grid-cols-2 gap-4">
            {stats.cold.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-24 h-24 object-contain" /><span className="text-[10px] font-black text-slate-300 uppercase mt-1">{a.count} Hits</span></div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full">⛓️ Enjaulados</p>
          <div className="grid grid-cols-2 gap-4">
            {stats.caged.map((a: any) => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-24 h-24 object-contain" /><span className="text-[10px] font-black text-slate-300 uppercase mt-1">{a.daysSince} Días</span></div>)}
          </div>
        </div>
      </div>

      {/* MEJORES HORAS Y DÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white">
          <h4 className="font-black text-xs uppercase text-emerald-400 mb-8 flex items-center gap-2 italic"><Clock size={20} /> Horarios de Poder</h4>
          <div className="space-y-4">
            {stats.hours.map((h: any) => (
              <div key={h[0]} className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-2xl font-black">{h[0]}</span>
                <span className="text-emerald-400 font-black text-xs uppercase italic">{h[1]} ACIERTOS</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl">
          <h4 className="font-black text-xs uppercase text-slate-400 mb-8 flex items-center gap-2 italic"><Calendar size={20} /> Días de Acierto</h4>
          <div className="space-y-4">
            {stats.days.map((d: any) => (
              <div key={d[0]} className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-black text-slate-700 uppercase italic">{d[0]}</span>
                <div className="h-2 w-32 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
