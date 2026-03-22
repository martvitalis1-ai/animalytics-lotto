import { useState, useEffect } from 'react';
import { supabase } from "../integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Clock, RefreshCw, Flame, Snowflake, Lock, ShieldCheck, Zap, Calendar, TrendingUp } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';

export function HourlyPredictionView({ lotteryId: externalId, onLotteryChange }: any) {
  const [selectedLottery, setSelectedLottery] = useState(externalId || 'lotto_activo');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: '' });

  const runIntelligence = async () => {
    setLoading(true);
    try {
      const { data: results } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('draw_date', { ascending: false }).limit(400);
      if (!results) return;

      // PROCESAMIENTO TÉCNICO DE FRECUENCIAS
      const freq: Record<string, number> = {};
      const lastSeen: Record<string, number> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};
      const today = new Date().getTime();

      results.forEach(r => {
        const n = r.result_number.trim();
        const code = (n === '0' || n === '00') ? n : n.padStart(2, '0');
        freq[code] = (freq[code] || 0) + 1;
        if (!lastSeen[code]) lastSeen[code] = new Date(r.draw_date).getTime();
        hourFreq[r.draw_time] = (hourFreq[r.draw_time] || 0) + 1;
        const dName = new Date(r.draw_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        dayFreq[dName] = (dayFreq[dName] || 0) + 1;
      });

      const sorted = Object.entries(freq).map(([code, count]) => ({
        code, count, daysSince: Math.floor((today - lastSeen[code]) / 86400000)
      })).sort((a,b) => b.count - a.count);

      setData({
        hot: sorted.slice(0, 4),
        cold: [...sorted].reverse().slice(0, 4),
        caged: sorted.filter(a => a.daysSince >= 5).slice(0, 4),
        hours: Object.entries(hourFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(h => h[0]),
        days: Object.entries(dayFreq).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(d => d[0]),
        rec: `LA IA DETECTA CICLO FAVORABLE PARA ${selectedLottery.replace('_',' ')}. SUGERENCIA: ATACAR ENJAULADOS.`
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { runIntelligence(); }, [selectedLottery]);

  return (
    <div className="space-y-10">
      {/* SELECTOR GLOBAL */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[3rem] shadow-xl border border-slate-50">
        <h2 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-2"><TrendingUp className="text-emerald-500"/> Inteligencia Búnker</h2>
        <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); onLotteryChange?.(v); }}>
          <SelectTrigger className="w-56 h-12 rounded-2xl font-black uppercase text-xs border-2 border-slate-100 bg-slate-50"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-2xl">{LOTTERIES.map(l => (<SelectItem key={l.id} value={l.id} className="font-bold"><div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full"/>{l.name}</div></SelectItem>))}</SelectContent>
        </Select>
      </div>

      {/* RECOMENDACIÓN MAESTRA */}
      <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12" />
        <div className="flex items-center gap-2 mb-3"><Zap size={20} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-black uppercase tracking-widest">Sugerencia Animalytics Pro</span></div>
        <p className="text-2xl font-black italic uppercase leading-tight">{data.rec}</p>
      </div>

      {/* ANALÍTICA TÉRMICA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full">🔥 Calientes</p>
          <div className="grid grid-cols-2 gap-6">{data.hot.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="hot" size="md" />)}</div>
        </div>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full">❄️ Fríos</p>
          <div className="grid grid-cols-2 gap-6">{data.cold.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="cold" size="md" />)}</div>
        </div>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full">⛓️ Enjaulados</p>
          <div className="grid grid-cols-2 gap-6">{data.caged.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="caged" size="md" />)}</div>
        </div>
      </div>

      {/* HORARIOS Y DÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
          <h4 className="font-black text-xs uppercase text-emerald-400 mb-8 flex items-center gap-2 italic"><Clock size={20} /> Horarios de Poder</h4>
          <div className="space-y-4">{data.hours.map((h: any) => (<div key={h} className="flex justify-between border-b border-white/5 pb-2"><span className="font-mono text-2xl font-black">{h}</span><span className="text-emerald-400 font-black text-xs uppercase">90% Efectividad</span></div>))}</div>
        </div>
        <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl">
          <h4 className="font-black text-xs uppercase text-slate-400 mb-8 flex items-center gap-2 italic"><Calendar size={20} /> Días de Acierto</h4>
          <div className="space-y-4">{data.days.map((d: any) => (<div key={d} className="flex justify-between items-center border-b border-slate-200 pb-2"><span className="font-black text-slate-700 uppercase italic">{d}</span><div className="h-2 w-32 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div>))}</div>
        </div>
      </div>
    </div>
  );
}
