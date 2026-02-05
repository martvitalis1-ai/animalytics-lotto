import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Sparkles, Brain, Loader2, Zap, Trophy } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { calculateCrossFormulas, calculateProbabilities } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";
import { supabase } from "@/integrations/supabase/client";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';

export function QuickPrediction() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [lastResults, setLastResults] = useState<string[]>(['', '', '', '']);
  const [predictions, setPredictions] = useState<{ number: string; formula: string }[]>([]);
  const [aiPredictions, setAiPredictions] = useState<{ number: string; reason: string }[]>([]);
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

    // Fórmulas matemáticas cruzadas
    const mathPredictions = calculateCrossFormulas(validResults);
    setPredictions(mathPredictions.slice(0, 8));

    // Obtener historial y calcular probabilidades con IA
    const { data: history } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('lottery_type', selectedLottery)
      .order('created_at', { ascending: false })
      .limit(200);

    if (history) {
      const aiResults = calculateProbabilities(history, selectedLottery);
      
      // Combinar con las fórmulas matemáticas para dar peso extra
      const mathNumbers = new Set(mathPredictions.map(p => p.number));
      const boostedResults = aiResults.map(r => ({
        ...r,
        probability: mathNumbers.has(r.number) ? r.probability + 20 : r.probability
      })).sort((a, b) => b.probability - a.probability);

      setAiPredictions(boostedResults.slice(0, 5).map(r => ({
        number: r.number,
        reason: r.reason || `Probabilidad: ${r.probability.toFixed(1)}%`
      })));
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
                <h3 className="text-sm font-bold">Top 5 Calculados</h3>
              </div>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                {predictions.length} procesados
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {predictions.slice(0, 5).map((pred, idx) => {
                const emoji = getAnimalEmoji(pred.number);
                const name = getAnimalName(pred.number);
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      idx === 0 
                        ? 'bg-amber-500/20 border-amber-500/50' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <span className="text-2xl mb-1">{emoji}</span>
                    <span className={`font-mono font-black text-xl ${
                      idx === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                    }`}>
                      {pred.number.padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-muted-foreground text-center truncate w-full mt-0.5">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Predicciones de IA */}
        {aiPredictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">Predicción IA Combinada</h3>
              <Zap className="w-3 h-3 text-amber-500" />
            </div>
            <div className="grid gap-2">
              {aiPredictions.map((pred, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    idx === 0 ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/30 border border-border'
                  }`}
                >
                  <span className="text-2xl">{getAnimalEmoji(pred.number)}</span>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-mono font-black text-xl">
                    {pred.number.padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">
                    {getAnimalName(pred.number)}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-1 text-right line-clamp-1">
                    {pred.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}