import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, Flame, Snowflake, Lock, TrendingUp, Calendar, Star, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { generateDayForecast } from '@/lib/advancedProbability';

interface AnimalStatus {
  code: string;
  name: string;
  count: number;
  daysSinceLast: number;
}

export function HourlyPredictionView({ lotteryId: externalLotteryId, onLotteryChange }: any) {
  const [selectedLottery, setSelectedLottery] = useState(externalLotteryId || 'lotto_activo');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    hot: [] as AnimalStatus[],
    cold: [] as AnimalStatus[],
    caged: [] as AnimalStatus[],
    bestHours: [] as { time: string; count: number }[],
    bestDays: [] as { day: string; count: number }[],
    recommendation: ''
  });

  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const loadAndAnalyze = async () => {
    setLoading(true);
    try {
      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .limit(400);

      const rows = results || [];
      setHistory(rows);

      if (rows.length === 0) return;

      const freq: Record<string, number> = {};
      const lastSeen: Record<string, string> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};
      const today = new Date().toISOString().split('T')[0];

      rows.forEach((r: any) => {
        const num = r.result_number?.toString().trim();
        if (!num) return;
        const normalized = (num === '00' || num === '0') ? num : num.padStart(2, '0');
        freq[normalized] = (freq[normalized] || 0) + 1;
        if (!lastSeen[normalized]) lastSeen[normalized] = r.draw_date;
        hourFreq[r.draw_time] = (hourFreq[r.draw_time] || 0) + 1;
        const dayName = new Date(r.draw_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        dayFreq[dayName] = (dayFreq[dayName] || 0) + 1;
      });

      const sorted = Object.entries(freq).map(([code, count]) => {
        const last = lastSeen[code] || today;
        const diff = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (86400000));
        return { code, name: getAnimalName(code), count, daysSinceLast: diff };
      }).sort((a, b) => b.count - a.count);

      setStats({
        hot: sorted.slice(0, 4),
        cold: [...sorted].sort((a, b) => a.count - b.count).slice(0, 4),
        caged: sorted.filter(a => a.daysSinceLast >= 5).sort((a, b) => b.daysSinceLast - a.daysSinceLast).slice(0, 4),
        bestHours: Object.entries(hourFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([time, count]) => ({ time, count })),
        bestDays: Object.entries(dayFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([day, count]) => ({ day, count })),
        recommendation: `Animal Maestro: ${sorted[0]?.name || '---'}`
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAndAnalyze(); }, [selectedLottery]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    const times = getDrawTimesForLottery(selectedLottery);
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => {
      const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return 0;
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(m[2]);
    };
    const nextTime = times.find(t => toMin(t) >= currentMin - 5) || times[0];
    const forecasts = generateDayForecast(selectedLottery, [nextTime], history, new Date().toISOString().split('T')[0]);
    return { time: nextTime, ...forecasts[0]?.topPick };
  }, [history, selectedLottery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
        <div>
          <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> Inteligencia Predictiva
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLottery.replace('_',' ')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedLottery} onValueChange={(val) => { setSelectedLottery(val); if(onLotteryChange) onLotteryChange(val); }}>
            <SelectTrigger className="w-[220px] h-12 rounded-2xl border-2 border-white bg-white font-black uppercase text-xs shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold text-xs uppercase">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadAndAnalyze} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border-2 border-white">
            {loading ? <Loader2 className="animate-spin text-primary" /> : <RefreshCw size={20} className="text-primary" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-slate-900 p-6 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400"><ShieldCheck size={180} /></div>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="bg-emerald-500 p-4 rounded-[2rem] shadow-[0_0_20px_rgba(16,185,129,0.4)]"><Zap size={40} className="fill-white text-white animate-pulse" /></div>
                <div className="text-center md:text-left flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Análisis de Ciclo Activo</p>
                  <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none mt-1">{stats.recommendation}</h2>
                  <p className="text-sm mt-2 font-medium text-slate-300">Mejor oportunidad: <span className="text-emerald-400 font-black underline">{stats.bestHours[0]?.time || "---"}</span></p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[4rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-black text-xs italic"><Clock size={14} className="text-emerald-400" /> {pred?.time || '--:--'}</div>
               <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center bg-white mt-4">
                  <img src={getAnimalImageUrl(pred?.code || '0')} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
               </div>
               <div className="mt-4 bg-emerald-600 text-white px-10 py-4 rounded-3xl font-black text-3xl shadow-xl border-b-8 border-emerald-800 uppercase italic">
                  {pred?.probability || 0}% ÉXITO
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[3rem] p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center">
                <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full italic tracking-widest">Calientes</p>
                <div className="grid grid-cols-2 gap-4">{stats.hot.map(a => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-20 h-20 object-contain" /><span className="text-[9px] font-black text-slate-400 mt-1 uppercase">{a.count} Hits</span></div>)}</div>
              </div>
              <div className="bg-white rounded-[3rem] p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full italic tracking-widest">Fríos</p>
                <div className="grid grid-cols-2 gap-4">{stats.cold.map(a => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-20 h-20 object-contain" /><span className="text-[9px] font-black text-slate-400 mt-1 uppercase">{a.count} Hits</span></div>)}</div>
              </div>
              <div className="bg-white rounded-[3rem] p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full italic tracking-widest">Enjaulados</p>
                <div className="grid grid-cols-2 gap-4">{stats.caged.map(a => <div key={a.code} className="flex flex-col items-center"><img src={getAnimalImageUrl(a.code)} className="w-20 h-20 object-contain" /><span className="text-[9px] font-black text-slate-400 mt-1 uppercase">{a.daysSinceLast} Días</span></div>)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
              <h4 className="font-black text-xs uppercase text-emerald-400 mb-8 italic flex items-center gap-2"><Clock size={16} /> Horarios de Poder</h4>
              <div className="space-y-4">
                {stats.bestHours.map((h, i) => (
                  <div key={h.time} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-xl font-black">{h.time}</span>
                    <span className="text-emerald-400 font-black text-[10px] uppercase italic">{h.count} Aciertos</span>
                  </div>
                ))}
              </div>
              <h4 className="font-black text-xs uppercase text-emerald-400 mt-12 mb-8 italic flex items-center gap-2"><Calendar size={16} /> Días de Acierto</h4>
              <div className="space-y-4">
                {stats.bestDays.map((d, i) => (
                  <div key={d.day} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-black text-slate-300 uppercase italic text-sm">{d.day}</span>
                    <div className="h-1.5 w-16 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
