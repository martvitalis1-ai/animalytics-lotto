import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Loader2, ArrowRight, TrendingUp, Table } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { ScrollArea } from "@/components/ui/scroll-area";

export function SequenceMatrixView() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [sequences, setSequences] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);

  const loadSequences = async () => {
    setLoading(true);
    // ABSORCIÓN TOTAL: Sin límites. Analizamos toda la cadena de resultados.
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
    setLoading(false);
  };

  useEffect(() => { loadSequences(); }, [selectedLottery]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-primary">
            <TrendingUp className="w-6 h-6" /> Matriz de Secuencia Histórica
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
              <SelectContent className="font-bold">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
           Análisis de Arrastre: ¿Qué animal atrae al siguiente basándose en toda la historia?
        </p>
      </CardHeader>
      
      <CardContent className="p-4 bg-muted/5">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {numberRange.map(num => {
                const successors = sequences[num] ? 
                  Object.entries(sequences[num]).sort((a,b) => b[1] - a[1]).slice(0, 5) : [];
                
                if (successors.length === 0) return null;
                const animal = getAnimalByCode(num);
                const totalDraws = Object.values(sequences[num] || {}).reduce((a, b) => a + b, 0);

                return (
                  <div key={num} className="bg-card border-2 rounded-3xl p-4 shadow-lg hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between border-b-2 border-primary/10 pb-2 mb-3">
                      <div className="flex items-center gap-3">
                         <span className="text-4xl group-hover:scale-110 transition-transform">{getAnimalEmoji(num)}</span>
                         <div>
                            <p className="text-xs font-black text-primary uppercase tracking-tighter leading-none">{animal?.name}</p>
                            <p className="font-mono font-black text-xl leading-none mt-1">#{num.padStart(2, '0')}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-muted-foreground uppercase">Muestra</p>
                         <p className="text-sm font-black">{totalDraws}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       {successors.map(([nextNum, count], idx) => {
                          const prob = Math.round((count / totalDraws) * 100);
                          const nextAnimal = getAnimalByCode(nextNum);
                          return (
                            <div key={nextNum} className={`flex items-center justify-between p-2 rounded-2xl border ${idx === 0 ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-transparent'}`}>
                               <div className="flex items-center gap-2">
                                  <span className="text-xl">{getAnimalEmoji(nextNum)}</span>
                                  <span className="font-mono font-black text-sm">{nextNum.padStart(2, '0')}</span>
                                  <span className="text-[9px] font-bold uppercase truncate max-w-[60px]">{nextAnimal?.name}</span>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className={`text-[10px] font-black ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{prob}%</span>
                                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                     <div className="h-full bg-primary" style={{width: `${prob}%`}} />
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
