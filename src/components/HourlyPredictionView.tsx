import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, Flame, Snowflake, Lock, TrendingUp, Calendar, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';

export function HourlyPredictionView({ lotteryId: externalLotteryId, onLotteryChange }: any) {
  const [selectedLottery, setSelectedLottery] = useState(externalLotteryId || 'lotto_activo');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({ hot: [], cold: [], caged: [], bestHours: [], bestDays: [], rec: '' });

  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .limit(300);

      if (!results || results.length === 0) return;

      const freq: Record<string, number> = {};
      const lastSeen: Record<string, string> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};
      const today = new Date().toISOString().split('T')[0];

      results.forEach((r: any) => {
        const num = r.result_number?.toString().trim();
        const normalized = (num === '00' || num === '0') ? num : num.padStart(2, '0');
        freq[normalized] = (freq[normalized] || 0) + 1;
        if (!lastSeen[normalized]) lastSeen[normalized] = r.draw_date;
        hourFreq[r.draw_time] = (hourFreq[r.draw_time] || 0) + 1;
        const dName = new Date(r.draw_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        dayFreq[dName] = (dayFreq[dName] || 0) + 1;
      });

      const sorted = Object.entries(freq).map(([code, count]) => {
        const diff = Math.floor((new Date(today).getTime() - new Date(lastSeen[code]).getTime()) / (86400000));
        return { code, count, daysSinceLast: diff };
      }).sort((a, b) => b.count - a.count);

      setStats({
        hot: sorted.slice(0, 4),
        cold: [...sorted].reverse().slice(0, 4),
        caged: sorted.filter(a => a.daysSinceLast >= 5).slice(0, 4),
        bestHours: Object.entries(hourFreq).sort((a,b)=>b[1]-a[1]).slice(0, 4).map(h => h[0]),
        bestDays: Object.entries(dayFreq).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(d => d[0]),
        rec: `IA detecta ciclo de repetición favorable para ${getAnimalName(sorted[0].code)}.`
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { analyzeData(); }, [selectedLottery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* CABECERA Y SELECTOR PROFESIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-200">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900">Análisis Búnker</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedLottery.replace('_',' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); onLotteryChange?.(v); }}>
            <SelectTrigger className="w-[220px] h-12 rounded-2xl border-none bg-white font-black uppercase text-xs shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={analyzeData} variant="white" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border-none">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* RECOMENDACIÓN MAESTRA */}
            <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
               <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12" />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={18} className="fill-yellow-300 text-yellow-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recomendación de Inteligencia</span>
                  </div>
                  <p className="text-xl lg:text-2xl font-black italic uppercase leading-tight">{stats.rec}</p>
               </div>
            </div>

            {/* ESTADOS TÉRMICOS SIN SOMBRAS DE CUADRO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-orange-600 mb-6 bg-orange-50 py-2 rounded-full">🔥 Calientes</p>
                <div className="grid grid-cols-2 gap-4">
                  {stats.hot.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="HOT" />)}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-blue-600 mb-6 bg-blue-50 py-2 rounded-full">❄️ Fríos</p>
                <div className="grid grid-cols-2 gap-4">
                  {stats.cold.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="COLD" />)}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-6 bg-slate-100 py-2 rounded-full">⛓️ Enjaulados</p>
                <div className="grid grid-cols-2 gap-4">
                  {stats.caged.map((a: any) => <RichAnimalCard key={a.code} code={a.code} status="OVERDUE" />)}
                </div>
              </div>
            </div>
          </div>

          {/* WIDGETS DE PODER (HORAS Y DÍAS) */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl border-b-8 border-emerald-500">
              <h4 className="font-black text-xs uppercase text-emerald-400 mb-8 italic flex items-center gap-2"><Clock size={16} /> Horarios de Poder</h4>
              <div className="space-y-4">
                {stats.bestHours.map((h: string) => (
                  <div key={h} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-xl font-black">{h}</span>
                    <span className="text-emerald-400 font-black text-[10px] uppercase">Alta Frecuencia</span>
                  </div>
                ))}
              </div>

              <h4 className="font-black text-xs uppercase text-emerald-400 mt-12 mb-8 italic flex items-center gap-2"><Calendar size={16} /> Días de Acierto</h4>
              <div className="space-y-4">
                {stats.bestDays.map((d: string) => (
                  <div key={d} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-sm font-black uppercase italic">{d}</span>
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
