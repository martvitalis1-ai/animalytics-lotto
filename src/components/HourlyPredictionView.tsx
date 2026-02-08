import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { RichAnimalCard } from './RichAnimalCard';
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateDayForecast, HourlyForecast, AdvancedPrediction } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDrawTime, setLastDrawTime] = useState<string | null>(null);
  const [lastDrawResult, setLastDrawResult] = useState<string | null>(null);

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
        
        // Find last draw for this lottery today
        const todayResults = data.filter(
          d => d.lottery_type === selectedLottery && d.draw_date === today
        );
        
        if (todayResults.length > 0) {
          setLastDrawTime(todayResults[0].draw_time);
          setLastDrawResult(todayResults[0].result_number);
        } else {
          setLastDrawTime(null);
          setLastDrawResult(null);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, [selectedLottery, today]);

  useEffect(() => {
    loadData();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('hourly-prediction-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lottery_results' 
      }, () => {
        loadData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Parse time string to minutes
  const parseTimeToMinutes = (time: string): number => {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Get next draw time based on last result
  const nextDrawInfo = useMemo(() => {
    if (!lastDrawTime) {
      return {
        nextTime: null,
        message: 'Esperando resultado anterior para proyectar...',
        waitingForData: true
      };
    }

    const lastMinutes = parseTimeToMinutes(lastDrawTime);
    
    // Find the next draw time after the last one
    for (const time of drawTimes) {
      const timeMinutes = parseTimeToMinutes(time);
      if (timeMinutes > lastMinutes) {
        return {
          nextTime: time,
          message: null,
          waitingForData: false
        };
      }
    }
    
    // If we're past all draws for today
    return {
      nextTime: null,
      message: 'No hay más sorteos programados hoy',
      waitingForData: false
    };
  }, [lastDrawTime, drawTimes]);

  // Generate prediction for the next draw
  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (!nextDrawInfo.nextTime || history.length === 0) return null;
    
    const forecasts = generateDayForecast(selectedLottery, [nextDrawInfo.nextTime], history, today);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawInfo.nextTime, today]);

  // Get status color class
  const getStatusColor = (prob: number): string => {
    if (prob >= 90) return 'bg-red-500/20 text-red-600 border-red-500/50';
    if (prob >= 75) return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
    if (prob >= 50) return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Card className="glass-card border-2 border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Pronóstico Siguiente Hora
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
        
        {/* Last draw info */}
        {lastDrawTime && lastDrawResult && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Último resultado ({lastDrawTime}): 
              <span className="font-bold text-foreground ml-1">
                {lastDrawResult.padStart(2, '0')} - {getAnimalName(lastDrawResult)} {getAnimalEmoji(lastDrawResult)}
              </span>
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : nextDrawInfo.waitingForData || nextDrawInfo.message ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
            <p className="text-lg font-medium text-muted-foreground">
              {nextDrawInfo.message}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa el resultado del sorteo anterior para activar la predicción
            </p>
          </div>
        ) : nextPrediction ? (
          <div className="space-y-4">
            {/* Next Draw Time Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold text-lg animate-pulse">
                <Clock className="w-5 h-5" />
                {nextDrawInfo.nextTime}
                <ChevronRight className="w-5 h-5" />
                <span>¡PRÓXIMO SORTEO!</span>
              </div>
            </div>

            {/* Top Prediction - Large Card */}
            {nextPrediction.topPick && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30">
                <div className="text-center mb-4">
                  <span className="text-sm text-muted-foreground">Predicción Principal</span>
                </div>
                
                <div className="flex items-center justify-center gap-6">
                  <span className="text-6xl">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
                  <div className="text-center">
                    <div className="font-mono font-black text-5xl text-primary">
                      {nextPrediction.topPick.code === "0" ? "0" : 
                       nextPrediction.topPick.code === "00" ? "00" : 
                       nextPrediction.topPick.code.padStart(2, '0')}
                    </div>
                    <div className="text-lg font-bold mt-1">
                      {nextPrediction.topPick.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{nextPrediction.topPick.statusEmoji}</span>
                    <span className={`px-3 py-1.5 rounded-full text-lg font-bold flex items-center gap-1 border ${getStatusColor(nextPrediction.topPick.probability)}`}>
                      <Zap className="w-4 h-4" />
                      {String(Math.floor(nextPrediction.topPick.probability)).padStart(2, '0')}%
                    </span>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {nextPrediction.topPick.reason}
                </p>
              </div>
            )}

            {/* Additional Predictions */}
            <div className="grid grid-cols-4 gap-2">
              {nextPrediction.predictions.slice(1, 5).map((pred, idx) => (
                <div
                  key={pred.code}
                  className="p-3 rounded-lg bg-muted/50 border text-center"
                >
                  <span className="text-2xl">{getAnimalEmoji(pred.code)}</span>
                  <div className="font-mono font-bold mt-1">
                    {pred.code === "0" ? "0" : pred.code === "00" ? "00" : pred.code.padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {pred.name}
                  </div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(pred.probability)}`}>
                    {String(Math.floor(pred.probability)).padStart(2, '0')}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Sin datos disponibles</p>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center mt-6 text-[10px]">
          <span className="flex items-center gap-1">🔥 90%+</span>
          <span className="flex items-center gap-1">⚡ 75-89%</span>
          <span className="flex items-center gap-1">⚖️ 50-74%</span>
          <span className="flex items-center gap-1">❄️ &lt;50%</span>
        </div>
      </CardContent>
    </Card>
  );
}
