import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalEmoji, getAnimalName, getAnimalImageUrl } from '@/lib/animalData';
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
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('draw_date', { ascending: false }).order('created_at', { ascending: false }).limit(500);
      if (data) setHistory(data);
    } catch (error) { console.error(error); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('hourly-atomic').on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const nextDrawTime = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + parseInt(match[2]);
    };
    for (const time of drawTimes) { if (toMin(time) >= currentMinutes - 5) return time; }
    return drawTimes[0];
  }, [drawTimes]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    const forecasts = generateDayForecast(selectedLottery, [nextDrawTime], history, today);
    return forecasts[0] || null;
  }, [history, selectedLottery, nextDrawTime, today]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden text-slate-900">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase italic tracking-tighter">
            <Clock className="w-6 h-6 text-primary" /> PRÓXIMO SORTEO
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 font-black text-xs border-primary/30 shadow-lg"><SelectValue /></SelectTrigger>
              <SelectContent>{LOTTERIES.map(l => (<SelectItem key={l.id} value={l.id} className="font-bold"><div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}</div></SelectItem>))}</SelectContent>
            </Select>
            <Button onClick={loadData} variant="ghost" size="icon" className="text-primary"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>
          {nextPrediction?.topPick ? (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden">
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <img 
                  key={nextPrediction.topPick.code}
                  src={getAnimalImageUrl(nextPrediction.topPick.code)} 
                  className="w-full h-full object-contain z-10 drop-shadow-2xl animate-in zoom-in-95 duration-500" 
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black text-emerald-500/5 select-none">{nextPrediction.topPick.code.padStart(2, '0')}</span>
                <span className="absolute text-7xl opacity-10">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
              </div>
              <div className="font-mono font-black text-6xl text-slate-900 mt-4 tracking-tighter">
                {nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' ? nextPrediction.topPick.code : nextPrediction.topPick.code.padStart(2, '0')}
              </div>
              <h3 className="text-4xl font-black uppercase mt-2 tracking-tighter text-slate-800">{nextPrediction.topPick.name}</h3>
              <div className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl">
                <Zap className="w-6 h-6 fill-current text-yellow-300" /> {Math.floor(nextPrediction.topPick.probability)}% ÉXITO
              </div>
            </div>
          ) : <div className="py-20 flex flex-col items-center opacity-30 grayscale"><Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" /><p className="font-black uppercase tracking-widest text-sm">Escaneando Patrones...</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
