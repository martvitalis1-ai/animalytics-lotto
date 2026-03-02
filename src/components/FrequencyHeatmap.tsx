import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame, Snowflake, Clock, Ban } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
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
      case 'hot': return 'bg-red-500 text-white shadow-lg font-black animate-pulse';
      case 'warm': return 'bg-orange-400 text-white font-bold';
      case 'cold': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-gray-400 text-white opacity-50';
      default: return 'bg-muted/30 text-muted-foreground/30';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-full h-8 rounded flex items-center justify-center text-[10px] font-bold cursor-default transition-transform hover:scale-110 ${getCellStyle(cell.level)}`}>
          {cell.count || '-'}
        </div>
      </TooltipTrigger>
      <TooltipContent className="z-50 bg-popover border-2 border-primary/20 shadow-2xl">
        <div className="text-xs p-1">
          <p className="font-black text-primary uppercase">{animal?.name || `#${num}`} ({num})</p>
          <p className="font-bold">Hora: {time}</p>
          <p className="font-bold">Frecuencia: {cell.count} veces</p>
          {cell.daysSince !== undefined && cell.daysSince !== 999 && (
            <p className="text-muted-foreground italic mt-1 border-t pt-1">Último: hace {cell.daysSince} días</p>
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
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);
  const visibleNumbers = useMemo(() => numberRange.slice(visibleRange.start, visibleRange.end), [numberRange, visibleRange]);

  const drawTimes = useMemo(() => [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '07:30 PM'
  ], []);

  const loadHeatData = useCallback(async () => {
    setLoading(true);
    try {
      // ABSORCIÓN TOTAL: Eliminamos el filtro de 30 días para succionar toda la historia
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('created_at', { ascending: false });

      if (!history) return;

      const matrix: Record<string, Record<string, CellData>> = {};
      const globalLastSeen: Record<string, Date> = {};
      const now = new Date();
      
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => { matrix[num][time] = { count: 0, level: 'none' }; });
      });

      history.forEach(draw => {
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
          cell.lastSeen = lastSeen?.toLocaleDateString();
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
      <Card className="glass-card border-2 border-primary/30 shadow-2xl">
        <CardHeader className="pb-2 bg-muted/10 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <Grid3X3 className="w-6 h-6 text-primary" /> Matriz de Frecuencia Master
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setVisibleRange({ start: 0, end: 20 }); }}>
                <SelectTrigger className="w-[200px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
                <SelectContent className="font-bold">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      <div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadHeatData} disabled={loading} variant="outline" size="icon" className="h-9 w-9 border-primary/20">
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-black uppercase tracking-widest p-2 bg-background/50 rounded-lg">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500 animate-pulse"/> Caliente</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-400"/> Posible</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500"/> Frío</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400"/> Vencido</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="w-full h-[500px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2">
                <tr>
                  <th className="p-3 bg-card sticky left-0 z-40 border-r-2 font-black uppercase text-[10px]" style={{width:'50px'}}>#</th>
                  <th className="p-3 bg-card sticky left-[50px] z-40 border-r-2 font-black uppercase text-[10px] text-left" style={{width:'120px'}}>Animal</th>
                  {drawTimes.map(t => (
                    <th key={t} className="p-2 font-black text-[9px] min-w-[55px] text-center bg-muted/20 uppercase">{t.replace(':00 ', '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleNumbers.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm group-hover:bg-accent">{num.padStart(2, '0')}</td>
                      <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-black text-[10px] uppercase group-hover:bg-accent">
                        <div className="flex items-center gap-2"><span>{getAnimalEmoji(num)}</span> <span>{animal?.name}</span></div>
                      </td>
                      {drawTimes.map(t => {
                        const cell = heatData[num]?.[t] || { count: 0, level: 'none' };
                        return (
                          <td key={t} className="p-1 text-center">
                            <HeatCell cell={cell} animal={animal} num={num} time={t} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" className="z-50" />
          </ScrollArea>
          {visibleRange.end < numberRange.length && (
            <div className="p-4 bg-muted/10 border-t">
              <Button onClick={() => setVisibleRange(p => ({...p, end: p.end + 20}))} variant="ghost" className="w-full font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all">Mostrar más animales del búnker...</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
