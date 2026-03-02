import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateDayForecast, HourlyForecast } from '@/lib/advancedProbability';

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
      // Absorbemos todo Supabase (últimos 1000 resultados para máxima precisión)
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false })
        .order('draw_time', { ascending: false })
        .limit(1000);

      if (data) {
        setHistory(data);
        
        // Buscamos el último resultado disponible de esta lotería (sin importar si es hoy o ayer)
        const lotteryResults = data.filter(d => d.lottery_type === selectedLottery);
        
        if (lotteryResults.length > 0) {
          setLastDrawTime(lotteryResults[0].draw_time);
          setLastDrawResult(lotteryResults[0].result_number);
        } else {
          setLastDrawTime(null);
          setLastDrawResult(null);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('hourly-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

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

  const nextDrawInfo = useMemo(() => {
    if (!lastDrawTime) return { nextTime: drawTimes[0], message: null };

    const lastMinutes = parseTimeToMinutes(lastDrawTime);
    for (const time of drawTimes) {
      if (parseTimeToMinutes(time) > lastMinutes) {
        return { nextTime: time, message: null };
      }
    }
    return { nextTime: drawTimes[0], message: 'Sorteos del próximo bloque' };
  }, [lastDrawTime, drawTimes]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    const timeToPredict = nextDrawInfo.nextTime || drawTimes[0];
    const forecasts = generateDayForecast(selectedLottery, [timeToPredict], history, today);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawInfo.nextTime, today, drawTimes]);

  const getStatusColor = (prob: number): string => {
    if (prob >= 80) return 'bg-red-500 text-white border-red-700';
    if (prob >= 60) return 'bg-amber-500 text-white border-amber-700';
    return 'bg-emerald-500 text-white border-emerald-700';
  };

  return (
    <Card className="glass-card border-2 border-primary/30 overflow-hidden">
      <CardHeader className="pb-2 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tighter uppercase">
            <Clock className="w-5 h-5 text-primary" />
            Siguiente Hora
          </CardTitle>
          <div className="flex items-center gap-1">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[140px] h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {lastDrawTime && lastDrawResult && (
          <div className="mt-2 text-center py-1 bg-primary/5 rounded border border-primary/10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Salió a las {lastDrawTime}: </span>
            <span className="text-sm font-black text-primary">
              {lastDrawResult.padStart(2, '0')} - {getAnimalName(lastDrawResult)} {getAnimalEmoji(lastDrawResult)}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-4">
        {nextPrediction ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-black text-xl animate-pulse">
                {nextDrawInfo.nextTime}
                <ChevronRight className="w-5 h-5" />
                <span>PRÓXIMO</span>
              </div>
            </div>

            {nextPrediction.topPick && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/20 border-2 border-primary/50 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-2">
                   <Zap className="w-8 h-8 text-primary/20" />
                </div>
                <div className="flex items-center justify-around gap-4">
                  <span className="text-7xl drop-shadow-md">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
                  <div className="text-center">
                    <div className="font-mono font-black text-6xl text-primary tracking-tighter">
                      {nextPrediction.topPick.code.padStart(2, '0')}
                    </div>
                    <div className="text-xl font-black uppercase tracking-widest mt-1">
                      {nextPrediction.topPick.name}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl block mb-1">{nextPrediction.topPick.statusEmoji}</span>
                    <span className={`px-3 py-1 rounded-lg text-lg font-black shadow-sm border-b-4 ${getStatusColor(nextPrediction.topPick.probability)}`}>
                      {Math.floor(nextPrediction.topPick.probability)}%
                    </span>
                  </div>
                </div>
                <p className="text-center text-[11px] font-bold text-muted-foreground mt-4 uppercase tracking-tighter leading-tight bg-muted/50 p-2 rounded-lg italic">
                  {nextPrediction.topPick.reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {nextPrediction.predictions.slice(1, 5).map((pred) => (
                <div key={pred.code} className="p-2 rounded-xl bg-card border shadow-sm text-center">
                  <span className="text-3xl">{getAnimalEmoji(pred.code)}</span>
                  <div className="font-black text-lg text-primary">{pred.code.padStart(2, '0')}</div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getStatusColor(pred.probability)}`}>
                    {Math.floor(pred.probability)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 opacity-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
            <p className="text-sm font-bold uppercase tracking-widest">Sincronizando Búnker...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
