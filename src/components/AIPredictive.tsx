import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Sparkles, RefreshCw, Loader2, Flame, Snowflake, Clock, ChevronDown, ChevronUp, AlertTriangle, Info, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { CAGED_NUMBERS } from '@/data/historyBatch';
import { RichAnimalCard } from './RichAnimalCard';
import { 
  getAllCachedPredictions, 
  getTodayDate,
  CachedPrediction,
  getAccuracyStats
} from '@/lib/predictionCache';

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, CachedPrediction>>({});
  const [ricardoPredictions, setRicardoPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);
  const [hourlyPredictions, setHourlyPredictions] = useState<Record<string, Record<string, CachedPrediction>>>({});
  const [accuracyStats, setAccuracyStats] = useState<{ overall: number; streak: number }>({ overall: 0, streak: 0 });
  const [cacheDate, setCacheDate] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  // 1. ABSORCIÓN TOTAL DE SUPABASE (SIN FILTROS DE FECHA)
  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000); // Succionamos todo el historial para la malicia
    
    if (data) {
      setHistory(data);
      console.log(`[AIPredictive] Búnker cargado con ${data.length} resultados.`);
    }
  }, []);

  const generatePredictions = useCallback(async () => {
    if (!history || history.length === 0) return;
    setLoading(true);
    
    try {
      const allPredictions: Record<string, CachedPrediction> = {};
      const allHourlyPredictions: Record<string, Record<string, CachedPrediction>> = {};
      
      for (const lottery of LOTTERIES) {
        const { general, hourly } = getAllCachedPredictions(history, lottery.id);
        allPredictions[lottery.id] = general;
        allHourlyPredictions[lottery.id] = hourly;
      }
      
      setPredictions(allPredictions);
      setHourlyPredictions(allHourlyPredictions);
      setLastUpdate(new Date());
      setCacheDate(getTodayDate());
      
      const stats = getAccuracyStats();
      setAccuracyStats({ overall: stats.overall, streak: stats.streak });

    } catch (error) {
      console.error('Error generando malicia:', error);
    }
    setLoading(false);
  }, [history]);

  useEffect(() => {
    loadHistory();
    const channel = supabase.channel('ai-realtime-master')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadHistory())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadHistory]);

  useEffect(() => {
    if (history.length > 0) generatePredictions();
  }, [history, generatePredictions]);

  const toggleLottery = (lotteryId: string) => {
    setExpandedLottery(expandedLottery === lotteryId ? null : lotteryId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HOT': return <Flame className="w-3 h-3 text-red-500" />;
      case 'COLD': return <Snowflake className="w-3 h-3 text-blue-500" />;
      case 'OVERDUE': return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Header con estilo de Jefe */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary animate-pulse" />
          <h2 className="font-black text-2xl tracking-tighter uppercase italic text-primary">IA Predictiva Avanzada</h2>
        </div>
        <Button onClick={generatePredictions} disabled={loading} variant="outline" size="sm" className="font-black border-primary/30 shadow-sm active:scale-95 transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          ACTUALIZAR BÚNKER
        </Button>
      </div>

      {/* Indicador de racha y consistencia */}
      <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-2xl flex items-center gap-4">
        <Lock className="w-6 h-6 text-green-600" />
        <div>
          <span className="font-black text-green-700 dark:text-green-400 uppercase tracking-tighter text-sm">Predicciones Blindadas - {cacheDate || getTodayDate()}</span>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Los números han sido calculados mediante frecuencia histórica y no cambiarán hoy.</p>
        </div>
        {accuracyStats.streak > 0 && (
          <div className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full font-black text-xs animate-bounce shadow-lg">🔥 RACHA: {accuracyStats.streak}</div>
        )}
      </div>

      {/* Grid de Loterías - Recuperado y Completo */}
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
                    <img src={getLotteryLogo(lottery.id)} alt="" className="w-10 h-10 rounded-full shadow-md border-2 border-white" />
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
                    <p className="text-[10px] font-black uppercase">Sincronizando Malicia...</p>
                  </div>
                )}

                <Collapsible open={isExpanded} onOpenChange={() => toggleLottery(lottery.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/10">
                      {isExpanded ? <ChevronUp className="mr-2 w-4 h-4"/> : <ChevronDown className="mr-2 w-4 h-4"/>}
                      {isExpanded ? 'Ocultar Detalles' : 'Ver Análisis por Hora'}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-h-60 overflow-y-auto space-y-2 p-1 custom-scrollbar">
                      {availableTimes.map((time) => (
                        <div key={time} className="p-2 bg-card border-2 rounded-xl flex items-center justify-between shadow-sm">
                           <span className="text-[10px] font-black uppercase flex items-center gap-1"><Clock className="w-3 h-3 text-primary"/> {time}</span>
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
