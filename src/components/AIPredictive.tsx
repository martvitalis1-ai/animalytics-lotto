import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, RefreshCw, Loader2, Clock, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { RichAnimalCard } from './RichAnimalCard';
import {
  getTodayDate,
  CachedPrediction,
} from '@/lib/predictionCache';
import { getAnimalName } from '@/lib/animalData';

const normalizeCode = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (str === '0' || str === '00') return str;
  const num = Number(str);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(99, num)).toString();
};

const buildCached = (lotteryId: string, rows: any[]): CachedPrediction => {
  const today = getTodayDate();

  const mapped = rows.flatMap((row: any) => {
    const base = Math.max(1, Math.min(99, Math.floor(Number(row?.power_score ?? 80))));
    const items = [
      { code: normalizeCode(row?.pronostico_dia), reason: 'Pronóstico día', probability: base, status: 'HOT' },
      { code: normalizeCode(row?.pronostico_jaladera), reason: 'Pronóstico jaladera', probability: Math.max(1, base - 4), status: 'OVERDUE' },
      { code: normalizeCode(row?.pronostico_fijo), reason: 'Pronóstico fijo', probability: Math.max(1, base - 8), status: 'COLD' },
    ];

    return items
      .filter((item) => !!item.code)
      .map((item) => ({
        number: item.code as string,
        animal: getAnimalName(item.code as string) || `Animal ${(item.code as string).padStart(2, '0')}`,
        probability: item.probability,
        status: item.status as 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL',
        frequency: 0,
        daysSince: 0,
        reason: item.reason,
      }));
  });

  const deduped = mapped.filter((item, index, arr) => {
    return arr.findIndex((x) => x.number === item.number) === index;
  });

  return {
    date: today,
    lotteryId,
    predictions: deduped.slice(0, 10),
    overdueNumbers: deduped.filter((x) => x.status === 'OVERDUE').slice(0, 10),
    hotNumbers: deduped.filter((x) => x.status === 'HOT').slice(0, 10),
    coldNumbers: deduped.filter((x) => x.status === 'COLD').slice(0, 10),
    generatedAt: Date.now(),
    historyHash: `super_pronostico_final_${today}`,
  };
};

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, CachedPrediction>>({});
  const [loading, setLoading] = useState(false);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);
  const [accuracyStats, setAccuracyStats] = useState<{ overall: number; streak: number }>({ overall: 0, streak: 0 });
  const [cacheDate, setCacheDate] = useState<string>('');

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('super_pronostico_final')
        .select('*');

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      const byLottery: Record<string, CachedPrediction> = {};

      for (const lottery of LOTTERIES) {
        const lotteryRows = rows.filter((row: any) => {
          const rowLottery = String(row?.lottery_type ?? row?.lottery_id ?? row?.loteria ?? '').trim();
          return rowLottery === lottery.id;
        });

        byLottery[lottery.id] = buildCached(lottery.id, lotteryRows);
      }

      const scores = rows
        .map((row: any) => Number(row?.power_score))
        .filter((n: number) => Number.isFinite(n));

      const overall = scores.length > 0
        ? Math.max(0, Math.min(99, Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)))
        : 0;

      setPredictions(byLottery);
      setAccuracyStats({ overall, streak: rows.length });
      setCacheDate(getTodayDate());
    } catch (error) {
      console.error('Error cargando super_pronostico_final:', error);
      setPredictions({});
      setAccuracyStats({ overall: 0, streak: 0 });
      setCacheDate(getTodayDate());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const toggleLottery = (lotteryId: string) => {
    setExpandedLottery(expandedLottery === lotteryId ? null : lotteryId);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary animate-pulse" />
          <h2 className="font-black text-2xl tracking-tighter uppercase italic text-primary">IA Predictiva Avanzada</h2>
        </div>
        <Button onClick={loadPredictions} disabled={loading} variant="outline" size="sm" className="font-black border-primary/30 shadow-sm active:scale-95 transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          ACTUALIZAR BÚNKER
        </Button>
      </div>

      <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-2xl flex items-center gap-4">
        <Lock className="w-6 h-6 text-green-600" />
        <div>
          <span className="font-black text-green-700 dark:text-green-400 uppercase tracking-tighter text-sm">Predicciones Blindadas - {cacheDate || getTodayDate()}</span>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Fuente: super_pronostico_final · Power Score promedio: {accuracyStats.overall}%</p>
        </div>
        {accuracyStats.streak > 0 && (
          <div className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg">Registros IA: {accuracyStats.streak}</div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const cached = predictions[lottery.id];
          const lotteryPredictions = cached?.predictions || [];
          const isExpanded = expandedLottery === lottery.id;
          const availableTimes = getDrawTimesForLottery(lottery.id);

          return (
            <Card key={lottery.id} className="glass-card border-2 border-primary/10 overflow-hidden shadow-2xl hover:border-primary/30 transition-all">
              <CardHeader className="pb-2 bg-muted/20 border-b">
                <div className="flex items-center gap-3">
                  <img src={getLotteryLogo(lottery.id)} alt={lottery.name} className="w-10 h-10 rounded-full shadow-md border-2 border-white" />
                  <CardTitle className="text-base font-black uppercase tracking-tighter">{lottery.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {lotteryPredictions.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {lotteryPredictions.slice(0, 3).map((pred, idx) => (
                      <RichAnimalCard
                        key={pred.number}
                        code={pred.number}
                        probability={pred.probability}
                        status={pred.status}
                        rank={idx + 1}
                        size="sm"
                        showProbability
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 opacity-40 grayscale">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-[10px] font-black uppercase">Sin datos en super_pronostico_final</p>
                  </div>
                )}

                <Collapsible open={isExpanded} onOpenChange={() => toggleLottery(lottery.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/10">
                      {isExpanded ? <ChevronUp className="mr-2 w-4 h-4" /> : <ChevronDown className="mr-2 w-4 h-4" />}
                      {isExpanded ? 'Ocultar Detalles' : 'Ver Análisis por Hora'}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-h-60 overflow-y-auto space-y-2 p-1 custom-scrollbar">
                      {availableTimes.map((time) => (
                        <div key={time} className="p-2 bg-card border-2 rounded-xl flex items-center justify-between shadow-sm">
                          <span className="text-[10px] font-black uppercase flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {time}</span>
                          <div className="flex gap-1"><Lock className="w-3 h-3 text-green-500 opacity-30" /></div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
