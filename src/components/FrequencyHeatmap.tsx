import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  // Mapeo dinámico: Header (08AM) -> DB (08:00 AM)
  const drawTimesMap = useMemo(() => {
    const times = getDrawTimesForLottery(selectedLottery);
    return times.map(t => ({
      display: t.replace(':00 ', '').replace(':30 ', '').replace(' ', ''),
      full: t
    }));
  }, [selectedLottery]);

  // Rango de animales (Corregido 0 y 00)
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
      const { data: history } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', selectedLottery);

      const matrix: Record<string, Record<string, number>> = {};
      
      history?.forEach(draw => {
        const num = draw.result_number.trim();
        const time = draw.draw_time.trim();
        if (!matrix[num]) matrix[num] = {};
        matrix[num][time] = (matrix[num][time] || 0) + 1;
      });

      setHeatData(matrix);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const getCellColor = (count: number) => {
    if (!count) return 'bg-muted/10 text-muted-foreground/20';
    if (count > 80) return 'bg-red-700 text-white font-black animate-pulse'; // Data inyectada
    if (count >= 10) return 'bg-red-600 text-white font-bold shadow-lg';
    if (count >= 5) return 'bg-orange-500 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <TooltipProvider>
      <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-muted/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-primary italic">
              <Grid3X3 className="w-7 h-7 text-primary" /> Matriz de Frecuencia Master
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedLottery} onValueChange={setSelectedLottery}>
                <SelectTrigger className="w-[220px] h-10 bg-background font-black text-xs border-primary/30 shadow-lg">
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
              <Button onClick={loadData} variant="outline" size="icon" className="h-10 w-10 border-primary/30 shadow-md">
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="w-full h-[600px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/30 shadow-md">
                <tr>
                  <th className="p-3 bg-card sticky left-0 z-40 border-r-2 font-black uppercase text-[11px]">#</th>
                  <th className="p-3 bg-card sticky left-[50px] z-40 border-r-2 font-black uppercase text-[11px] text-left">Animal</th>
                  {drawTimesMap.map(t => (
                    <th key={t.full} className="p-2 font-black text-[10px] min-w-[65px] text-center bg-muted/20 border-r uppercase tracking-tighter">
                      {t.display}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {numberRange.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-all group">
                      <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm group-hover:bg-accent text-center">{num}</td>
                      <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-black text-[11px] uppercase group-hover:bg-accent border-r">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl drop-shadow-sm group-hover:scale-125 transition-transform">{getAnimalEmoji(num)}</span> 
                          <span className="truncate tracking-tighter">{animal?.name || 'Animal'}</span>
                        </div>
                      </td>
                      {drawTimesMap.map(t => {
                        const count = heatData[num]?.[t.full] || 0;
                        return (
                          <td key={t.full} className="p-1 text-center border-r">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`w-full h-10 rounded-lg flex items-center justify-center text-xs font-black transition-all ${getCellColor(count)} shadow-sm`}>
                                   {count > 0 ? count : '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border-2 border-primary/30 p-2 shadow-2xl">
                                <p className="text-[10px] font-black uppercase">{animal?.name} (#{num})</p>
                                <p className="text-[9px] font-bold">Frecuencia en {t.display}: {count} veces</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" className="z-50" />
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
