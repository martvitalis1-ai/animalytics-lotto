import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame, Clock } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 25 });

  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);
  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);
  const visibleNumbers = useMemo(() => numberRange.slice(visibleRange.start, visibleRange.end), [numberRange, visibleRange]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time, draw_date')
        .eq('lottery_type', selectedLottery);

      const matrix: any = {};
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => { matrix[num][time] = 0; });
      });

      data?.forEach(draw => {
        if (matrix[draw.result_number] && matrix[draw.result_number][draw.draw_time] !== undefined) {
          matrix[draw.result_number][draw.draw_time]++;
        }
      });
      setHeatData(matrix);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => { loadData(); }, [loadData]);

  const getCellColor = (count: number) => {
    if (!count) return 'bg-muted/20 text-muted-foreground/20';
    if (count >= 5) return 'bg-red-600 text-white font-black animate-pulse shadow-lg';
    if (count >= 3) return 'bg-orange-500 text-white font-bold';
    return 'bg-blue-600 text-white';
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-muted/10 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-primary italic">
            <Grid3X3 className="w-7 h-7 text-primary" /> Matriz de Frecuencia Master
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setVisibleRange({ start: 0, end: 25 }); }}>
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
            <Button onClick={loadData} variant="outline" size="icon" className="h-10 w-10 border-primary/30"><RefreshCw className={loading ? 'animate-spin' : ''} /></Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[550px]">
          <div className="min-w-[850px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/20 shadow-md">
                <tr>
                  <th className="p-3 bg-card sticky left-0 z-40 border-r-2 font-black uppercase text-[10px]" style={{width:'50px'}}>#</th>
                  <th className="p-3 bg-card sticky left-[50px] z-40 border-r-2 font-black uppercase text-[10px] text-left" style={{width:'130px'}}>Animal</th>
                  {drawTimes.map(time => (
                    <th key={time} className="p-2 font-black text-[9px] min-w-[60px] text-center bg-muted/20 uppercase tracking-tighter border-r">
                      {time.replace(':00 ', '').replace(':30 ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleNumbers.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm group-hover:bg-accent">{num.padStart(2, '0')}</td>
                      <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-black text-[10px] uppercase group-hover:bg-accent border-r">
                        <div className="flex items-center gap-2"><span>{getAnimalEmoji(num)}</span> <span>{animal?.name}</span></div>
                      </td>
                      {drawTimes.map(t => {
                        const count = heatData[num]?.[t] || 0;
                        return (
                          <td key={t} className="p-1 text-center border-r">
                            <div title={`${animal?.name} - ${t}: ${count} veces`} className={`w-full h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all ${getCellColor(count)}`}>
                               {count > 0 ? count : '-'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" className="z-50" />
        </ScrollArea>
        {visibleRange.end < numberRange.length && (
          <div className="p-4 bg-muted/10 border-t">
            <Button onClick={() => setVisibleRange(p => ({...p, end: p.end + 25}))} variant="ghost" className="w-full font-black uppercase text-xs border-2 border-dashed border-primary/20 tracking-widest">Cargar más resultados del búnker...</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
