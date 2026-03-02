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

  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // ABSORCIÓN TOTAL: Jalamos historial para estadísticas y racha
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (data && data.length > 0) {
        setHistory(data);
        // Detectamos la hora real del último sorteo guardado
        setLastDrawTime(data[0].draw_time);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('hourly-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // LÓGICA DE DETECCIÓN DEL PRÓXIMO SORTEO REAL
  const nextDrawTime = useMemo(() => {
    if (!lastDrawTime) return drawTimes[0];

    // Convertimos hora (01:00 PM) a minutos para comparar
    const toMin = (t: string) => {
      const [h, m_ampm] = t.split(':');
      const [m, ampm] = m_ampm.split(' ');
      let hours = parseInt(h);
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + parseInt(m);
    };

    const lastMin = toMin(lastDrawTime);
    
    // Buscamos en la lista oficial de horarios el que sigue después del último
    for (const time of drawTimes) {
      if (toMin(time) > lastMin) return time;
    }
    
    return drawTimes[0]; // Si ya pasaron todos, volvemos al primero (mañana)
  }, [lastDrawTime, drawTimes]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    const forecasts = generateDayForecast(selectedLottery, [nextDrawTime], history, new Date().toISOString().split('T')[0]);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawTime]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter italic">
            <Clock className="w-6 h-6 text-primary" /> SIGUIENTE HORA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">
                    <div className="flex items-center gap-2">
                       <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="ghost" size="icon"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-emerald-500 text-white rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>

          {nextPrediction?.topPick && (
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-background to-primary/10 border-4 border-primary/20 relative shadow-2xl">
              <span className="text-8xl block drop-shadow-2xl mb-4">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
              <div className="font-mono font-black text-7xl text-primary leading-none tracking-tighter">
                {nextPrediction.topPick.code.padStart(2, '0')}
              </div>
              <h3 className="text-3xl font-black uppercase mt-2">{nextPrediction.topPick.name}</h3>
              
              <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-destructive text-white rounded-2xl font-black text-xl shadow-lg">
                <Zap className="w-5 h-5 fill-current" /> {Math.floor(nextPrediction.topPick.probability)}% PROBABILIDAD
              </div>

              <p className="mt-6 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-t pt-4">
                TENDENCIA FUERTE. APARECIÓ {history.filter(h => h.result_number === nextPrediction.topPick?.code).length}X EN LA HISTORIA
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
