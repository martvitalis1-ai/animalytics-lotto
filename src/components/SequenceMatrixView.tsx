import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLotteryLogo } from './LotterySelector';

export function SequenceMatrixView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [sequences, setSequences] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);

  const loadSequences = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: true })
        .order('created_at', { ascending: true });

      if (data && data.length > 1) {
        const matrix: Record<string, Record<string, number>> = {};
        for (let i = 0; i < data.length - 1; i++) {
          const current = data[i].result_number;
          const next = data[i+1].result_number;
          if (!matrix[current]) matrix[current] = {};
          matrix[current][next] = (matrix[current][next] || 0) + 1;
        }
        setSequences(matrix);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadSequences(); }, [loadSequences]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-primary">
            <TrendingUp className="w-6 h-6" /> Matriz de Secuencia (Sucesores)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[200px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
              <SelectContent className="font-bold">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadSequences} variant="outline" size="icon" className="h-9 w-9"><RefreshCw className={loading ? 'animate-spin' : ''}/></Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 bg-muted/5">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /><p className="font-black text-xs mt-4 uppercase">Escaneando cadena histórica...</p></div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {numberRange.map(num => {
                const successors = sequences[num] ? 
                  Object.entries(sequences[num]).sort((a,b) => b[1] - a[1]).slice(0, 5) : [];
                if (successors.length === 0) return null;
                const animal = getAnimalByCode(num);
                const totalDraws = Object.values(sequences[num]).reduce((a, b) => a + b, 0);

                return (
                  <div key={num} className="bg-card border-2 rounded-3xl p-5 shadow-xl hover:border-primary/50 transition-all group relative">
                    <div className="flex items-center justify-between border-b-2 border-primary/10 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                         <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-md">{getAnimalEmoji(num)}</span>
                         <div>
                            <p className="text-xs font-black text-primary uppercase leading-none tracking-tighter">{animal?.name}</p>
                            <p className="font-mono font-black text-2xl mt-1">#{num.padStart(2, '0')}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-muted-foreground uppercase italic">Arrastre</p>
                         <p className="text-lg font-black text-primary">{totalDraws}</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                       {successors.map(([nextNum, count], idx) => {
                          const prob = Math.round((count / totalDraws) * 100);
                          const nextAnimal = getAnimalByCode(nextNum);
                          return (
                            <div key={nextNum} className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all ${idx === 0 ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-muted/30 border-transparent'}`}>
                               <div className="flex items-center gap-2">
                                  <span className="text-2xl">{getAnimalEmoji(nextNum)}</span>
                                  <span className="font-mono font-black text-base">{nextNum.padStart(2, '0')}</span>
                                  <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[70px]">{nextAnimal?.name}</span>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className={`text-[11px] font-black ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{prob}%</span>
                                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                     <div className={`h-full ${idx === 0 ? 'bg-primary' : 'bg-slate-400'}`} style={{width: `${prob}%`}} />
                                  </div>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
