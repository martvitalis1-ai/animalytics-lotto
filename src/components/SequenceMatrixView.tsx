import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getLotteryLogo } from './LotterySelector';

export function SequenceMatrixView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [sequences, setSequences] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);

  // FUNCIÓN DE NORMALIZACIÓN: Asegura que "01" y "1" se unifiquen, pero respeta el "00"
  const normalize = (val: string | number) => {
    if (val === undefined || val === null) return "";
    const s = val.toString().trim();
    if (s === "00") return "00"; // Respetamos la Ballena
    if (s === "0") return "0";   // Respetamos el Delfín
    return parseInt(s, 10).toString(); // Convierte "01" en "1", "05" en "5", etc.
  };

  const loadSequences = useCallback(async () => {
    setLoading(true);
    try {
      let allResults: any[] = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // ABSORCIÓN TOTAL: Traemos todos los registros históricos
      while (hasMore) {
        const { data, error } = await supabase
          .from('lottery_results')
          .select('result_number')
          .eq('lottery_type', selectedLottery)
          .order('draw_date', { ascending: true })
          .order('created_at', { ascending: true })
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allResults = [...allResults, ...data];
          if (data.length < 1000) {
            hasMore = false;
          } else {
            from += 1000;
            to += 1000;
          }
        } else {
          hasMore = false;
        }
      }

      if (allResults.length > 1) {
        const matrix: Record<string, Record<string, number>> = {};
        for (let i = 0; i < allResults.length - 1; i++) {
          const currentValue = allResults[i]?.result_number;
          const nextValue = allResults[i+1]?.result_number;
          
          if (currentValue !== undefined && nextValue !== undefined) {
            // NORMALIZAMOS ambos valores para que no importe si vienen como "01" o "1"
            const current = normalize(currentValue);
            const next = normalize(nextValue);
            
            if (current && next) {
              if (!matrix[current]) matrix[current] = {};
              matrix[current][next] = (matrix[current][next] || 0) + 1;
            }
          }
        }
        setSequences(matrix);
      } else {
        setSequences({});
      }
    } catch (e) { 
      console.error("Error absorbiendo datos:", e); 
      setSequences({});
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadSequences(); }, [loadSequences]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-muted/10 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-primary italic">
            <TrendingUp className="w-7 h-7 text-primary" /> Matriz de Secuencia (Sucesores)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[240px] h-10 bg-background font-black text-xs border-primary/30 shadow-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-bold">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-5 h-5 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadSequences} variant="outline" size="icon" className="h-10 w-10 border-primary/30 shadow-md">
              <RefreshCw className={loading ? 'animate-spin text-primary' : 'text-primary'}/></Button>
          </div>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
           <Sparkles className="w-3 h-3 text-amber-500" /> ABSORCIÓN HISTÓRICA COMPLETA (100%)
        </p>
      </CardHeader>
      
      <CardContent className="p-6 bg-muted/5">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-xs font-bold text-primary mt-4 animate-pulse uppercase tracking-widest">Analizando todos los sorteos históricos...</p>
          </div>
        ) : (
          <ScrollArea className="h-[650px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {numberRange.map(num => {
                // Normalizamos el número del rango para buscarlo en la matriz procesada
                const normalizedNum = normalize(num);
                const successors = sequences[normalizedNum] ? Object.entries(sequences[normalizedNum]).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5) : [];
                const animal = getAnimalByCode(num);
                const totalDraws = sequences[normalizedNum] ? Object.values(sequences[normalizedNum]).reduce((acc: number, val: number) => acc + val, 0) : 0;

                return (
                  <div key={num} className="bg-card border-2 rounded-[2rem] p-6 shadow-xl hover:border-primary/50 transition-all group relative overflow-hidden">
                    <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4 mb-5">
                      <div className="flex items-center gap-4">
                         <span className="text-6xl group-hover:rotate-12 transition-transform duration-500 drop-shadow-xl">{getAnimalEmoji(num)}</span>
                         <div>
                            <p className="text-xs font-black text-primary uppercase tracking-tighter leading-none">{animal?.name || 'Animal'}</p>
                            <p className="font-mono font-black text-3xl mt-2 tracking-tighter leading-none">#{num}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted-foreground uppercase leading-none italic">Casos</p>
                         <p className="text-2xl font-black text-primary leading-none mt-2">{totalDraws}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       {successors.length > 0 ? (
                        successors.map(([nextNum, count]:any, idx) => {
                          const prob = totalDraws > 0 ? Math.round((count / totalDraws) * 100) : 0;
                          const nextAnimal = getAnimalByCode(nextNum);
                          return (
                            <div key={nextNum} className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300 ${idx === 0 ? 'bg-primary/10 border-primary/40 shadow-inner' : 'bg-muted/30 border-transparent'}`}>
                               <div className="flex items-center gap-3">
                                  <span className="text-3xl">{getAnimalEmoji(nextNum)}</span>
                                  <div>
                                     <span className="font-mono font-black text-base block leading-none">#{nextNum}</span>
                                     <span className="text-[9px] font-black uppercase text-muted-foreground">{nextAnimal?.name || 'Desconocido'}</span>
                                  </div>
                               </div>
                               <div className="flex flex-col items-end gap-1.5">
                                  <span className={`text-xs font-black ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{prob}%</span>
                                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                     <div className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-primary' : 'bg-slate-400'}`} style={{width: `${prob}%`}} />
                                  </div>
                               </div>
                            </div>
                          );
                       })
                      ) : (
                        <div className="py-6 text-center border-2 border-dashed border-muted-foreground/20 rounded-2xl">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sin datos históricos</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
