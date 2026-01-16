import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, RefreshCw, Loader2, TrendingUp, Flame, Snowflake, Clock } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { calculateProbabilities, AnalysisResult } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, AnalysisResult[]>>({});
  const [ricardoPredictions, setRicardoPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
        
        for (const lottery of LOTTERIES) {
          const predictions = calculateProbabilities(history, lottery.id);
          allPredictions[lottery.id] = predictions.slice(0, 6);
        }
        
        setPredictions(allPredictions);
        setLastUpdate(new Date());
        
        // Guardar predicciones en la base de datos
        const today = new Date().toISOString().split('T')[0];
        
        for (const [lotteryId, preds] of Object.entries(allPredictions)) {
          const lottery = LOTTERIES.find(l => l.id === lotteryId);
          
          // Eliminar predicción anterior del mismo día/lotería
          await supabase.from('ai_predictions')
            .delete()
            .eq('lottery_type', lotteryId)
            .eq('prediction_date', today);
          
          // Insertar nueva predicción
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

      {/* Predicciones de Dato Ricardo para hoy */}
      {ricardoPredictions.length > 0 && (
        <Card className="glass-card border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Pronósticos de Dato Ricardo - HOY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {ricardoPredictions.map((p) => {
                const lottery = LOTTERIES.find(l => l.id === p.lottery_type);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                    <img src={getLotteryLogo(p.lottery_type)} alt="" className="w-6 h-6" />
                    <span className="font-semibold text-sm min-w-24">{lottery?.name}</span>
                    <span className="text-xs text-muted-foreground">{p.draw_time}</span>
                    <div className="flex gap-1 ml-auto">
                      {p.predicted_numbers?.map((n: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-accent text-accent-foreground rounded font-mono font-bold text-sm">
                          {n.padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predicciones de IA por lotería */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const lotteryPredictions = predictions[lottery.id] || [];
          
          return (
            <Card key={lottery.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(lottery.id)} alt="" className="w-8 h-8" />
                  <CardTitle className="text-sm font-bold">{lottery.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {lotteryPredictions.length > 0 ? (
                  <div className="space-y-2">
                    {lotteryPredictions.map((pred, idx) => (
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
                          <div className="text-right">
                            <p className="text-xs font-bold">{pred.probability.toFixed(1)}%</p>
                            <p className="text-[10px] text-muted-foreground">
                              {pred.frequency}× · {pred.daysSince}d
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    {loading ? 'Calculando...' : 'Sin datos suficientes'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
