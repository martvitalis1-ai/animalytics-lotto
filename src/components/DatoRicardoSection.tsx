import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

interface DatoRicardoSectionProps {
  customName?: string;
  agencyId?: string;
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

    if (agencyId) query = query.eq('agencia_id', agencyId);
    else query = query.is('agencia_id', null);

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

  const getAnimalImage = (code: string) => {
    const strCode = String(code).trim();
    const finalCode = (strCode === '0' || strCode === '00') ? strCode : strCode.padStart(2, '0');
    return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${finalCode}.png`;
  };

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
      
      <CardContent className="space-y-6 pt-6 text-center">
        {predictions.length === 0 ? (
          <div className="py-10 text-center opacity-40 italic flex flex-col items-center gap-2">
            <AlertCircle size={40} />
            <p className="font-black uppercase text-xs tracking-widest text-center">Esperando el próximo bombazo...</p>
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
                    <div key={pred.id} className="flex flex-col items-center gap-3 p-4 bg-white border-2 rounded-[2.5rem] shadow-md">
                      <div className="text-[10px] font-black text-white bg-primary px-4 py-1 rounded-full uppercase tracking-widest">
                        {pred.draw_time}
                      </div>
                      
                      <div className="flex gap-4 justify-center flex-wrap">
                        {pred.predicted_numbers.map((num: string, idx: number) => {
                          const idL = num.trim();
                          const img = getAnimalImage(idL);
                          const name = getAnimalName(idL);
                          const emoji = getAnimalEmoji(idL);
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 min-w-[90px]">
                              <div className="relative w-16 h-16 mb-1">
                                <img src={img} className="w-full h-full object-contain z-10 relative" alt="" crossOrigin="anonymous" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                                <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-10">{emoji}</span>
                              </div>
                              <span className="text-sm font-black">{idL === '0' || idL === '00' ? idL : idL.padStart(2, '0')}</span>
                              <span className="text-[9px] font-bold uppercase opacity-50">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                      {pred.notes && <p className="text-[11px] font-bold italic text-muted-foreground uppercase text-center border-t border-dashed w-full pt-2">{pred.notes}</p>}
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
