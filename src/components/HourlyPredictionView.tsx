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
  
  // Estados de Analítica
  const [stats, setStats] = useState({
    hot: [] as AnimalStatus[],
    cold: [] as AnimalStatus[],
    caged: [] as AnimalStatus[],
    bestHours: [] as { time: string; count: number }[],
    bestDays: [] as { day: string; count: number }[],
    recommendation: ''
  });

  // Sincronizar con el prop externo si cambia
  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const loadAndAnalyze = async () => {
    setLoading(true);
    try {
      // 1. Cargar historial extenso para análisis real
      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .order('draw_time', { ascending: false })
        .limit(400);

      const rows = results || [];
      setHistory(rows);

      if (rows.length === 0) return;

      // 2. Procesamiento de Data
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
        const diff = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
        return { code, name: getAnimalName(code), count, daysSinceLast: diff };
      }).sort((a, b) => b.count - a.count);

      // 3. Formatear Resultados
      setStats({
        hot: sorted.slice(0, 4),
        cold: [...sorted].sort((a, b) => a.count - b.count).slice(0, 4),
        caged: sorted.filter(a => a.daysSinceLast >= 4).sort((a, b) => b.daysSinceLast - a.daysSinceLast).slice(0, 4),
        bestHours: Object.entries(hourFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([time, count]) => ({ time, count })),
        bestDays: Object.entries(dayFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([day, count]) => ({ day, count })),
        recommendation: `IA sugiere fijar en ${sorted[0]?.name} por alta frecuencia horaria.`
      });

    } catch (e) {
      console.error("Error en el búnker:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAndAnalyze(); }, [selectedLottery]);

  // Predicción del próximo sorteo
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

  // Componente de tarjeta interna sin texto redundante
  const MiniCard = ({ code, label, color, info }: any) => (
    <div className="flex flex-col items-center bg-white p-2">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <img src={getAnimalImageUrl(code)} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
        <div className={`absolute top-0 right-0 ${color} p-1 rounded-full shadow-sm`}>{label}</div>
      </div>
      <span className="text-[10px] font-black text-slate-400 mt-1">{info}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* 1. SELECTOR Y CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
        <div>
          <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> Inteligencia Predictiva
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analizando {selectedLottery.replace('_',' ')}</p>
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
          <Button onClick={loadAndAnalyze} variant="white" size="icon" className="h-12 w-12 rounded-2xl shadow-sm border-2 border-white">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: PREDICCIÓN Y ESTADOS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PRÓXIMO SORTEO GIGANTE */}
            <div className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-50 shadow-2xl flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-black text-xs">
                  <Clock size={14} /> {pred?.time}
               </div>
               <div className="w-64 h-64 flex items-center justify-center bg-white mt-4">
                  <img src={getAnimalImageUrl(pred?.code || '0')} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
               </div>
               <div className="mt-4 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-2xl shadow-xl border-b-4 border-emerald-800">
                  {pred?.probability || 0}% PROBABILIDAD
               </div>
            </div>

            {/* GRID DE ESTADOS (CALIENTES, FRÍOS, ENJAULADOS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-black uppercase text-orange-600 mb-4 bg-orange-50 py-2 rounded-full">🔥 Calientes</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.hot.map(a => <MiniCard key={a.code} code={a.code} label={<Flame size={12} className="text-white fill-white"/>} color="bg-orange-500" info={`${a.count} hits`} />)}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-4 bg-blue-50 py-2 rounded-full">❄️ Fríos</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.cold.map(a => <MiniCard key={a.code} code={a.code} label={<Snowflake size={12} className="text-white"/>} color="bg-blue-500" info={`${a.count} hits`} />)}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-4 bg-slate-100 py-2 rounded-full">⛓️ Enjaulados</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.caged.map(a => <MiniCard key={a.code} code={a.code} label={<Lock size={12} className="text-white"/>} color="bg-slate-800" info={`${a.daysSinceLast} días`} />)}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TIEMPO Y RECOMENDACIÓN */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
              <h4 className="font-black text-xs uppercase text-emerald-400 mb-6 italic flex items-center gap-2">
                <Zap size={16} className="fill-emerald-400" /> Recomendación IA
              </h4>
              <p className="text-sm font-medium leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
                {stats.recommendation}
              </p>

              <h4 className="font-black text-xs uppercase text-emerald-400 mt-10 mb-6 italic flex items-center gap-2">
                <Clock size={16} /> Horas de Poder
              </h4>
              <div className="space-y-3">
                {stats.bestHours.map((h, i) => (
                  <div key={h.time} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-sm font-bold">{h.time}</span>
                    <span className="text-emerald-400 font-black text-[10px]">{h.count} ACIERTOS</span>
                  </div>
                ))}
              </div>

              <h4 className="font-black text-xs uppercase text-emerald-400 mt-10 mb-6 italic flex items-center gap-2">
                <Calendar size={16} /> Días de Acierto
              </h4>
              <div className="space-y-3">
                {stats.bestDays.map((d, i) => (
                  <div key={d.day} className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase">{d.day}</span>
                    <div className={`h-1.5 rounded-full bg-emerald-500`} style={{ width: `${(d.count/stats.bestDays[0].count)*100}%` }}></div>
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
