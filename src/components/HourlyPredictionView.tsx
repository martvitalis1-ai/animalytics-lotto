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
  const today = new Date().toISOString().split('T')[0];

  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setHistory(data);
    } catch (error) {
      console.error('Error búnker:', error);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('hourly-atomic-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // LÓGICA DE RELOJ EN TIEMPO REAL (MANDA LA HORA DEL CELULAR)
  const nextDrawTime = useMemo(() => {
    const now = new Date();
    // Ajuste de hora local (Venezuela es UTC-4, pero el sistema usa la del dispositivo)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const toMin = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    // Buscamos el próximo sorteo que va a ocurrir (o que está ocurriendo justo ahora)
    // Damos un margen de 10 minutos después de la hora del sorteo
    for (const time of drawTimes) {
      const drawMin = toMin(time);
      if (drawMin >= currentMinutes - 5) { // Si faltan minutos o pasaron menos de 5 min
        return time;
      }
    }

    return drawTimes[0]; // Si ya pasó el último del día, mostrar el primero de mañana
  }, [drawTimes]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    const forecasts = generateDayForecast(selectedLottery, [nextDrawTime], history, today);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawTime, today]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter italic">
            <Clock className="w-6 h-6 text-primary" /> PRÓXIMO SORTEO
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/30 shadow-lg">
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
            <Button onClick={loadData} variant="ghost" size="icon" className="text-primary"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* CARTEL DE LA HORA ACTUALIZADA */}
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>

          {nextPrediction?.topPick ? (
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-accent/10 border-4 border-primary/20 relative shadow-2xl">
              <span className="text-8xl block drop-shadow-2xl mb-4 animate-in zoom-in duration-500">
                {getAnimalEmoji(nextPrediction.topPick.code)}
              </span>
              <div className="font-mono font-black text-7xl text-primary leading-none tracking-tighter">
                {nextPrediction.topPick.code.padStart(2, '0')}
              </div>
              <h3 className="text-4xl font-black uppercase mt-2 tracking-tighter">{nextPrediction.topPick.name}</h3>
              
              <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-destructive text-white rounded-2xl font-black text-2xl shadow-lg border-b-4 border-black/20">
                <Zap className="w-6 h-6 fill-current text-yellow-300" /> 
                {Math.floor(nextPrediction.topPick.probability)}% PROBABILIDAD
              </div>

              <div className="mt-8 pt-4 border-t-2 border-dashed border-primary/20">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  MUESTRA: {history.filter(h => h.result_number === nextPrediction.topPick?.code).length}X APARICIONES EN EL BÚNKER
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center opacity-30 grayscale">
               <Loader2 className="w-12 h-12 animate-spin mb-4" />
               <p className="font-black uppercase tracking-widest text-sm">Escaneando Malicia...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
