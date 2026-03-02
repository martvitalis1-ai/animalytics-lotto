import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLotteryLogo } from './LotterySelector';

export function SequenceMatrixView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [sequences, setSequences] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);

  const loadSequences = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('result_number')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: true })
        .order('created_at', { ascending: true });

      if (data && data.length > 1) {
        const matrix: any = {};
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
          <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-primary italic">
            <TrendingUp className="w-7 h-7 text-primary" /> Matriz de Secuencia (Sucesores)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[220px] h-10 bg-background font-black text-xs border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-bold">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {numberRange.map(num => {
                const successors = sequences[num] ? Object.entries(sequences[num]).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5) : [];
                if (successors.length === 0) return null;
                const animal = getAnimalByCode(num);
                const totalDraws = Object.values(sequences[num]).reduce((a:any, b:any) => a + b, 0);

                return (
                  <div key={num} className="bg-card border-2 rounded-3xl p-5 shadow-xl hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between border-b-2 border-primary/10 pb-3 mb-4">
                       <div className="flex items-center gap-3">
                          <span className="text-5xl">{getAnimalEmoji(num)}</span>
                          <div>
                             <p className="text-xs font-black text-primary uppercase leading-none">{animal?.name}</p>
                             <p className="font-mono font-black text-2xl mt-1">#{num.padStart(2, '0')}</p>
                          </div>
                       </div>
                       <div className="text-right"><p className="text-[10px] font-black text-primary">{totalDraws} casos</p></div>
                    </div>
                    <div className="space-y-2">
                       {successors.map(([nextNum, count]:any, idx) => {
                          const prob = Math.round((count / totalDraws) * 100);
                          return (
                            <div key={nextNum} className={`flex items-center justify-between p-2 rounded-2xl border ${idx === 0 ? 'bg-primary/10 border-primary/40' : 'bg-muted/30 border-transparent'}`}>
                               <div className="flex items-center gap-2">
                                  <span className="text-xl">{getAnimalEmoji(nextNum)}</span>
                                  <span className="font-mono font-black text-sm">{nextNum.padStart(2, '0')}</span>
                               </div>
                               <span className="text-[11px] font-black text-primary">{prob}%</span>
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
