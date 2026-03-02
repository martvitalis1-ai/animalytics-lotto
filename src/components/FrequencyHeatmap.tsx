import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame, Snowflake, Clock, Ban } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

type HeatLevel = 'hot' | 'warm' | 'cold' | 'overdue' | 'none';

interface CellData {
  count: number;
  level: HeatLevel;
  lastSeen?: string;
  daysSince?: number;
}

const HeatCell = ({ cell, animal, num, time }: { 
  cell: CellData; 
  animal: any; 
  num: string; 
  time: string 
}) => {
  const getCellStyle = (level: HeatLevel): string => {
    switch (level) {
      case 'hot': return 'bg-red-600 text-white font-black animate-pulse shadow-lg';
      case 'warm': return 'bg-orange-500 text-white font-bold';
      case 'cold': return 'bg-blue-600 text-white';
      case 'overdue': return 'bg-slate-400 text-white opacity-40';
      default: return 'bg-muted/20 text-muted-foreground/20';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-full h-9 rounded-md flex items-center justify-center text-[10px] font-black cursor-crosshair transition-all hover:scale-110 ${getCellStyle(cell.level)}`}>
          {cell.count > 0 ? cell.count : '-'}
        </div>
      </TooltipTrigger>
      <TooltipContent className="z-50 bg-popover border-2 border-primary/30 p-2 shadow-2xl">
        <div className="text-[10px] font-black uppercase space-y-1">
          <p className="text-primary border-b border-primary/20 pb-1">{animal?.name || 'Animal'} (#{num})</p>
          <p>Sorteo: <span className="text-foreground">{time}</span></p>
          <p>Repeticiones: <span className="text-foreground">{cell.count} veces</span></p>
          {cell.daysSince !== undefined && cell.daysSince !== 999 && (
            <p className="text-muted-foreground italic pt-1 border-t">Visto hace {cell.daysSince} días</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, CellData>>>({});
  const [loading, setLoading] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 25 });

  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);
  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);
  const visibleNumbers = useMemo(() => numberRange.slice(visibleRange.start, visibleRange.end), [numberRange, visibleRange]);

  const loadHeatData = useCallback(async () => {
    setLoading(true);
    try {
      // ABSORCIÓN TOTAL: Succión masiva de toda la historia
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false });

      if (error) throw error;

      const matrix: Record<string, Record<string, CellData>> = {};
      const globalLastSeen: Record<string, Date> = {};
      const now = new Date();
      
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => { matrix[num][time] = { count: 0, level: 'none' }; });
      });

      history?.forEach(draw => {
        const num = draw.result_number;
        const time = draw.draw_time;
        if (matrix[num] && matrix[num][time]) {
          matrix[num][time].count++;
          const drawDate = new Date(draw.draw_date);
          if (!globalLastSeen[num] || drawDate > globalLastSeen[num]) globalLastSeen[num] = drawDate;
        }
      });

      numberRange.forEach(num => {
        const lastSeen = globalLastSeen[num];
        const daysSince = lastSeen ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 999;
        drawTimes.forEach(time => {
          const cell = matrix[num][time];
          cell.daysSince = daysSince;
          if (daysSince > 15 && daysSince !== 999) cell.level = 'overdue';
          else if (cell.count >= 5) cell.level = 'hot';
          else if (cell.count >= 3) cell.level = 'warm';
          else if (cell.count > 0) cell.level = 'cold';
        });
      });
      setHeatData(matrix);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => { loadHeatData(); }, [loadHeatData]);

  return (
    <TooltipProvider>
      <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-muted/10 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-primary italic">
              <Grid3X3 className="w-7 h-7 text-primary" /> Matriz de Frecuencia Master
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setVisibleRange({ start: 0, end: 25 }); }}>
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
              <Button onClick={loadHeatData} disabled={loading} variant="outline" size="icon" className="h-10 w-10 border-primary/30 shadow-md">
                {loading ? <Loader2 className="animate-spin text-primary" /> : <RefreshCw className="text-primary" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 p-3 bg-background/60 rounded-xl border-2 border-dashed border-primary/20">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"><div className="w-3.5 h-3.5 rounded bg-red-600 animate-pulse shadow-md"/> <Flame className="w-3 h-3 text-red-500"/> Caliente (5+)</div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"><div className="w-3.5 h-3.5 rounded bg-orange-500 shadow-md"/> Posible (3+)</div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"><div className="w-3.5 h-3.5 rounded bg-blue-600 shadow-md"/> Frío (1+)</div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"><div className="w-3.5 h-3.5 rounded bg-slate-400 opacity-40 shadow-md"/> <Clock className="w-3 h-3 text-gray-500"/> Vencido</div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-muted/5">
          <ScrollArea className="w-full h-[600px] rounded-b-xl shadow-inner">
            <div className="min-w-[900px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/30 shadow-lg">
                  <tr>
                    <th className="p-4 bg-card sticky left-0 z-40 border-r-2 border-primary/10 font-black uppercase text-[11px] tracking-widest" style={{width:'60px'}}>#</th>
                    <th className="p-4 bg-card sticky left-[60px] z-40 border-r-2 border-primary/10 font-black uppercase text-[11px] text-left tracking-widest" style={{width:'150px'}}>Animal</th>
                    {drawTimes.map(t => (
                      <th key={t} className="p-2 font-black text-[10px] min-w-[65px] text-center bg-muted/20 uppercase tracking-tighter border-r border-primary/5">
                        {t.replace(':00 ', '').replace(':30 ', '')}
                        <span className="block text-[8px] opacity-40">{t.includes('AM') ? 'AM' : 'PM'}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleNumbers.map(num => {
                    const animal = getAnimalByCode(num);
                    return (
                      <tr key={num} className="hover:bg-primary/5 transition-all group">
                        <td className="p-4 sticky left-0 bg-card z-10 border-r-2 border-primary/5 font-mono font-black text-sm group-hover:bg-accent group-hover:text-accent-foreground">{num.padStart(2, '0')}</td>
                        <td className="p-2 sticky left-[60px] bg-card z-10 border-r-2 border-primary/10 font-black text-[11px] uppercase group-hover:bg-accent group-hover:text-accent-foreground">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-sm group-hover:scale-125 transition-transform">{getAnimalEmoji(num)}</span> 
                            <span className="truncate tracking-tighter">{animal?.name}</span>
                          </div>
                        </td>
                        {drawTimes.map(t => {
                          const cell = heatData[num]?.[t] || { count: 0, level: 'none' };
                          return (
                            <td key={t} className="p-1 text-center border-r border-primary/5">
                              <HeatCell cell={cell} animal={animal} num={num} time={t} />
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
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
          {visibleRange.end < numberRange.length && (
            <div className="p-5 bg-muted/10 border-t flex justify-center">
              <Button onClick={() => setVisibleRange(p => ({...p, end: p.end + 25}))} variant="ghost" className="w-full max-w-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-primary hover:text-white border-2 border-dashed border-primary/20 transition-all active:scale-95 shadow-lg">
                Cargar mas historial del bunker...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
