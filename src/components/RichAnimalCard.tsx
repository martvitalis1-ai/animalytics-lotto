import { useState, useEffect, useMemo } from 'react';
import { supabase } from "../integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Clock, RefreshCw, Flame, Snowflake, Lock, ShieldCheck, Zap, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';
import { getAnimalName } from '../lib/animalData';

export function HourlyPredictionView({ lotteryId: externalId, onLotteryChange }: any) {
  const [selectedLottery, setSelectedLottery] = useState(externalId || 'lotto_activo');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ hot: [], cold: [], caged: [], hours: [], days: [], rec: '' });

  // Sincronizar con cambios externos
  useEffect(() => {
    if (externalId) setSelectedLottery(externalId);
  }, [externalId]);

  const runIntelligence = async () => {
    setLoading(true);
    try {
      // Analizamos los últimos 400 sorteos para una estadística real
      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .limit(400);

      if (!results || results.length === 0) {
        setLoading(false);
        return;
      }

      const freq: Record<string, number> = {};
      const lastSeen: Record<string, number> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};
      const today = new Date().getTime();

      results.forEach(r => {
        const n = r.result_number.trim();
        // BLINDAJE DE IDENTIDAD 00 y 0
        const code = (n === '0' || n === '00') ? n : n.padStart(2, '0');
        
        freq[code] = (freq[code] || 0) + 1;
        if (!lastSeen[code]) lastSeen[code] = new Date(r.draw_date).getTime();
        
        // Frecuencia Horaria
        hourFreq[r.draw_time] = (hourFreq[r.draw_time] || 0) + 1;
        
        // Frecuencia por Día
        const dName = new Date(r.draw_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        dayFreq[dName] = (dayFreq[dName] || 0) + 1;
      });

      const sorted = Object.entries(freq).map(([code, count]) => ({
        code, 
        count, 
        daysSince: Math.floor((today - lastSeen[code]) / 86400000)
      })).sort((a, b) => b.count - a.count);

      setData({
        hot: sorted.slice(0, 4),
        cold: [...sorted].reverse().slice(0, 4),
        caged: sorted.filter(a => a.daysSince >= 5).sort((a,b) => b.daysSince - a.daysSince).slice(0, 4),
        hours: Object.entries(hourFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(h => ({time: h[0], count: h[1]})),
        days: Object.entries(dayFreq).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(d => ({day: d[0], count: d[1]})),
        rec: `IA DETECTA CICLO DE PODER EN ${getAnimalName(sorted[0].code)}. MÁXIMA PROBABILIDAD EN EL DÍA ${Object.entries(dayFreq).sort((a,b)=>b[1]-a[1])[0][0].toUpperCase()}.`
      });
    } catch (e) { 
      console.error("Error Búnker Analítico:", e); 
    }
    setLoading(false);
  };

  useEffect(() => { runIntelligence(); }, [selectedLottery]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. CABECERA Y SELECTOR GLOBAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[3rem] shadow-xl border border-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-100">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-black text-2xl uppercase italic text-slate-800 leading-none">Análisis Búnker</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedLottery.replace('_',' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); onLotteryChange?.(v); }}>
            <SelectTrigger className="w-56 h-12 rounded-2xl font-black uppercase text-[11px] border-2 border-slate-100 bg-slate-50 shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full shadow-sm" /> {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runIntelligence} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-100 hover:bg-slate-50 transition-all">
            <RefreshCw className={loading ? 'animate-spin text-emerald-600' : 'text-slate-400'} size={20} />
          </Button>
        </div>
      </div>

      {/* 2. RECOMENDACIÓN MAESTRA IA */}
      <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-yellow-400 p-1.5 rounded-xl shadow-lg">
              <Zap size={18} className="fill-slate-900 text-slate-900" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-100">Sugerencia de Inteligencia</span>
          </div>
          <p className="text-xl lg:text-3xl font-black italic uppercase leading-tight max-w-[90%]">
            {data.rec}
          </p>
        </div>
      </div>

      {/* 3. BLOQUES TÉRMICOS (CALIENTES, FRÍOS, ENJAULADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CALIENTES */}
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-50 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full italic tracking-widest">Animales Calientes</p>
          <div className="grid grid-cols-2 gap-4">
            {data.hot.map((a: any) => (
              <div key={a.code} className="flex flex-col items-center">
                <RichAnimalCard code={a.code} status="hot" size="xl" />
                <span className="text-[9px] font-black text-slate-300 uppercase mt-1">{a.count} Hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* FRÍOS */}
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-50 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full italic tracking-widest">Animales Fríos</p>
          <div className="grid grid-cols-2 gap-4">
            {data.cold.map((a: any) => (
              <div key={a.code} className="flex flex-col items-center">
                <RichAnimalCard code={a.code} status="cold" size="xl" />
                <span className="text-[9px] font-black text-slate-300 uppercase mt-1">{a.count} Hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* ENJAULADOS */}
        <div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-50 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full italic tracking-widest">Animales Enjaulados</p>
          <div className="grid grid-cols-2 gap-4">
            {data.caged.map((a: any) => (
              <div key={a.code} className="flex flex-col items-center">
                <RichAnimalCard code={a.code} status="caged" size="xl" />
                <span className="text-[9px] font-black text-slate-400 uppercase mt-1">{a.daysSince} Días</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. HORARIOS Y DÍAS DE PODER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
          <h4 className="font-black text-[11px] uppercase text-emerald-400 mb-8 flex items-center gap-2 italic tracking-[0.2em]">
            <Clock size={20} /> Horarios con Mayor Frecuencia
          </h4>
          <div className="space-y-4">
            {data.hours.map((h: any) => (
              <div key={h.time} className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="font-mono text-2xl font-black text-white">{h.time}</span>
                <div className="flex flex-col items-end">
                   <span className="text-emerald-400 font-black text-xs uppercase tracking-tighter">Probabilidad Alta</span>
                   <span className="text-[10px] font-bold text-white/30 uppercase">{h.count} Aciertos</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl">
          <h4 className="font-black text-[11px] uppercase text-slate-400 mb-8 flex items-center gap-2 italic tracking-[0.2em]">
            <Calendar size={20} /> Días de Acierto Probable
          </h4>
          <div className="space-y-6">
            {data.days.map((d: any, i: number) => (
              <div key={d.day} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 uppercase italic text-lg">{d.day}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">TOP {i + 1}</span>
                </div>
                <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                    style={{ width: i === 0 ? '100%' : '65%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
