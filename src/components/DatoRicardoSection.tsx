import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

interface DatoRicardoSectionProps {
  customName?: string;
  agencyId?: string; // El ID de la agencia bloqueada por URL
}

export function DatoRicardoSection({ customName, agencyId }: DatoRicardoSectionProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPredictions = async () => {
    let query = supabase
      .from('dato_ricardo_predictions')
      .select('*')
      .order('prediction_date', { ascending: false })
      .order('draw_time', { ascending: true });

    // LÓGICA DE FILTRADO INTELIGENTE
    if (agencyId) {
      // Si el cliente entró por link de agencia, buscamos PRIMERO los datos de esa agencia
      query = query.eq('agencia_id', agencyId);
    } else {
      // Si es la web general, buscamos el Dato Ricardo Maestro (NULL)
      query = query.is('agencia_id', null);
    }

    const { data } = await query.limit(12);
    if (data) setPredictions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPredictions();
    const channel = supabase.channel('dato_ricardo_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dato_ricardo_predictions' }, loadPredictions)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [agencyId]);

  const groupedPredictions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    predictions.forEach(pred => {
      if (!groups[pred.lottery_type]) groups[pred.lottery_type] = [];
      groups[pred.lottery_type].push(pred);
    });
    return groups;
  }, [predictions]);

  if (loading) return null;

  return (
    <Card className="glass-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden rounded-[3rem] shadow-2xl">
      <CardHeader className="pb-2 bg-primary/5 text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-black text-primary uppercase italic">
          <MessageCircle className="w-6 h-6" />
          {customName || "DATO RICARDO"}
          <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {predictions.length === 0 ? (
          <div className="py-10 text-center opacity-40 italic flex flex-col items-center gap-2">
            <AlertCircle size={40} />
            <p className="font-black uppercase text-xs tracking-widest">Esperando el próximo bombazo...</p>
          </div>
        ) : (
          Object.entries(groupedPredictions).map(([lotteryId, preds]) => {
            const lottery = LOTTERIES.find(l => l.id === lotteryId);
            return (
              <div key={lotteryId} className="space-y-4">
                <div className="flex items-center justify-center gap-2 bg-slate-100 py-2 rounded-full mx-auto max-w-[200px]">
                  <img src={getLotteryLogo(lotteryId)} alt="" className="w-6 h-6 rounded-full" />
                  <span className="font-black text-xs uppercase tracking-tighter text-slate-600">{lottery?.name || lotteryId}</span>
                </div>

                <div className="grid gap-3">
                  {preds.map((pred) => (
                    <div key={pred.id} className="flex flex-col items-center gap-3 p-4 bg-white border-2 rounded-[2rem] shadow-md">
                      <div className="text-[10px] font-black text-white bg-primary px-4 py-1 rounded-full uppercase tracking-widest">
                        {pred.draw_time}
                      </div>
                      
                      <div className="flex gap-2 justify-center flex-wrap">
                        {pred.predicted_numbers.map((num: string, idx: number) => {
                          const idLimpio = num.trim();
                          const emoji = getAnimalEmoji(idLimpio);
                          const name = getAnimalName(idLimpio);
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[70px]">
                              <span className="text-3xl">{emoji}</span>
                              <span className="text-sm font-black">{idLimpio.padStart(2, '0')}</span>
                              <span className="text-[8px] font-bold uppercase opacity-50">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                      {pred.notes && (
                        <div className="w-full pt-2 border-t border-dashed text-center">
                           <p className="text-[11px] font-bold italic text-muted-foreground uppercase">{pred.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
