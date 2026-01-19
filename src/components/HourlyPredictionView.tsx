import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap, Flame, TrendingUp } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCardCompact } from './RichAnimalCard';
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateDayForecast, HourlyForecast, AdvancedPrediction } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const drawTimes = getDrawTimesForLottery(selectedLottery);
  const today = new Date().toISOString().split('T')[0];

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

  // Generate full day forecast using new algorithm
  const hourlyForecasts = useMemo((): HourlyForecast[] => {
    if (history.length === 0) return [];
    return generateDayForecast(selectedLottery, drawTimes, history, today);
  }, [history, selectedLottery, drawTimes, today]);

  // Get next draw time
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
    return drawTimes[0];
  }, [drawTimes]);

  // Get status color class
  const getStatusColor = (prob: number): string => {
    if (prob >= 90) return 'bg-red-500/20 text-red-600 border-red-500/50';
    if (prob >= 75) return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
    if (prob >= 50) return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Pronóstico por Hora
            <span className="text-xs font-normal text-muted-foreground">(35-98%)</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4" />
                      <span className="truncate">{l.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={loadData} disabled={loading} variant="outline" size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Probabilidades variables por hora • Próximo: <span className="font-bold text-primary">{getNextDrawTime}</span>
        </p>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
            {hourlyForecasts.map(forecast => {
              const isNextDraw = forecast.time === getNextDrawTime;
              const topPick = forecast.topPick;
              
              return (
                <div
                  key={forecast.time}
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
                    {forecast.time}
                    {isNextDraw && (
                      <span className="block text-[10px] text-primary animate-pulse">
                        ¡PRÓXIMO!
                      </span>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  
                  {/* Top prediction */}
                  {topPick ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{getAnimalEmoji(topPick.code)}</span>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-lg">
                          {topPick.code === "0" ? "0" : topPick.code === "00" ? "00" : topPick.code.padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {topPick.name}
                        </span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        {/* Status emoji */}
                        <span className="text-lg">{topPick.statusEmoji}</span>
                        
                        {/* Probability badge with variable color */}
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border
                          ${getStatusColor(topPick.probability)}
                        `}>
                          <Zap className="w-3 h-3" />
                          {topPick.probability}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin datos</span>
                  )}
                  
                  {/* Additional predictions */}
                  <div className="hidden sm:flex gap-1">
                    {forecast.predictions.slice(1, 3).map(pred => (
                      <div
                        key={pred.code}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg"
                        title={`${pred.code} - ${pred.name} (${pred.probability}%) ${pred.statusEmoji}`}
                      >
                        {getAnimalEmoji(pred.code)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center mt-4 text-[10px]">
          <span className="flex items-center gap-1">🔥 90%+</span>
          <span className="flex items-center gap-1">⚡ 75-89%</span>
          <span className="flex items-center gap-1">⚖️ 50-74%</span>
          <span className="flex items-center gap-1">❄️ &lt;50%</span>
        </div>
      </CardContent>
    </Card>
  );
}
