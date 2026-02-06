import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Sparkles, Brain, Loader2, Zap, Trophy, Lock } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { supabase } from "@/integrations/supabase/client";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateUniBrainPredictions, UniBrainPrediction } from '@/lib/unibrain';
import { LEARNING_START_DATE } from '@/lib/hypothesisEngine';

export function QuickPrediction() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [lastResults, setLastResults] = useState<string[]>(['', '', '', '']);
  const [predictions, setPredictions] = useState<UniBrainPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  const updateResult = (index: number, value: string) => {
    const newResults = [...lastResults];
    newResults[index] = value.replace(/\D/g, '').slice(0, 2);
    setLastResults(newResults);
  };

  const generatePrediction = async () => {
    const validResults = lastResults.filter(r => r.trim() !== '');
    if (validResults.length < 2) {
      return;
    }

    setLoading(true);

    // Obtener historial completo desde LEARNING_START_DATE
    const { data: history } = await supabase
      .from('lottery_results')
      .select('*')
      .gte('draw_date', LEARNING_START_DATE)
      .order('created_at', { ascending: false });

    if (history) {
      // UNIBRAIN V5.1 - Algoritmo unificado con Regla del 19
      const uniBrainPreds = await generateUniBrainPredictions(
        validResults,
        selectedLottery,
        history
      );
      
      setPredictions(uniBrainPreds);
    }

    setLoading(false);
  };

  return (
    <Card className="glass-card border-2 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Predicción Rápida con Fórmulas
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresa los últimos 4 resultados de una lotería y la IA aplicará fórmulas matemáticas 
          (sumas cruzadas, reducciones digitales, restas) para predecir el próximo número.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de Lotería */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Lotería</label>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="bg-background">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(selectedLottery)} alt="" className="w-5 h-5" />
                  <span>{lottery?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                    <span>{l.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inputs para los últimos 4 resultados */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Últimos 4 resultados (del más reciente al más antiguo)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {lastResults.map((result, index) => (
              <div key={index} className="space-y-1">
                <span className="text-[10px] text-muted-foreground text-center block">
                  {index === 0 ? 'Último' : index === 1 ? 'Anterior' : `Hace ${index + 1}`}
                </span>
                <Input
                  type="text"
                  value={result}
                  onChange={(e) => updateResult(index, e.target.value)}
                  placeholder="00"
                  className="text-center font-mono font-bold text-lg h-12"
                  maxLength={2}
                />
                {result && lottery?.type === 'animals' && (
                  <span className="text-[10px] text-muted-foreground text-center block truncate">
                    {ANIMAL_MAPPING[result] || ANIMAL_MAPPING[parseInt(result).toString()] || ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Predicción */}
        <Button 
          onClick={generatePrediction}
          disabled={loading || lastResults.filter(r => r.trim()).length < 2}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Calcular Predicción
        </Button>

        {/* Resultados Finales TOP 5 - Sin fórmulas, solo resultados */}
        {predictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold">Top 5 UNIBRAIN</h3>
                <Lock className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                Algoritmo V5.1
              </span>
            </div>
            
            {/* Grid de resultados - Solo números, sin fórmulas */}
            <div className="grid grid-cols-5 gap-2">
              {predictions.slice(0, 5).map((pred, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                    idx === 0 
                      ? 'bg-amber-500/20 border-amber-500/50' 
                      : pred.confidence === 'HIGH'
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/30 border-border'
                  }`}
                >
                  <span className="text-2xl mb-1">{pred.emoji}</span>
                  <span className={`font-mono font-black text-xl ${
                    idx === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                  }`}>
                    {pred.code.padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-muted-foreground text-center truncate w-full mt-0.5">
                    {pred.name}
                  </span>
                  {/* Indicador de confianza sin mostrar fórmula */}
                  <span className={`text-[8px] mt-1 px-1.5 py-0.5 rounded ${
                    pred.confidence === 'HIGH' 
                      ? 'bg-primary/20 text-primary' 
                      : pred.confidence === 'MEDIUM'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50 text-muted-foreground/70'
                  }`}>
                    {pred.probability}%
                  </span>
                </div>
              ))}
            </div>

            {/* Leyenda sin revelar fórmulas */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Procesado con UNIBRAIN
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Regla del 19 activa
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}