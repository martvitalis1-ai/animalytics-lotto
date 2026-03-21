import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, Flame, Snowflake, Lock, TrendingUp, Calendar, Star } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
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
      // Fetch last 30 days of results
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: results } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .gte('draw_date', dateStr)
        .order('draw_date', { ascending: false })
        .order('draw_time', { ascending: false });

      const rows = results || [];
      if (rows.length === 0) {
        setHotAnimals([]); setColdAnimals([]); setCagedAnimals([]);
        setBestHours([]); setBestDays([]); setRecommendation('Sin datos suficientes.');
        setLoading(false);
        return;
      }

      // Count frequency per animal
      const freq: Record<string, number> = {};
      const lastSeen: Record<string, string> = {};
      const hourFreq: Record<string, number> = {};
      const dayFreq: Record<string, number> = {};

      const today = new Date().toISOString().split('T')[0];

      rows.forEach((r: any) => {
        const num = r.result_number?.toString().trim();
        if (!num) return;
        const normalized = num === '00' ? '00' : num === '0' ? '0' : num.padStart(2, '0');
        freq[normalized] = (freq[normalized] || 0) + 1;
        if (!lastSeen[normalized]) lastSeen[normalized] = r.draw_date;

        // Hour analysis
        const time = r.draw_time || '';
        hourFreq[time] = (hourFreq[time] || 0) + 1;

        // Day analysis
        const dayOfWeek = new Date(r.draw_date + 'T12:00:00').getDay();
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = dayNames[dayOfWeek] || 'Desconocido';
        dayFreq[dayName] = (dayFreq[dayName] || 0) + 1;
      });

      // Sort by frequency
      const sorted = Object.entries(freq)
        .map(([code, count]) => {
          const last = lastSeen[code] || today;
          const diff = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
          return { code, name: getAnimalName(code), count, daysSinceLast: diff };
        })
        .sort((a, b) => b.count - a.count);

      // Hot = top 5 most frequent
      const hot: AnimalStatus[] = sorted.slice(0, 5).map(a => ({ ...a, status: 'hot' as const }));
      // Cold = bottom 5
      const cold: AnimalStatus[] = sorted.slice(-5).reverse().map(a => ({ ...a, status: 'cold' as const }));
      // Caged = not seen in 7+ days
      const caged: AnimalStatus[] = sorted
        .filter(a => a.daysSinceLast >= 7)
        .slice(0, 5)
        .map(a => ({ ...a, status: 'caged' as const }));

      setHotAnimals(hot);
      setColdAnimals(cold);
      setCagedAnimals(caged);

      // Best hours
      const topHours = Object.entries(hourFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([time, count]) => ({ time, count }));
      setBestHours(topHours);

      // Best days
      const topDays = Object.entries(dayFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day, count]) => ({ day, count }));
      setBestDays(topDays);

      // Recommendation
      const topAnimal = hot[0];
      const topHour = topHours[0];
      const topDay = topDays[0];
      if (topAnimal && topHour && topDay) {
        setRecommendation(
          `El animal más caliente es ${topAnimal.name} (${topAnimal.code}) con ${topAnimal.count} apariciones. ` +
          `La mejor hora es ${topHour.time} y el mejor día es ${topDay.day}. ` +
          (caged.length > 0 ? `Ojo con ${caged[0].name} que lleva ${caged[0].daysSinceLast} días sin salir.` : '')
        );
      } else {
        setRecommendation('Datos insuficientes para generar recomendación.');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { analyzeData(); }, [selectedLottery]);

  const StatusSection = ({ title, icon, animals, color }: { title: string; icon: React.ReactNode; animals: AnimalStatus[]; color: string }) => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <div className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full ${color} w-fit`}>
        {icon}
        <span className="text-white text-xs font-black uppercase">{title}</span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {animals.length > 0 ? animals.map(a => (
          <div key={a.code} className="flex flex-col items-center w-16">
            <img src={getAnimalImageUrl(a.code)} className="w-14 h-14 object-contain" alt={a.name} />
            <span className="text-[9px] font-bold text-slate-500 mt-1">{a.count}x</span>
          </div>
        )) : (
          <p className="text-xs text-slate-400 py-4">Sin datos</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Lottery Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-black text-xl uppercase italic text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Panel de Análisis
        </h2>
        <div className="flex items-center gap-2">
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[200px] h-9 font-bold text-xs border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={analyzeData} variant="outline" size="icon" className="h-9 w-9">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-xs font-bold mt-3 text-slate-400 uppercase">Analizando historial...</p>
        </div>
      ) : (
        <>
          {/* Hot / Cold / Caged */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusSection title="Calientes" icon={<Flame className="w-4 h-4 text-white" />} animals={hotAnimals} color="bg-orange-500" />
            <StatusSection title="Fríos" icon={<Snowflake className="w-4 h-4 text-white" />} animals={coldAnimals} color="bg-blue-500" />
            <StatusSection title="Enjaulados" icon={<Lock className="w-4 h-4 text-white" />} animals={cagedAnimals} color="bg-slate-800" />
          </div>

          {/* Best Hours & Best Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <h4 className="font-black text-xs uppercase text-slate-500 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Mejores Horas
              </h4>
              <div className="space-y-2">
                {bestHours.map((h, i) => (
                  <div key={h.time} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      <span className="font-mono font-bold text-sm">{h.time}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{h.count} sorteos</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <h4 className="font-black text-xs uppercase text-slate-500 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Mejores Días
              </h4>
              <div className="space-y-2">
                {bestDays.map((d, i) => (
                  <div key={d.day} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      <span className="font-bold text-sm">{d.day}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{d.count} sorteos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Recommendation */}
          <div className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/20">
            <h4 className="font-black text-primary text-sm mb-2 flex items-center gap-2">
              🎯 RECOMENDACIÓN DEL SISTEMA
            </h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">{recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}
