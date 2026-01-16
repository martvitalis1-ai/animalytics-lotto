import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Sparkles, RefreshCw, Loader2, TrendingUp, Flame, Snowflake, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING, DRAW_TIMES } from '@/lib/constants';
import { calculateProbabilities, AnalysisResult } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";
import { CAGED_NUMBERS } from '@/data/historyBatch';

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, AnalysisResult[]>>({});
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
        
        for (const lottery of LOTTERIES) {
          const predictions = calculateProbabilities(history, lottery.id);
          allPredictions[lottery.id] = predictions.slice(0, 6);
          
          // Predicciones por hora
          allHourlyPredictions[lottery.id] = {};
          for (const time of DRAW_TIMES) {
            const hourlyHistory = history.filter(h => h.draw_time === time);
            if (hourlyHistory.length > 0) {
              const hourlyPreds = calculateProbabilities(hourlyHistory, lottery.id);
              allHourlyPredictions[lottery.id][time] = hourlyPreds.slice(0, 3);
            }
          }
        }
        
        setPredictions(allPredictions);
        setHourlyPredictions(allHourlyPredictions);
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
            analysis_notes: `Análisis basado en ${history.length} sorteos históricos`
          });
        }
        
        toast.success("Predicciones actualizadas");
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
      case 'OVERDUE': return <Clock className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'HOT': return 'status-hot';
      case 'COLD': return 'status-cold';
      case 'OVERDUE': return 'status-overdue';
      default: return 'status-neutral';
    }
  };

  const toggleLottery = (lotteryId: string) => {
    setExpandedLottery(expandedLottery === lotteryId ? null : lotteryId);
  };

  // Obtener Ricardo predictions por hora
  const getRicardoPredictionForTime = (lotteryId: string, time: string) => {
    return ricardoPredictions.find(p => p.lottery_type === lotteryId && p.draw_time === time);
  };

  return (
    <div className="space-y-4">
      {/* Header con actualización */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">IA Predictiva</h2>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button 
          onClick={generatePredictions} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2">Actualizar</span>
        </Button>
      </div>

      {/* Predicciones de IA + Dato Ricardo por lotería */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const lotteryPredictions = predictions[lottery.id] || [];
          const lotteryRicardo = ricardoPredictions.filter(p => p.lottery_type === lottery.id);
          const cagedNums = CAGED_NUMBERS[lottery.id] || [];
          const isExpanded = expandedLottery === lottery.id;
          const hourlyPreds = hourlyPredictions[lottery.id] || {};
          
          return (
            <Card key={lottery.id} className="glass-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(lottery.id)} alt="" className="w-8 h-8" />
                    <CardTitle className="text-sm font-bold">{lottery.name}</CardTitle>
                  </div>
                  {cagedNums.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent/30 text-accent-foreground rounded">
                      🔒 Enjaulados
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Predicciones generales de IA */}
                {lotteryPredictions.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Predicción IA General
                    </div>
                    {lotteryPredictions.slice(0, 3).map((pred, idx) => (
                      <div 
                        key={pred.number}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          idx === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                        }`}
                      >
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
                            <span className="text-xs text-muted-foreground truncate max-w-20">
                              {pred.animal}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${getStatusClass(pred.status)}`}>
                            {getStatusIcon(pred.status)}
                            {pred.status}
                          </span>
                          <p className="text-xs font-bold">{pred.probability.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    {loading ? 'Calculando...' : 'Sin datos suficientes'}
                  </p>
                )}

                {/* Dato Ricardo del día */}
                {lotteryRicardo.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Dato Ricardo - Hoy
                    </div>
                    {lotteryRicardo.map((p) => (
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
                    <Button variant="outline" size="sm" className="w-full">
                      <Clock className="w-4 h-4 mr-2" />
                      Pronósticos por Hora
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    <div className="max-h-60 overflow-y-auto space-y-2 p-1">
                      {DRAW_TIMES.map((time) => {
                        const hourPreds = hourlyPreds[time] || [];
                        const ricardoPred = getRicardoPredictionForTime(lottery.id, time);
                        
                        if (hourPreds.length === 0 && !ricardoPred) return null;
                        
                        return (
                          <div key={time} className="p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{time}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {/* Predicciones IA por hora */}
                              {hourPreds.map((pred, i) => (
                                <span 
                                  key={`ai-${i}`}
                                  className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs font-mono font-bold flex items-center gap-0.5"
                                  title="Predicción IA"
                                >
                                  <Brain className="w-2.5 h-2.5" />
                                  {pred.number.padStart(2, '0')}
                                </span>
                              ))}
                              {/* Ricardo por hora */}
                              {ricardoPred?.predicted_numbers?.map((n: string, i: number) => (
                                <span 
                                  key={`ricardo-${i}`}
                                  className="px-1.5 py-0.5 bg-accent/30 text-accent-foreground rounded text-xs font-mono font-bold flex items-center gap-0.5"
                                  title="Dato Ricardo"
                                >
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {n.padStart(2, '0')}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Números enjaulados */}
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
