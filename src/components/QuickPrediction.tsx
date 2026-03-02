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

    // ABSORCIÓN TOTAL: Quitamos el filtro de fecha (LEARNING_START_DATE) 
    // para que use todo el historial de Supabase (Enero + Marzo)
    const { data: history } = await supabase
      .from('lottery_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000); // Aumentamos el límite para que la IA sea más precisa

    if (history) {
      // UNIBRAIN V5.1 - Mantenemos tu algoritmo original intacto
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
        <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-tighter">
          <Calculator className="w-5 h-5 text-primary" />
          Calculadora UNIBRAIN V5.1
        </CardTitle>
        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
          Ingresa los últimos 4 sorteos. La IA aplicará la Regla del 19 y reducciones digitales.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de Lotería */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase">Lotería</label>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="bg-background font-bold h-10">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(selectedLottery)} alt="" className="w-5 h-5 rounded-full" />
                  <span>{lottery?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2 font-bold">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4 rounded-full" />
                    <span>{l.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inputs para los últimos 4 resultados */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase">
            Secuencia de Resultados (Reciente a Antiguo)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {lastResults.map((result, index) => (
              <div key={index} className="space-y-1">
                <Input
                  type="text"
                  value={result}
                  onChange={(e) => updateResult(index, e.target.value)}
                  placeholder="00"
                  className="text-center font-mono font-black text-xl h-14 bg-primary/5 border-primary/20"
                  maxLength={2}
                />
                {result && lottery?.type === 'animals' && (
                  <span className="text-[9px] font-black text-primary text-center block truncate uppercase">
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
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Procesar con IA
        </Button>

        {/* Resultados Finales TOP 5 */}
        {predictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t-2 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-tighter">Resultados Top 5</h3>
                <Lock className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 bg-muted rounded-full uppercase">
                Búnker Activo
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-1.5">
              {predictions.slice(0, 5).map((pred, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                    idx === 0 
                      ? 'bg-amber-500/20 border-amber-500/50 scale-105 shadow-md' 
                      : 'bg-card border-border shadow-sm'
                  }`}
                >
                  <span className="text-xl mb-1">{pred.emoji}</span>
                  <span className={`font-mono font-black text-lg ${
                    idx === 0 ? 'text-amber-600' : 'text-primary'
                  }`}>
                    {pred.code.padStart(2, '0')}
                  </span>
                  <span className={`text-[8px] mt-1 font-black px-1.5 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {pred.probability}%
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest pt-2">
              <Brain className="w-3 h-3" />
              Algoritmo de Malicia V5.1 Activo
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
