import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Sparkles, RefreshCw, Loader2, Flame, Snowflake, Clock, ChevronDown, ChevronUp, AlertTriangle, Info, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { AnalysisResult } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";
import { CAGED_NUMBERS } from '@/data/historyBatch';
import { RichAnimalCard, RichAnimalCardCompact } from './RichAnimalCard';
import { AnimalEmoji } from './AnimalImage';
import { 
  getCachedPredictions, 
  getAllCachedPredictions, 
  getTodayDate,
  CachedPrediction,
  getAccuracyStats,
  loadLearningData
} from '@/lib/predictionCache';
import { generateBrainPredictions, BrainPrediction } from '@/lib/brainEngine';
import { LEARNING_START_DATE } from '@/lib/hypothesisEngine';

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, CachedPrediction>>({});
  const [ricardoPredictions, setRicardoPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);
  const [hourlyPredictions, setHourlyPredictions] = useState<Record<string, Record<string, CachedPrediction>>>({});
  const [accuracyStats, setAccuracyStats] = useState<{ overall: number; streak: number }>({ overall: 0, streak: 0 });
  const [cacheDate, setCacheDate] = useState<string>('');
  const [brainPredictions, setBrainPredictions] = useState<Record<string, BrainPrediction[]>>({});
  const [history, setHistory] = useState<any[]>([]);

  // Load history with Supabase Realtime
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .gte('draw_date', LEARNING_START_DATE)
        .order('created_at', { ascending: false });
      
      if (data) {
        setHistory(data);
        console.log(`[AIPredictive] Loaded ${data.length} results since ${LEARNING_START_DATE}`);
      }
    };
    
    loadHistory();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('ai-predictive-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lottery_results' 
      }, (payload) => {
        console.log('[AIPredictive] Realtime update received:', payload.eventType);
        loadHistory();
        // Auto-regenerate predictions on new data
        setTimeout(() => generatePredictions(), 1000);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Genera predicciones usando el sistema de cache determinístico
   * Garantiza consistencia: mismos números durante todo el día
   */
  const generatePredictions = useCallback(async () => {
    setLoading(true);
    
    try {
      if (history && history.length > 10) {
        const allPredictions: Record<string, CachedPrediction> = {};
        const allHourlyPredictions: Record<string, Record<string, CachedPrediction>> = {};
        const allBrainPredictions: Record<string, BrainPrediction[]> = {};
        
        // Generate predictions with cache determinístico + Brain Engine
        for (const lottery of LOTTERIES) {
          const { general, hourly } = getAllCachedPredictions(history, lottery.id);
          allPredictions[lottery.id] = general;
          allHourlyPredictions[lottery.id] = hourly;
          
          // Brain Engine V6.0 predictions
          const brainPreds = await generateBrainPredictions(lottery.id, history, 5);
          allBrainPredictions[lottery.id] = brainPreds;
        }
        
        setPredictions(allPredictions);
        setHourlyPredictions(allHourlyPredictions);
        setBrainPredictions(allBrainPredictions);
        setLastUpdate(new Date());
        setCacheDate(getTodayDate());
        
        // Guardar en la base de datos para sincronización
        const today = getTodayDate();
        
        for (const [lotteryId, cached] of Object.entries(allPredictions)) {
          const lottery = LOTTERIES.find(l => l.id === lotteryId);
          
          // Eliminar predicción anterior del día
          await supabase.from('ai_predictions')
            .delete()
            .eq('lottery_type', lotteryId)
            .eq('prediction_date', today);
          
          // Insertar nueva predicción
          await supabase.from('ai_predictions').insert({
            lottery_type: lotteryId,
            prediction_date: today,
            predicted_numbers: cached.predictions.slice(0, 5).map(p => p.number),
            predicted_animals: lottery?.type === 'animals' 
              ? cached.predictions.slice(0, 5).map(p => p.animal)
              : null,
            confidence_score: cached.predictions[0]?.probability || 0,
            analysis_notes: `Análisis IA determinístico. Números vencidos: ${cached.overdueNumbers.length}. Cache: ${cached.historyHash}`
          });

          // Sincronizar cache en la nube
          await supabase.from('daily_predictions_cache')
            .upsert({
              cache_date: today,
              lottery_id: lotteryId,
              draw_time: null,
              predictions: cached,
              history_hash: cached.historyHash
            }, {
              onConflict: 'cache_date,lottery_id,draw_time'
            });
        }
        
        // Actualizar estadísticas de precisión
        const stats = getAccuracyStats();
        setAccuracyStats({ overall: stats.overall, streak: stats.streak });
        
        toast.success("Predicciones actualizadas con consistencia garantizada");
      } else {
        toast.warning("No hay historial suficiente para generar predicciones");
      }
    } catch (error) {
      console.error('Error generando predicciones:', error);
      toast.error("Error al generar predicciones");
    }
    
    setLoading(false);
  }, [history]);

  /**
   * Cargar predicciones de Ricardo
   */
  const loadRicardoPredictions = useCallback(async () => {
    const today = getTodayDate();
    const { data } = await supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .gte('prediction_date', today)
      .order('draw_time', { ascending: true });
    
    setRicardoPredictions(data || []);
  }, []);

  /**
   * Cargar cache existente o generar nuevo
   */
  const loadOrGeneratePredictions = useCallback(async () => {
    const today = getTodayDate();
    
    // Intentar cargar cache de la nube primero
    const { data: cloudCache } = await supabase
      .from('daily_predictions_cache')
      .select('*')
      .eq('cache_date', today);

    if (cloudCache && cloudCache.length > 0) {
      // Usar cache de la nube
      const allPredictions: Record<string, CachedPrediction> = {};
      const allHourlyPredictions: Record<string, Record<string, CachedPrediction>> = {};

      cloudCache.forEach(item => {
        if (!item.draw_time) {
          allPredictions[item.lottery_id] = item.predictions as CachedPrediction;
        } else {
          if (!allHourlyPredictions[item.lottery_id]) {
            allHourlyPredictions[item.lottery_id] = {};
          }
          allHourlyPredictions[item.lottery_id][item.draw_time] = item.predictions as CachedPrediction;
        }
      });

      if (Object.keys(allPredictions).length > 0) {
        setPredictions(allPredictions);
        setHourlyPredictions(allHourlyPredictions);
        setCacheDate(today);
        setLastUpdate(new Date());
        console.log('[AIPredictive] Usando cache de la nube');
        return;
      }
    }

    // Si no hay cache, generar nuevas predicciones
    await generatePredictions();
  }, [generatePredictions]);

  useEffect(() => {
    if (history.length > 0) {
      loadOrGeneratePredictions();
      loadRicardoPredictions();
    }
    
    // Verificar cambio de día
    const checkDateChange = setInterval(() => {
      if (cacheDate && cacheDate !== getTodayDate()) {
        console.log('[AIPredictive] Nuevo día detectado, regenerando...');
        generatePredictions();
      }
    }, 60000); // Verificar cada minuto
    
    return () => clearInterval(checkDateChange);
  }, [loadOrGeneratePredictions, loadRicardoPredictions, cacheDate, generatePredictions, history.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HOT': return <Flame className="w-3 h-3 text-red-500" />;
      case 'COLD': return <Snowflake className="w-3 h-3 text-blue-500" />;
      case 'OVERDUE': return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'HOT': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case 'COLD': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'OVERDUE': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleLottery = (lotteryId: string) => {
    setExpandedLottery(expandedLottery === lotteryId ? null : lotteryId);
  };

  const getRicardoPredictionForTime = (lotteryId: string, time: string) => {
    return ricardoPredictions.find(p => p.lottery_type === lotteryId && p.draw_time === time);
  };

  return (
    <div className="space-y-4">
      {/* Header con actualización */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">IA Predictiva Avanzada</h2>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button 
          onClick={generatePredictions} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2">Actualizar</span>
        </Button>
      </div>

      {/* Indicador de consistencia */}
      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-4 h-4 text-green-600" />
          <div>
            <span className="font-semibold text-green-700 dark:text-green-400">
              Predicciones Bloqueadas para {cacheDate || getTodayDate()}
            </span>
            <p className="text-muted-foreground mt-0.5">
              Los números son consistentes en todos los dispositivos y no cambiarán hasta mañana.
              {accuracyStats.streak > 0 && (
                <span className="ml-2 text-green-600">🔥 Racha: {accuracyStats.streak} aciertos</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Info de cómo funciona */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2 text-xs">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">¿Cómo funciona la IA Predictiva?</p>
            <p className="text-muted-foreground mt-1">
              Analiza patrones históricos, frecuencias por hora y día de semana, usando un algoritmo 
              determinístico que garantiza <strong>los mismos números durante todo el día</strong>. 
              🔥 Calientes | ❄️ Fríos | ⚠️ Vencidos (7+ días sin salir)
            </p>
          </div>
        </div>
      </div>

      {/* Predicciones por lotería */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const cached = predictions[lottery.id];
          const lotteryPredictions = cached?.predictions || [];
          const lotteryOverdue = cached?.overdueNumbers || [];
          const lotteryRicardo = ricardoPredictions.filter(p => p.lottery_type === lottery.id);
          const cagedNums = CAGED_NUMBERS[lottery.id] || [];
          const isExpanded = expandedLottery === lottery.id;
          const hourlyPreds = hourlyPredictions[lottery.id] || {};
          const availableTimes = getDrawTimesForLottery(lottery.id);
          
          return (
            <Card key={lottery.id} className="glass-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(lottery.id)} alt="" className="w-8 h-8" />
                    <CardTitle className="text-sm font-bold">{lottery.name}</CardTitle>
                  </div>
                  {lotteryOverdue.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {lotteryOverdue.length} vencidos
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Predicciones generales */}
                {lotteryPredictions.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Top Predicciones IA
                      <span title="Consistente" className="ml-auto">
                        <Zap className="w-3 h-3 text-amber-500" />
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {lotteryPredictions.slice(0, 3).map((pred, idx) => (
                        <RichAnimalCard
                          key={pred.number}
                          code={pred.number}
                          probability={pred.probability}
                          status={pred.status}
                          rank={idx + 1}
                          size="sm"
                          reason={pred.reason}
                          showProbability
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    {loading ? 'Calculando...' : 'Sin datos suficientes'}
                  </p>
                )}

                {/* Números Vencidos */}
                {lotteryOverdue.length > 0 && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-3 h-3" /> Números Vencidos (7+ días)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {lotteryOverdue.slice(0, 5).map((n) => (
                        <RichAnimalCardCompact
                          key={n.number}
                          code={n.number}
                          status="OVERDUE"
                          probability={n.probability}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dato Ricardo */}
                {lotteryRicardo.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Dato Ricardo - Hoy
                    </div>
                    {lotteryRicardo.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
                        <span className="text-xs text-muted-foreground w-16">{p.draw_time}</span>
                        <div className="flex gap-1">
                          {p.predicted_numbers?.map((n: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-accent text-accent-foreground rounded font-mono font-bold text-sm">
                              {n.padStart(2, '0')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para desplegar horas */}
                <Collapsible open={isExpanded} onOpenChange={() => toggleLottery(lottery.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full active:scale-95 transition-transform"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Pronósticos por Hora
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    <div className="max-h-60 overflow-y-auto space-y-2 p-1">
                      {availableTimes.map((time) => {
                        const hourCached = hourlyPreds[time];
                        const hourPreds = hourCached?.predictions || [];
                        const ricardoPred = getRicardoPredictionForTime(lottery.id, time);
                        
                        if (hourPreds.length === 0 && !ricardoPred) return null;
                        
                        return (
                          <div key={time} className="p-2 bg-muted/30 rounded-lg border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {time}
                              </span>
                              <span title="Bloqueado">
                                <Lock className="w-2.5 h-2.5 text-green-500" />
                              </span>
                            </div>
                            <div className="space-y-1">
                              {/* Predicciones IA */}
                              {hourPreds.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {hourPreds.slice(0, 3).map((pred, i) => (
                                    <div 
                                      key={`ai-${i}`}
                                      className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs font-mono font-bold flex items-center gap-0.5"
                                      title={pred.reason}
                                    >
                                      <Brain className="w-2.5 h-2.5" />
                                      {pred.number.padStart(2, '0')}
                                      {getStatusIcon(pred.status)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Explicación */}
                              {hourPreds[0]?.reason && (
                                <p className="text-[9px] text-muted-foreground">
                                  💡 {hourPreds[0].reason}
                                </p>
                              )}
                              {/* Ricardo */}
                              {ricardoPred?.predicted_numbers?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {ricardoPred.predicted_numbers.map((n: string, i: number) => (
                                    <span 
                                      key={`ricardo-${i}`}
                                      className="px-1.5 py-0.5 bg-accent/30 text-accent-foreground rounded text-xs font-mono font-bold flex items-center gap-0.5"
                                    >
                                      <Sparkles className="w-2.5 h-2.5" />
                                      {n.padStart(2, '0')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Números enjaulados */}
                {cagedNums.length > 0 && (
                  <div className="text-[10px] text-muted-foreground pt-2 border-t">
                    🔒 Enjaulados: {cagedNums.slice(0, 5).join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}