import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCardCompact } from './RichAnimalCard';
import { AnimalEmoji } from './AnimalImage';
import { getCachedPredictions, getAllCachedPredictions, getTodayDate, CachedPrediction } from '@/lib/predictionCache';
import { getAnimalByCode } from '@/lib/animalData';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [hourlyPredictions, setHourlyPredictions] = useState<Record<string, CachedPrediction>>({});
  const [loading, setLoading] = useState(false);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const drawTimes = getDrawTimesForLottery(selectedLottery);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (history && history.length > 0) {
        const { hourly } = getAllCachedPredictions(history, selectedLottery);
        setHourlyPredictions(hourly);
      }
    } catch (error) {
      console.error('Error loading hourly predictions:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  // Get current time to highlight next draw
  const currentHour = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  }, []);

  const getNextDrawTime = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of drawTimes) {
      const match = time.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const drawMinutes = hours * 60 + minutes;
        if (drawMinutes > currentTime) {
          return time;
        }
      }
    }
    return drawTimes[0]; // Return first if all passed
  }, [drawTimes]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Pronóstico por Hora
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.filter(l => l.type === 'animals').map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4" />
                      <span className="truncate">{l.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={loadPredictions} disabled={loading} variant="outline" size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Predicciones bloqueadas para {getTodayDate()} • Próximo sorteo: {getNextDrawTime}
        </p>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {drawTimes.map(time => {
              const predictions = hourlyPredictions[time]?.predictions || [];
              const isNextDraw = time === getNextDrawTime;
              const topPrediction = predictions[0];
              const animal = topPrediction ? getAnimalByCode(topPrediction.number) : null;
              
              // Boost probability display
              const displayProb = topPrediction 
                ? Math.min(85, topPrediction.probability < 35 ? 35 + topPrediction.probability * 0.5 : topPrediction.probability)
                : 0;
              
              return (
                <div
                  key={time}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${isNextDraw 
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/30' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                    }
                  `}
                >
                  {/* Time */}
                  <div className={`
                    text-sm font-bold min-w-[70px]
                    ${isNextDraw ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {time}
                    {isNextDraw && (
                      <span className="block text-[10px] text-primary animate-pulse">
                        ¡PRÓXIMO!
                      </span>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  
                  {/* Top prediction */}
                  {topPrediction ? (
                    <div className="flex items-center gap-2 flex-1">
                      <AnimalEmoji code={topPrediction.number} size="md" />
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-lg">
                          {topPrediction.number.padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {animal?.name}
                        </span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
                          ${displayProb >= 60 
                            ? 'bg-green-500/20 text-green-600' 
                            : displayProb >= 45 
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          <Zap className="w-3 h-3" />
                          {displayProb.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin datos</span>
                  )}
                  
                  {/* Additional predictions */}
                  <div className="hidden sm:flex gap-1">
                    {predictions.slice(1, 3).map(pred => (
                      <div
                        key={pred.number}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                        title={`${pred.number} - ${getAnimalByCode(pred.number)?.name}`}
                      >
                        <AnimalEmoji code={pred.number} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
