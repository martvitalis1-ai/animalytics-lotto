import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Loader2,
  Star,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING, DRAW_TIMES } from '@/lib/constants';
import { calculateProbabilities, AnalysisResult } from '@/lib/probabilityEngine';
import { generateHourlyForecast } from '@/lib/advancedAI';
import { getLotteryLogo } from "./LotterySelector";

export function HourlyPredictions() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [predictions, setPredictions] = useState<{ ai: AnalysisResult[]; ricardo: any[] }>({ ai: [], ricardo: [] });
  const [hourlyForecasts, setHourlyForecasts] = useState<Record<string, { numbers: string[]; confidence: number; reason: string }>>({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Determinar hora actual
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Encontrar la próxima hora de sorteo
    const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes < 30 ? '00' : '30'} ${hours >= 12 ? 'PM' : 'AM'}`;
    const nextTime = DRAW_TIMES.find(t => t >= currentTimeStr) || DRAW_TIMES[0];
    setSelectedTime(nextTime);
  }, []);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const { data: historyData } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      setHistory(historyData || []);
      
      // Cargar predicciones de Ricardo para hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: ricardoData } = await supabase
        .from('dato_ricardo_predictions')
        .select('*')
        .eq('prediction_date', today)
        .eq('lottery_type', selectedLottery);
      
      setPredictions(prev => ({ ...prev, ricardo: ricardoData || [] }));
      setLoading(false);
    };
    
    loadData();
  }, [selectedLottery]);

  // Generar predicciones cuando cambia la lotería o la hora
  useEffect(() => {
    if (history.length > 0 && selectedTime) {
      // Predicciones de IA
      const aiPreds = calculateProbabilities(
        history.filter(h => h.lottery_type === selectedLottery && h.draw_time === selectedTime),
        selectedLottery
      ).slice(0, 5);
      setPredictions(prev => ({ ...prev, ai: aiPreds }));
      
      // Pronósticos por hora
      const forecasts: Record<string, { numbers: string[]; confidence: number; reason: string }> = {};
      DRAW_TIMES.forEach(time => {
        forecasts[time] = generateHourlyForecast(history, selectedLottery, time);
      });
      setHourlyForecasts(forecasts);
    }
  }, [history, selectedLottery, selectedTime]);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const currentForecast = hourlyForecasts[selectedTime];
  const ricardoPredForTime = predictions.ricardo.find(r => r.draw_time === selectedTime);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Pronósticos por Hora</h2>
        </div>
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedLottery} onValueChange={setSelectedLottery}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar lotería" />
          </SelectTrigger>
          <SelectContent>
            {LOTTERIES.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                  {l.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            {DRAW_TIMES.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Panel principal con predicciones combinadas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Predicción de IA */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              IA Predictiva
              {currentForecast && (
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {currentForecast.confidence}% confianza
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : currentForecast && currentForecast.numbers.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {currentForecast.numbers.map((num, idx) => (
                    <div 
                      key={num} 
                      className={`flex flex-col items-center p-3 rounded-lg ${
                        idx === 0 
                          ? 'bg-primary/20 border-2 border-primary' 
                          : 'bg-muted'
                      }`}
                    >
                      {idx === 0 && <Star className="w-3 h-3 text-primary mb-1" />}
                      <span className="font-mono font-black text-2xl">
                        {num.padStart(2, '0')}
                      </span>
                      {lottery?.type === 'animals' && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {ANIMAL_MAPPING[num]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentForecast.reason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin datos suficientes para esta hora
              </p>
            )}
          </CardContent>
        </Card>

        {/* Predicción de Dato Ricardo */}
        <Card className="glass-card border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Dato Ricardo
              {ricardoPredForTime && (
                <span className="ml-auto text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                  Pronóstico Manual
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ricardoPredForTime ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ricardoPredForTime.predicted_numbers?.map((num: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center p-3 rounded-lg ${
                        idx === 0 
                          ? 'bg-accent/30 border-2 border-accent' 
                          : 'bg-accent/10'
                      }`}
                    >
                      {idx === 0 && <Star className="w-3 h-3 text-accent mb-1" />}
                      <span className="font-mono font-black text-2xl">
                        {num.padStart(2, '0')}
                      </span>
                      {lottery?.type === 'animals' && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {ANIMAL_MAPPING[num]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {ricardoPredForTime.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    "{ricardoPredForTime.notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin pronóstico de Ricardo para esta hora
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid de horas con predicciones */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Vista General por Hora - {lottery?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {DRAW_TIMES.map((time) => {
              const forecast = hourlyForecasts[time];
              const ricardoPred = predictions.ricardo.find(r => r.draw_time === time);
              const isSelected = time === selectedTime;
              const hasData = forecast?.numbers.length > 0 || ricardoPred;
              
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                      : hasData 
                        ? 'bg-muted/50 hover:bg-muted' 
                        : 'bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{time}</span>
                    <div className="flex gap-1">
                      {forecast?.numbers.length > 0 && (
                        <Zap className={`w-3 h-3 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                      )}
                      {ricardoPred && (
                        <Sparkles className={`w-3 h-3 ${isSelected ? 'text-primary-foreground' : 'text-accent'}`} />
                      )}
                    </div>
                  </div>
                  {hasData && (
                    <div className="flex gap-1">
                      {(forecast?.numbers || ricardoPred?.predicted_numbers || []).slice(0, 3).map((n: string, i: number) => (
                        <span 
                          key={i} 
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isSelected 
                              ? 'bg-primary-foreground/20' 
                              : 'bg-background'
                          }`}
                        >
                          {n.toString().padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
