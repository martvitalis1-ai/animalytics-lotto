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
        setRecommendation('Datos insuficientes para este sorteo.');
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
      setRecommendation(`SISTEMA DETECTA CICLO FAVORABLE PARA ${topA.name}. MÁXIMA PROBABILIDAD EL DÍA ${Object.entries(dayFreq).sort((a,b)=>b[1]-a[1])[0][0].toUpperCase()} EN EL HORARIO DE LAS ${Object.entries(hourFreq).sort((a,b)=>b[1]-a[1])[0][0]}.`);
      
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { analyzeData(); }, [selectedLottery]);

  const StatusCard = ({ a, status }: { a: AnimalStatus, status: 'hot' | 'cold' | 'caged' }) => (
    <div className="flex flex-col items-center bg-white p-2 rounded-3xl transition-all hover:scale-110 active:scale-95">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* IMAGEN PURA SIN CUADROS NI SOMBRAS PARA PERDERSE CON EL FONDO */}
        <img src={getAnimalImageUrl(a.code)} className="w-full h-full object-contain" alt="" crossOrigin="anonymous" />
        
        {/* ICONO DE ESTADO MINIMALISTA */}
        <div className="absolute top-0 right-0 p-1">
          {status === 'hot' && <Flame className="text-orange-500 fill-orange-500 size-5 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />}
          {status === 'cold' && <Snowflake className="text-blue-400 size-5 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />}
          {status === 'caged' && <Lock className="text-slate-800 size-5" />}
        </div>
      </div>
      
      {/* INFO TÉCNICA (NOMBRE Y NÚMERO YA ESTÁN EN LA FOTO) */}
      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
        {status === 'caged' ? `${a.daysSinceLast} DÍAS` : `${a.count} HITS`}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. SELECTOR DE LOTERÍA PROFESIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> BÚNKER ANALÍTICO
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análisis de flujo 72h - Deep Data</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. RECOMENDACIÓN DE ALTO IMPACTO */}
            <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
               <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12" />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-yellow-400 p-1 rounded-lg">
                      <Zap size={18} className="fill-slate-900 text-slate-900" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sugerencia de Inteligencia Maestro</span>
                  </div>
                  <p className="text-xl lg:text-2xl font-black italic uppercase leading-tight max-w-[90%]">
                    {recommendation}
                  </p>
               </div>
            </div>

            {/* 3. ESTADOS TÉRMICOS (CALIENTE, FRÍO, ENJAULADO) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-orange-600 mb-6 flex items-center justify-center gap-1 bg-orange-50 py-2 rounded-full">
                  <Flame size={14} /> Calientes
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {hotAnimals.map(a => <StatusCard key={a.code} a={a} status="hot" />)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-6 flex items-center justify-center gap-1 bg-blue-50 py-2 rounded-full">
                  <Snowflake size={14} /> Fríos
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {coldAnimals.map(a => <StatusCard key={a.code} a={a} status="cold" />)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-6 flex items-center justify-center gap-1 bg-slate-100 py-2 rounded-full">
                  <Lock size={14} /> Enjaulados
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {cagedAnimals.map(a => <StatusCard key={a.code} a={a} status="caged" />)}
                </div>
              </div>
            </div>
          </div>

          {/* 4. COLUMNA DE DATOS DE TIEMPO (HORAS Y DÍAS) */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl h-full border-b-8 border-emerald-500">
              <div className="space-y-10">
                <div>
                  <h4 className="font-black text-xs uppercase text-emerald-400 mb-6 italic flex items-center gap-2 tracking-widest">
                    <Clock size={16} /> Horarios de Acierto
                  </h4>
                  <div className="space-y-4">
                    {bestHours.map((h, i) => (
                      <div key={h.time} className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                           {i === 0 && <Star className="size-3 text-yellow-400 fill-yellow-400" />}
                           <span className="font-mono text-lg font-black">{h.time}</span>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-500 text-slate-900 px-3 py-1 rounded-full uppercase">
                          {h.count} hits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase text-emerald-400 mb-6 italic flex items-center gap-2 tracking-widest">
                    <Calendar size={16} /> Días de Fuerza
                  </h4>
                  <div className="space-y-4">
                    {bestDays.map((d, i) => (
                      <div key={d.day} className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-sm font-black uppercase italic tracking-tighter">{d.day}</span>
                        <div className="flex items-center gap-1">
                           <div className={`h-2 w-12 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                           <span className="text-[10px] font-black text-white/40">TOP {i+1}</span>
                        </div>
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
