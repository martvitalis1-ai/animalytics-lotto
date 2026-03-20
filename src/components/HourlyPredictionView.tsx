import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { generateDayForecast, HourlyForecast } from '@/lib/advancedProbability';
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';

export function HourlyPredictionView() {
  const [selectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // 1. LISTA DE HORARIOS OFICIALES
  const drawTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];

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

  useEffect(() => {
    loadData();
    // 2. SUSCRIPCIÓN EN TIEMPO REAL: Si sale un resultado, recalculamos
    const channel = supabase.channel('hourly-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // 3. LÓGICA DE RELOJ DINÁMICO (DETECTA EL PRÓXIMO SORTEO REAL)
  const nextDrawTime = useMemo(() => {
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

    // Buscamos el primer sorteo que aún no ha pasado (margen de 5 mins)
    for (const time of drawTimes) {
      if (toMin(time) >= currentMinutes - 5) return time;
    }
    return drawTimes[0]; // Si ya pasaron todos, mostrar el primero de mañana
  }, [selectedLottery]);

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
          <Button onClick={loadData} variant="ghost" size="icon" className="text-primary">
            <RefreshCw className={loading ? 'animate-spin' : ''}/>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* CARTEL DE LA HORA ACTUALIZADA */}
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>

          {nextPrediction?.topPick ? (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden">
              
              {/* CONTENEDOR DE IMAGEN VIP 3D */}
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <img 
                  key={nextPrediction.topPick.code}
                  src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' ? nextPrediction.topPick.code : nextPrediction.topPick.code.padStart(2, '0')}.png`} 
                  className="w-full h-full object-contain drop-shadow-2xl z-10 animate-in zoom-in-95 duration-500" 
                  alt="Dato VIP"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback si la imagen falla
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Número de fondo para diseño premium */}
                <span className="absolute inset-0 flex items-center justify-center text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">
                  {nextPrediction.topPick.code.padStart(2, '0')}
                </span>
              </div>

              <div className="font-mono font-black text-6xl text-slate-900 leading-none tracking-tighter mt-4">
                {nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' 
                  ? nextPrediction.topPick.code 
                  : nextPrediction.topPick.code.padStart(2, '0')}
              </div>
              <h3 className="text-4xl font-black uppercase mt-2 tracking-tighter text-slate-800">
                {getAnimalName(nextPrediction.topPick.code)}
              </h3>
              
              <div className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-emerald-800 active:translate-y-1 transition-all">
                <Zap className="w-7 h-7 fill-yellow-300 text-yellow-300" /> 
                {Math.floor(nextPrediction.topPick.probability)}% ÉXITO
              </div>

              <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   MUESTRA: {history.filter(h => h.result_number === nextPrediction.topPick?.code).length}X APARICIONES EN EL BÚNKER
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center opacity-30 grayscale">
               <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
               <p className="font-black uppercase tracking-widest text-sm">Escaneando Malicia...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
