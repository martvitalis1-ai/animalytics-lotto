import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flame, Gift, Sparkles, TrendingUp } from "lucide-react";
import { RichAnimalCard } from "./RichAnimalCard";
import { LOTTERIES } from '@/lib/constants';
import { getCachedPredictions, getTodayDate, CachedPrediction } from '@/lib/predictionCache';
import { getLotteryLogo } from './LotterySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [predictions, setPredictions] = useState<CachedPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (history && history.length > 0) {
        const cached = getCachedPredictions(history, selectedLottery);
        setPredictions(cached);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  // Top 3 explosive predictions
  const explosiveNumbers = useMemo(() => {
    if (!predictions) return [];
    return predictions.predictions.slice(0, 3).map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
  }, [predictions]);

  // "El Regalo" - special numbers (overdue with high probability)
  const giftNumbers = useMemo(() => {
    if (!predictions) return [];
    return predictions.overdueNumbers
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2);
  }, [predictions]);

  return (
    <Card className="glass-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
            DATOS EXPLOSIVOS
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </CardTitle>
          
          {/* Lottery selector */}
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.filter(l => l.type === 'animals').map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Top predicciones con mayor probabilidad matemática para hoy • Bloqueadas para {getTodayDate()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Explosive Numbers Grid */}
            <div className="grid grid-cols-3 gap-3">
              {explosiveNumbers.map((pred, idx) => (
                <RichAnimalCard
                  key={pred.number}
                  code={pred.number}
                  probability={pred.probability}
                  status={pred.status}
                  rank={idx + 1}
                  size="lg"
                  reason={pred.reason}
                  className={`
                    ${idx === 0 ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30' : ''}
                    animate-in fade-in slide-in-from-bottom-2
                  `}
                  showProbability
                />
              ))}
            </div>

            {/* El Regalo Section */}
            {giftNumbers.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 rounded-xl" />
                <div className="relative p-4 rounded-xl border-2 border-dashed border-amber-500/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-amber-600 dark:text-amber-400">EL REGALO</h3>
                    <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
                      Números poderosos vencidos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {giftNumbers.map((pred) => (
                      <RichAnimalCard
                        key={pred.number}
                        code={pred.number}
                        probability={pred.probability}
                        status="OVERDUE"
                        size="md"
                        reason={pred.reason}
                        className="ring-2 ring-amber-400"
                        showProbability
                      />
                    ))}
                  </div>
                  
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-2 text-center">
                    ⚡ Estadísticamente les toca salir pronto
                  </p>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Lotería: {lottery?.name}
              </span>
              <span>
                {predictions?.overdueNumbers.length || 0} números vencidos detectados
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
