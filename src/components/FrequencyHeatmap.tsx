import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3 } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  // Mapeo inteligente de horas para que la matriz conecte con Supabase
  const drawTimesMap = useMemo(() => {
    const times = getDrawTimesForLottery(selectedLottery);
    return times.map(t => ({
      display: t.replace(':00 ', '').replace(':30 ', '').replace(' ', ''),
      full: t
    }));
  }, [selectedLottery]);

  const numberRange = useMemo(() => {
    let codes: string[] = [];
    if (!selectedLottery.includes('guacharito')) codes.push('0');
    codes.push('00');
    const max = selectedLottery.includes('guacharito') ? 99 : selectedLottery.includes('guacharo') ? 75 : 36;
    for (let i = 1; i <= max; i++) {
      codes.push(i.toString().padStart(2, '0'));
    }
    return codes;
  }, [selectedLottery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', selectedLottery);

      if (error) throw error;

      const matrix: Record<string, Record<string, number>> = {};
      
      history?.forEach(draw => {
        const num = draw.result_number.trim();
        const time = draw.draw_time.trim();
        
        if (!matrix[num]) matrix[num] = {};
        matrix[num][time] = (matrix[num][time] || 0) + 1;
      });

      setHeatData(matrix);
    } catch (e) {
      console.error('Error:', e);
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const getCellColor = (count: number) => {
    if (!count || count === 0) return 'bg-muted/10 text-muted-foreground/10';
    // Ajuste de colores para que el 92 no queme la vista
    if (count > 80) return 'bg-red-700 text-white font-black animate-pulse'; 
    if (count >= 10) return 'bg-red-500 text-white font-bold';
    if (count >= 5) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
            <Grid3X3 className="w-6 h-6 text-primary" /> Matriz de Frecuencia Master
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[200px] h-9 bg-background font-black text-xs border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline" size="icon" className="h-9 w-9">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[550px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-30 bg-card border-b-2">
              <tr>
                <th className="p-3 bg-card sticky left-0 z-40 border-r-2 font-black uppercase text-[10px]">#</th>
                <th className="p-3 bg-card sticky left-[45px] z-40 border-r-2 font-black uppercase text-[10px] text-left">Animal</th>
                {drawTimesMap.map(t => (
                  <th key={t.full} className="p-2 font-black text-[9px] min-w-[65px] text-center bg-muted/50 uppercase border-r">
                    {t.display}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numberRange.map(num => {
                const animal = getAnimalByCode(num);
                return (
                  <tr key={num} className="hover:bg-primary/5 transition-colors border-b">
                    <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm text-center">{num}</td>
                    <td className="p-2 sticky left-[45px] bg-card z-10 border-r-2 font-black text-[10px] uppercase min-w-[120px] border-r">
                      <div className="flex items-center gap-2">
                        <span>{getAnimalEmoji(num)}</span>
                        <span className="truncate">{animal?.name || 'Animal'}</span>
                      </div>
                    </td>
                    {drawTimesMap.map(t => {
                      const count = heatData[num]?.[t.full] || 0;
                      return (
                        <td key={t.full} className={`p-1 border-r text-center text-xs font-black transition-all ${getCellColor(count)}`}>
                          {count > 0 ? count : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
