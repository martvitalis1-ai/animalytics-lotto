import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Sparkles, Brain, ArrowRight, Loader2 } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING, getDrawTimesForLottery } from '@/lib/constants';
import { calculateCrossFormulas, calculateProbabilities } from '@/lib/probabilityEngine';
import { getLotteryLogo } from "./LotterySelector";
import { supabase } from "@/integrations/supabase/client";

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

        {/* Resultados de Fórmulas Matemáticas */}
        {predictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold">Fórmulas Matemáticas</h3>
            </div>
            <div className="grid gap-2">
              {predictions.map((pred, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg">
                  <span className="font-mono font-black text-xl text-amber-600 dark:text-amber-400 w-8">
                    {pred.number.padStart(2, '0')}
                  </span>
                  {lottery?.type === 'animals' && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      ({ANIMAL_MAPPING[pred.number] || ANIMAL_MAPPING[parseInt(pred.number).toString()] || ''})
                    </span>
                  )}
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex-1">{pred.formula}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predicciones de IA */}
        {aiPredictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">Predicción IA Combinada</h3>
            </div>
            <div className="grid gap-2">
              {aiPredictions.map((pred, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    idx === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-muted/50'
                  }`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-mono font-black text-xl w-8">
                    {pred.number.padStart(2, '0')}
                  </span>
                  {lottery?.type === 'animals' && (
                    <span className="text-xs text-muted-foreground">
                      ({ANIMAL_MAPPING[pred.number] || ANIMAL_MAPPING[parseInt(pred.number).toString()] || ''})
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex-1 text-right">{pred.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}