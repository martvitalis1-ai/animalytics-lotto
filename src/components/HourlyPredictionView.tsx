import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalName, getAnimalImageUrl, getAnimalEmoji } from '@/lib/animalData';
import { generateDayForecast, HourlyForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setHistory(data);
    } catch (error) { 
      console.error('Error búnker:', error); 
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  // LÓGICA DE TIEMPO REAL PARA EL PRÓXIMO SORTEO
  const nextDrawTime = useMemo(() => {
    const times = getDrawTimesForLottery(selectedLottery);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const toMin = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let h = parseInt(match[1]);
      if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(match[2]);
    };

    for (const time of times) { 
      if (toMin(time) >= currentMinutes - 5) return time; 
    }
    return times[0];
  }, [selectedLottery]);

  const nextPrediction = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, [nextDrawTime], history, today)[0] || null;
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
              <SelectTrigger className="w-[180px] h-9 font-black text-xs border-primary/30 shadow-lg text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="ghost" size="icon" className="text-primary">
              <RefreshCw className={loading ? 'animate-spin' : ''}/>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* CARTEL DE LA HORA */}
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>

          {nextPrediction?.topPick ? (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden flex flex-col items-center">
              
              {/* CONTENEDOR DE IMAGEN VIP 3D */}
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <img 
                  key={nextPrediction.topPick.code}
                  src={getAnimalImageUrl(nextPrediction.topPick.code)} 
                  className="w-full h-full object-contain z-10 drop-shadow-2xl animate-in zoom-in-95 duration-500" 
                  alt="Animal Maestro"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Si falla la imagen, ocultamos el icono de error roto
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Número de fondo estilizado */}
                <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">
                  {nextPrediction.topPick.code === '00' || nextPrediction.topPick.code === '0' 
                    ? nextPrediction.topPick.code 
                    : nextPrediction.topPick.code.padStart(2, '0')}
                </span>
                
                {/* Emoji de respaldo que se ve si la imagen no carga */}
                <span className="absolute text-7xl opacity-10">{getAnimalEmoji(nextPrediction.topPick.code)}</span>
              </div>

              <div className="font-mono font-black text-6xl text-slate-900 mt-4 tracking-tighter">
                {nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' 
                  ? nextPrediction.topPick.code 
                  : nextPrediction.topPick.code.padStart(2, '0')}
              </div>
              <h3 className="text-4xl font-black uppercase mt-2 tracking-tighter text-slate-800">
                {getAnimalName(nextPrediction.topPick.code)}
              </h3>
              
              <div className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-emerald-800">
                <Zap className="w-7 h-7 fill-yellow-300 text-yellow-300" /> 
                {Math.floor(nextPrediction.topPick.probability)}% ÉXITO
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center opacity-30 grayscale text-center">
               <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
               <p className="font-black uppercase tracking-widest text-sm text-center">Analizando Datos...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
