import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Sparkles, RefreshCw, Loader2, Flame, Snowflake, Clock, ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { calculateProbabilities, getOverdueNumbers, AnalysisResult } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";
import { CAGED_NUMBERS } from '@/data/historyBatch';

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, AnalysisResult[]>>({});
  const [overdueByLottery, setOverdueByLottery] = useState<Record<string, AnalysisResult[]>>({});
  const [ricardoPredictions, setRicardoPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);
  const [hourlyPredictions, setHourlyPredictions] = useState<Record<string, Record<string, AnalysisResult[]>>>({});

  const generatePredictions = async () => {
    setLoading(true);
    
    try {
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (history) {
        const allPredictions: Record<string, AnalysisResult[]> = {};
        const allHourlyPredictions: Record<string, Record<string, AnalysisResult[]>> = {};
        const allOverdue: Record<string, AnalysisResult[]> = {};
        
        for (const lottery of LOTTERIES) {
          // Predicciones generales
          const preds = calculateProbabilities(history, lottery.id);
          allPredictions[lottery.id] = preds.slice(0, 6);
          
          // Números vencidos
          const overdue = getOverdueNumbers(history, lottery.id, 7);
          allOverdue[lottery.id] = overdue.slice(0, 6);
          
          // Predicciones por hora específica
          allHourlyPredictions[lottery.id] = {};
          const times = getDrawTimesForLottery(lottery.id);
          
          for (const time of times) {
            const hourlyHistory = history.filter(h => h.lottery_type === lottery.id && h.draw_time === time);
            if (hourlyHistory.length > 0) {
              const hourlyPreds = calculateProbabilities(hourlyHistory, lottery.id, time);
              allHourlyPredictions[lottery.id][time] = hourlyPreds.slice(0, 3);
            }
          }
        }
        
        setPredictions(allPredictions);
        setHourlyPredictions(allHourlyPredictions);
        setOverdueByLottery(allOverdue);
        setLastUpdate(new Date());
        
        // Guardar predicciones en la base de datos
        const today = new Date().toISOString().split('T')[0];
        
        for (const [lotteryId, preds] of Object.entries(allPredictions)) {
          const lottery = LOTTERIES.find(l => l.id === lotteryId);
          
          await supabase.from('ai_predictions')
            .delete()
            .eq('lottery_type', lotteryId)
            .eq('prediction_date', today);
          
          await supabase.from('ai_predictions').insert({
            lottery_type: lotteryId,
            prediction_date: today,
            predicted_numbers: preds.slice(0, 5).map(p => p.number),
            predicted_animals: lottery?.type === 'animals' 
              ? preds.slice(0, 5).map(p => p.animal)
              : null,
            confidence_score: preds[0]?.probability || 0,
            analysis_notes: `Análisis IA con patrones temporales y ${history.length} sorteos. Números vencidos: ${allOverdue[lotteryId]?.length || 0}`
          });
        }
        
        toast.success("Predicciones actualizadas con análisis avanzado");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al generar predicciones");
    }
    
    setLoading(false);
  };

  const loadRicardoPredictions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .gte('prediction_date', today)
      .order('draw_time', { ascending: true });
    
    setRicardoPredictions(data || []);
  };

  useEffect(() => {
    generatePredictions();
    loadRicardoPredictions();
  }, []);

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

      {/* Info de cómo funciona */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2 text-xs">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">¿Cómo funciona la IA Predictiva?</p>
            <p className="text-muted-foreground mt-1">
              Analiza patrones históricos, frecuencias por hora, día de semana, y aplica algoritmos de probabilidad 
              para identificar números calientes (🔥), fríos (❄️) y vencidos (⚠️). Los pronósticos se actualizan 
              con cada nuevo dato y varían según la hora del día.
            </p>
          </div>
        </div>
      </div>

      {/* Predicciones por lotería */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const lotteryPredictions = predictions[lottery.id] || [];
          const lotteryOverdue = overdueByLottery[lottery.id] || [];
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
                    </div>
                    {lotteryPredictions.slice(0, 3).map((pred, idx) => (
                      <div 
                        key={pred.number}
                        className={`p-2 rounded-lg border ${
                          idx === 0 ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                              idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-mono font-black text-lg">
                              {pred.number.padStart(2, '0')}
                            </span>
                            {lottery.type === 'animals' && (
                              <span className="text-xs text-muted-foreground truncate max-w-16">
                                {pred.animal}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 border ${getStatusClass(pred.status)}`}>
                              {getStatusIcon(pred.status)}
                              {pred.status}
                            </span>
                          </div>
                        </div>
                        {pred.reason && (
                          <p className="text-[10px] text-muted-foreground mt-1 pl-8">
                            {pred.reason}
                          </p>
                        )}
                      </div>
                    ))}
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
                        <div 
                          key={n.number}
                          className="px-2 py-1 bg-amber-500/20 rounded text-center"
                          title={`${n.daysSince} días sin salir`}
                        >
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                            {n.number.padStart(2, '0')}
                          </span>
                          <span className="text-[9px] text-amber-600 ml-1">
                            ({n.daysSince}d)
                          </span>
                        </div>
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
                        const hourPreds = hourlyPreds[time] || [];
                        const ricardoPred = getRicardoPredictionForTime(lottery.id, time);
                        
                        if (hourPreds.length === 0 && !ricardoPred) return null;
                        
                        return (
                          <div key={time} className="p-2 bg-muted/30 rounded-lg border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {time}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {/* Predicciones IA */}
                              {hourPreds.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {hourPreds.map((pred, i) => (
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

                {/* Enjaulados */}
                {cagedNums.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="text-[10px] text-muted-foreground mb-1">🔒 Enjaulados:</div>
                    <div className="flex flex-wrap gap-1">
                      {cagedNums.slice(0, 6).map((n) => (
                        <span key={n} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-xs font-mono font-bold">
                          {n.padStart(2, '0')}
                        </span>
                      ))}
                    </div>
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