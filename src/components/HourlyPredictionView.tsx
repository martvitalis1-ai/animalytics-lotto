import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, Flame, Snowflake, Lock, TrendingUp, Calendar, Star, ShieldCheck, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';

interface AnimalStatus {
  code: string;
  name: string;
  count: number;
  status: 'hot' | 'cold' | 'caged';
  daysSinceLast: number;
}

export function HourlyPredictionView({ lotteryId: externalLotteryId }: { lotteryId?: string }) {
  const [selectedLottery, setSelectedLottery] = useState(externalLotteryId || LOTTERIES[0].id);
  const [loading, setLoading] = useState(false);
  const [hotAnimals, setHotAnimals] = useState<AnimalStatus[]>([]);
  const [coldAnimals, setColdAnimals] = useState<AnimalStatus[]>([]);
  const [cagedAnimals, setCagedAnimals] = useState<AnimalStatus[]>([]);
  const [bestHours, setBestHours] = useState<{ time: string; count: number }[]>([]);
  const [bestDays, setBestDays] = useState<{ day: string; count: number }[]>([]);
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .gte('draw_date', dateStr)
        .order('draw_date', { ascending: false });

      const rows = results || [];
      if (rows.length === 0) {
        setHotAnimals([]); setColdAnimals([]); setCagedAnimals([]);
        setBestHours([]); setBestDays([]); setRecommendation('Sin datos suficientes.');
        setLoading(false);
        return;
      }

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

        const time = r.draw_time || '';
        hourFreq[time] = (hourFreq[time] || 0) + 1;

        const dayOfWeek = new Date(r.draw_date + 'T12:00:00').getDay();
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = dayNames[dayOfWeek];
        dayFreq[dayName] = (dayFreq[dayName] || 0) + 1;
      });

      const sorted = Object.entries(freq)
        .map(([code, count]) => {
          const last = lastSeen[code] || today;
          const diff = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
          return { code, name: getAnimalName(code), count, daysSinceLast: diff };
        })
        .sort((a, b) => b.count - a.count);

      setHotAnimals(sorted.slice(0, 4).map(a => ({ ...a, status: 'hot' })));
      setColdAnimals(sorted.slice(-4).reverse().map(a => ({ ...a, status: 'cold' })));
      setCagedAnimals(sorted.filter(a => a.daysSinceLast >= 5).slice(0, 4).map(a => ({ ...a, status: 'caged' })));

      setBestHours(Object.entries(hourFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([time, count]) => ({ time, count })));
      setBestDays(Object.entries(dayFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([day, count]) => ({ day, count })));

      const topA = sorted[0];
      setRecommendation(`SISTEMA DETECTA TENDENCIA ALTA EN ${topA.name} (#${topA.code}). LA MATRIZ SUGIERE ATACAR EL DÍA ${Object.entries(dayFreq).sort((a,b)=>b[1]-a[1])[0][0].toUpperCase()} EN EL HORARIO DE LAS ${Object.entries(hourFreq).sort((a,b)=>b[1]-a[1])[0][0]}.`);
      
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { analyzeData(); }, [selectedLottery]);

  // COMPONENTE DE TARJETA MINIMALISTA (SIN REPETICIONES)
  const AnimalStatusCard = ({ a, status }: { a: AnimalStatus, status: 'hot' | 'cold' | 'caged' }) => (
    <div className="flex flex-col items-center bg-white p-2 rounded-3xl transition-transform hover:scale-105">
      <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
        <img src={getAnimalImageUrl(a.code)} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
        {status === 'hot' && <Flame className="absolute top-0 right-0 text-orange-500 fill-orange-500 size-5" />}
        {status === 'cold' && <Snowflake className="absolute top-0 right-0 text-blue-400 size-5" />}
        {status === 'caged' && <Lock className="absolute top-0 right-0 text-slate-800 size-5" />}
      </div>
      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase">
        {status === 'caged' ? `${a.daysSinceLast} DÍAS` : `${a.count} VECES`}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER CON SELECTOR SIEMPRE PRESENTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> BÚNKER ANALÍTICO
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoreo de flujo de datos 72h</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[200px] border-none bg-transparent font-black uppercase text-xs shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={analyzeData} variant="ghost" size="icon" className="rounded-xl hover:bg-white transition-all">
            {loading ? <Loader2 className="animate-spin text-primary" /> : <RefreshCw size={18} className="text-primary" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-emerald-500 opacity-20" />
          <p className="text-xs font-black mt-4 text-slate-300 uppercase tracking-[0.3em]">Procesando Algoritmos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: ESTADOS TÉRMICOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* RECOMENDACIÓN MAESTRA */}
            <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
               <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-40 opacity-10 rotate-12" />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="fill-yellow-300 text-yellow-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sugerencia de Inteligencia</span>
                  </div>
                  <p className="text-lg lg:text-xl font-black italic uppercase leading-tight max-w-[80%]">
                    {recommendation}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black uppercase text-orange-600 mb-4 flex items-center gap-1">
                  <Flame size={14} /> Calientes
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {hotAnimals.map(a => <AnimalStatusCard key={a.code} a={a} status="hot" />)}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1">
                  <Snowflake size={14} /> Fríos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {coldAnimals.map(a => <AnimalStatusCard key={a.code} a={a} status="cold" />)}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-4 flex items-center gap-1">
                  <Lock size={14} /> Enjaulados
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {cagedAnimals.map(a => <AnimalStatusCard key={a.code} a={a} status="caged" />)}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TIEMPO Y PROBABILIDAD */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-[3rem] text-white shadow-xl h-full">
              <div className="space-y-8">
                <div>
                  <h4 className="font-black text-xs uppercase text-emerald-400 mb-4 italic flex items-center gap-2">
                    <Clock size={16} /> Horarios Clave
                  </h4>
                  <div className="space-y-3">
                    {bestHours.map((h, i) => (
                      <div key={h.time} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-mono text-sm font-bold">{h.time}</span>
                        <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg text-emerald-400">
                          {h.count} hits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase text-emerald-400 mb-4 italic flex items-center gap-2">
                    <Calendar size={16} /> Días de Poder
                  </h4>
                  <div className="space-y-3">
                    {bestDays.map((d, i) => (
                      <div key={d.day} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-sm font-bold uppercase">{d.day}</span>
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-lg">
                          Top {i+1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
