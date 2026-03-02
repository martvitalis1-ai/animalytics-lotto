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
      // ABSORCIÓN TOTAL: Jalamos 1000 resultados para que nunca diga que no hay historial
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false })
        .order('draw_time', { ascending: false })
        .limit(1000);

      if (data) {
        setHistory(data);
        const todayResults = data.filter(d => d.lottery_type === selectedLottery);
        if (todayResults.length > 0) {
          setLastDrawTime(todayResults[0].draw_time);
          setLastDrawResult(todayResults[0].result_number);
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
      if (parseTimeToMinutes(time) > lastMinutes) return { nextTime: time, message: null };
    }
    return { nextTime: drawTimes[0], message: 'Próximo bloque' };
  }, [lastDrawTime, drawTimes]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    const forecasts = generateDayForecast(selectedLottery, [nextDrawInfo.nextTime || drawTimes[0]], history, today);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawInfo.nextTime, today, drawTimes]);

  return (
    <Card className="glass-card border-2 border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tighter">
            <Clock className="w-5 h-5 text-primary" /> Siguiente Hora
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[150px] h-8 text-xs font-bold"><SelectValue /></SelectTrigger>
              <SelectContent>{LOTTERIES.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}</SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {nextPrediction ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-black text-xl animate-pulse">
                {nextDrawInfo.nextTime} <ChevronRight className="w-5 h-5" /> <span>PRÓXIMO</span>
              </div>
            </div>
            {nextPrediction.topPick && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/20 border-2 border-primary/50 shadow-xl text-center">
                <span className="text-7xl block mb-2">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
                <div className="font-mono font-black text-6xl text-primary">{nextPrediction.topPick.code.padStart(2, '0')}</div>
                <div className="text-xl font-black uppercase mt-1">{nextPrediction.topPick.name}</div>
                <div className="mt-2 inline-block px-4 py-1 bg-red-500 text-white rounded-lg font-bold">
                  <Zap className="w-4 h-4 inline mr-1" /> {Math.floor(nextPrediction.topPick.probability)}% PROBABILIDAD
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase bg-muted/50 p-2 rounded">{nextPrediction.topPick.reason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center opacity-50 font-bold uppercase tracking-widest">Sincronizando con Supabase...</div>
        )}
      </CardContent>
    </Card>
  );
}
