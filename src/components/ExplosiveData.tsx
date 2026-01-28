import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flame, Gift, Sparkles, TrendingUp, Zap } from "lucide-react";
import { RichAnimalCard } from "./RichAnimalCard";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getExplosivePredictions, 
  getGoldenNumbers, 
  AdvancedPrediction 
} from '@/lib/advancedProbability';

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (data) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const today = new Date().toISOString().split('T')[0];

  // Top 3 explosive predictions using new algorithm
  const explosiveNumbers = useMemo((): AdvancedPrediction[] => {
    if (history.length === 0) return [];
    return getExplosivePredictions(selectedLottery, history, today, 3);
  }, [history, selectedLottery, today]);

  // "El Regalo" - golden numbers
  const giftNumbers = useMemo((): AdvancedPrediction[] => {
    if (history.length === 0) return [];
    return getGoldenNumbers(selectedLottery, history, today);
  }, [history, selectedLottery, today]);

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
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
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
          Top predicciones con probabilidades variables (35-98%) para hoy • Algoritmo avanzado
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Explosive Numbers Grid - Responsive fix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {explosiveNumbers.length > 0 ? (
                explosiveNumbers.map((pred, idx) => (
                  <RichAnimalCard
                    key={pred.code}
                    code={pred.code}
                    probability={pred.probability}
                    status={pred.status}
                    statusEmoji={pred.statusEmoji}
                    rank={idx + 1}
                    size="lg"
                    reason={pred.reason}
                    lotteryName={lottery?.name}
                    className={`
                      ${idx === 0 ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30' : ''}
                      animate-in fade-in slide-in-from-bottom-2
                    `}
                    showProbability
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-muted-foreground">
                  Cargando análisis de hoy…
                </div>
              )}
            </div>

            {/* Status legend */}
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-600">
                🔥 CALIENTE (90%+)
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600">
                ⚡ FUERTE (75-89%)
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground">
                ⚖️ POSIBLE (50-74%)
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-600">
                ❄️ FRÍO (&lt;50%)
              </span>
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
                      Los números poderosos del día
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {giftNumbers.map((pred) => (
                      <RichAnimalCard
                        key={pred.code}
                        code={pred.code}
                        probability={pred.probability}
                        status={pred.status}
                        statusEmoji={pred.statusEmoji}
                        size="md"
                        reason={pred.reason}
                        className="ring-2 ring-amber-400"
                        showProbability
                      />
                    ))}
                  </div>
                  
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-2 text-center">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Días sin salir: {giftNumbers[0]?.daysSince || 0} días | Seleccionados por algoritmo avanzado
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
                Historial: {history.filter(h => h.lottery_type === selectedLottery).length} resultados
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
