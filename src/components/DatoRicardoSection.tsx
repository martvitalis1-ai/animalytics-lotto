import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles, Clock } from "lucide-react";
import { RichAnimalCard } from "./RichAnimalCard";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalByCode } from '@/lib/animalData';

interface RicardoPrediction {
  id: number;
  lottery_type: string;
  draw_time: string;
  predicted_numbers: string[];
  predicted_animals: string[] | null;
  notes: string | null;
  prediction_date: string;
}

export function DatoRicardoSection() {
  const [predictions, setPredictions] = useState<RicardoPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('dato_ricardo_predictions')
        .select('*')
        .eq('prediction_date', today)
        .order('draw_time', { ascending: true });

      if (!error && data) {
        setPredictions(data);
      }
      setLoading(false);
    };

    loadPredictions();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Group predictions by lottery
  const groupedPredictions = useMemo(() => {
    const groups: Record<string, RicardoPrediction[]> = {};
    
    for (const pred of predictions) {
      if (!groups[pred.lottery_type]) {
        groups[pred.lottery_type] = [];
      }
      groups[pred.lottery_type].push(pred);
    }
    
    return groups;
  }, [predictions]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          DATO RICARDO
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Predicciones manuales del experto para hoy
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(groupedPredictions).map(([lotteryId, preds]) => {
          const lottery = LOTTERIES.find(l => l.id === lotteryId);
          if (!lottery) return null;

          return (
            <div key={lotteryId} className="space-y-2">
              {/* Lottery header */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <img src={getLotteryLogo(lotteryId)} alt="" className="w-6 h-6" />
                <span className="font-semibold text-sm">{lottery.name}</span>
              </div>

              {/* Predictions grid */}
              <div className="grid gap-2">
                {preds.map((pred) => (
                  <div 
                    key={pred.id} 
                    className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-left-2"
                  >
                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[70px]">
                      <Clock className="w-3 h-3" />
                      {pred.draw_time}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {pred.predicted_numbers.slice(0, 3).map((num, idx) => {
                        const animal = getAnimalByCode(num);
                        return (
                          <div 
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm font-bold"
                          >
                            <span className="font-mono">{num.padStart(2, '0')}</span>
                            {animal && (
                              <span className="text-xs text-muted-foreground">
                                {animal.name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {pred.notes && (
                      <span className="text-xs text-muted-foreground italic ml-auto hidden sm:block">
                        {pred.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
