import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles, Clock, AlertCircle } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalByCode } from '@/lib/animalData';

interface RicardoPrediction {
  id: number;
  lottery_type: string;
  draw_time: string;
  predicted_numbers: string[];
  notes: string | null;
  prediction_date: string;
}

export function DatoRicardoSection() {
  const [predictions, setPredictions] = useState<RicardoPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPredictions = async () => {
    // Filtramos por fecha pero permitimos ver los últimos si no hay de hoy aún
    const { data, error } = await supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .order('prediction_date', { ascending: false })
      .order('draw_time', { ascending: true })
      .limit(10);

    if (!error && data) {
      setPredictions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPredictions();
    // Suscripción Realtime para que cuando borres/edites en el Admin, cambie aquí al instante
    const channel = supabase.channel('dato_ricardo_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dato_ricardo_predictions' }, loadPredictions)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const groupedPredictions = useMemo(() => {
    const groups: Record<string, RicardoPrediction[]> = {};
    predictions.forEach(pred => {
      if (!groups[pred.lottery_type]) groups[pred.lottery_type] = [];
      groups[pred.lottery_type].push(pred);
    });
    return groups;
  }, [predictions]);

  if (loading) return null; // No mostramos nada mientras carga para ahorrar espacio

  if (predictions.length === 0) {
    return (
      <Card className="glass-card border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground italic">
          <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-20" />
          Esperando pronósticos del experto...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
      <CardHeader className="pb-2 bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg font-black text-primary">
          <MessageCircle className="w-5 h-5" />
          DATO RICARDO
          <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {Object.entries(groupedPredictions).map(([lotteryId, preds]) => {
          const lottery = LOTTERIES.find(l => l.id === lotteryId);
          return (
            <div key={lotteryId} className="space-y-2 border-l-2 border-primary/20 pl-3">
              <div className="flex items-center gap-2">
                <img src={getLotteryLogo(lotteryId)} alt="" className="w-5 h-5 rounded-full" />
                <span className="font-bold text-sm uppercase tracking-tighter">{lottery?.name || lotteryId}</span>
              </div>

              <div className="grid gap-2">
                {preds.map((pred) => (
                  <div key={pred.id} className="flex items-center gap-2 p-2 bg-card border rounded-lg shadow-sm">
                    <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {pred.draw_time}
                    </div>
                    
                    <div className="flex gap-1.5 flex-wrap">
                      {pred.predicted_numbers.map((num, idx) => {
                        const animal = getAnimalByCode(num);
                        return (
                          <div key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 rounded border border-accent/20">
                            <span className="text-xs font-black">{num.padStart(2, '0')}</span>
                            <span className="text-[10px] uppercase opacity-70">{animal?.name || ''}</span>
                          </div>
                        );
                      })}
                    </div>
                    {pred.notes && <p className="text-[10px] italic text-muted-foreground ml-auto truncate max-w-[80px]">{pred.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
