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
} from "@/components/ui/tooltip";

type HeatLevel = 'hot' | 'warm' | 'cold' | 'overdue' | 'none';

interface CellData {
  count: number;
  level: HeatLevel;
  lastSeen?: string;
  daysSince?: number;
}

// Componente de Celda Optimizado con Tooltip
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
        <div className={`w-full h-8 rounded flex items-center justify-center text-[10px] cursor-pointer transition-all hover:scale-110 ${getCellStyle(cell.level)}`}>
          {cell.count > 0 ? cell.count : '-'}
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-popover border-2 border-primary/20 shadow-xl">
        <div className="text-xs p-1">
          <p className="font-black text-primary uppercase">{animal?.name || 'Animal'} (#{num})</p>
          <p className="font-bold">Hora: <span className="text-foreground">{time}</span></p>
          <p className="font-bold">Frecuencia: <span className="text-foreground">{cell.count} veces</span></p>
          {cell.daysSince !== undefined && cell.daysSince !== 999 && (
            <p className="text-muted-foreground italic mt-1 border-t pt-1">Última vez: hace {cell.daysSince} días</p>
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

  const drawTimes = useMemo(() => [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '07:30 PM'
  ], []);
  
  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);
  const visibleNumbers = useMemo(() => numberRange.slice(visibleRange.start, visibleRange.end), [numberRange, visibleRange]);

  const loadHeatData = useCallback(async () => {
    setLoading(true);
    try {
      // Jalamos TODO el historial disponible (Enero + Marzo) para máxima precisión
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false });

      if (!history) return;

      const matrix: Record<string, Record<string, CellData>> = {};
      const globalLastSeen: Record<string, Date> = {};
      const now = new Date();
      
      // Inicialización
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => {
          matrix[num][time] = { count: 0, level: 'none' };
        });
      });

      // Conteo de Frecuencias Real
      history.forEach(draw => {
        const num = draw.result_number;
        const time = draw.draw_time;
        if (matrix[num] && matrix[num][time]) {
          matrix[num][time].count++;
          const drawDate = new Date(draw.draw_date);
          if (!globalLastSeen[num] || drawDate > globalLastSeen[num]) {
            globalLastSeen[num] = drawDate;
          }
        }
      });

      // Cálculo inteligente de Niveles de Calor
      numberRange.forEach(num => {
        const lastSeen = globalLastSeen[num];
        const daysSince = lastSeen ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 999;

        drawTimes.forEach(time => {
          const cell = matrix[num][time];
          cell.daysSince = daysSince;
          
          if (daysSince > 15 && daysSince !== 999) {
            cell.level = 'overdue';
          } else if (cell.count >= 3) {
            cell.level = 'hot';
          } else if (cell.count === 2) {
            cell.level = 'warm';
          } else if (cell.count === 1) {
            cell.level = 'cold';
          } else {
            cell.level = 'none';
          }
        });
      });

      setHeatData(matrix);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => { loadHeatData(); }, [loadHeatData]);

  const loadMore = () => {
    setVisibleRange(prev => ({ ...prev, end: Math.min(prev.end + 25, numberRange.length) }));
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl">
      <CardHeader className="pb-2 bg-muted/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
            <Grid3X3 className="w-6 h-6 text-primary" /> Matriz de Frecuencia Master
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setVisibleRange({ start: 0, end: 25 }); }}>
              <SelectTrigger className="w-[200px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
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
            <Button onClick={loadHeatData} disabled={loading} variant="outline" size="icon" className="h-9 w-9 border-primary/20">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </div>
        </div>
        
        {/* Leyenda de Lujo */}
        <div className="flex flex-wrap gap-4 mt-4 p-2 bg-background/50 rounded-xl border border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-red-500 animate-pulse"/> <Flame className="w-3 h-3 text-red-500"/> Caliente</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-orange-400"/> Posible</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-blue-500"/> <Snowflake className="w-3 h-3 text-blue-500"/> Frío</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-gray-400"/> <Clock className="w-3 h-3 text-gray-500"/> Vencido</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-muted/50 border"/> <Ban className="w-3 h-3 text-muted-foreground"/> Sin Datos</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[500px] rounded-b-xl">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/20">
                <tr>
                  <th className="p-3 text-left font-black uppercase text-[11px] bg-card sticky left-0 z-40 border-r-2" style={{ width: '50px' }}>#</th>
                  <th className="p-3 text-left font-black uppercase text-[11px] bg-card sticky left-[50px] z-40 border-r-2" style={{ width: '120px' }}>Animal</th>
                  {drawTimes.map(time => (
                    <th key={time} className="p-2 text-center font-black text-[10px] bg-muted/20 min-w-[55px]">
                      {time.replace(':00 ', '').replace(' ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleNumbers.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-3 font-mono font-black text-sm bg-card sticky left-0 z-10 border-r-2 group-hover:bg-accent group-hover:text-accent-foreground">
                        {num === "0" ? "0" : num === "00" ? "00" : num.padStart(2, '0')}
                      </td>
                      <td className="p-2 bg-card sticky left-[50px] z-10 border-r-2 group-hover:bg-accent group-hover:text-accent-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getAnimalEmoji(num)}</span>
                          <span className="truncate text-[10px] font-black uppercase tracking-tighter">
                            {animal?.name || 'Animal'}
                          </span>
                        </div>
                      </td>
                      {drawTimes.map(time => {
                        const cell = heatData[num]?.[time] || { count: 0, level: 'none' };
                        return (
                          <td key={time} className="p-1 text-center">
                            <HeatCell cell={cell} animal={animal} num={num} time={time} />
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
            <Button onClick={loadMore} variant="ghost" className="w-full font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all">
              Mostrar más animales del búnker ({numberRange.length - visibleRange.end} restantes)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
