import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame, Snowflake, Clock, Ban } from "lucide-react";
import { LOTTERIES, DRAW_TIMES_FULL } from '@/lib/constants';
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

// Memoized cell component to prevent re-renders
const HeatCell = ({ cell, animal, num, time }: { 
  cell: CellData; 
  animal: { name?: string } | undefined; 
  num: string; 
  time: string 
}) => {
  const getCellStyle = (level: HeatLevel): string => {
    switch (level) {
      case 'hot': return 'bg-red-500 text-white';
      case 'warm': return 'bg-orange-400 text-white';
      case 'cold': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-gray-400 text-white';
      default: return 'bg-muted/30 text-muted-foreground';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`
            w-full h-8 rounded flex items-center justify-center 
            text-[10px] font-bold cursor-default transition-transform
            hover:scale-110
            ${getCellStyle(cell.level)}
          `}
        >
          {cell.count || '-'}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <p className="font-bold">{animal?.name || `#${num}`} ({num})</p>
          <p>Hora: {time}</p>
          <p>Frecuencia: {cell.count} veces</p>
          {cell.daysSince !== undefined && (
            <p>Último: hace {cell.daysSince} días</p>
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

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const drawTimes = useMemo(() => DRAW_TIMES_FULL.slice(1, -1), []); // 9AM to 6PM
  
  // Get appropriate number range for lottery - MEMOIZED
  const numberRange = useMemo(() => {
    return getCodesForLottery(selectedLottery);
  }, [selectedLottery]);

  // Visible numbers for lazy loading
  const visibleNumbers = useMemo(() => {
    return numberRange.slice(visibleRange.start, visibleRange.end);
  }, [numberRange, visibleRange]);

  const loadHeatData = useCallback(async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .gte('draw_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (!history) {
        setLoading(false);
        return;
      }

      // Build frequency matrix - optimized
      const matrix: Record<string, Record<string, CellData>> = {};
      const globalLastSeen: Record<string, Date> = {};
      const now = new Date();
      
      // Initialize matrix
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => {
          matrix[num][time] = { count: 0, level: 'none' };
        });
      });

      // Count frequencies
      history.forEach(draw => {
        let num = draw.result_number?.toString().trim();
        if (!num) return;
        
        // Normalize: keep "0" and "00" distinct
        if (num !== "0" && num !== "00" && !isNaN(parseInt(num))) {
          num = parseInt(num).toString();
        }
        
        const time = draw.draw_time;
        
        if (matrix[num] && matrix[num][time] !== undefined) {
          matrix[num][time].count++;
          
          const drawDate = new Date(draw.created_at || draw.draw_date);
          if (!globalLastSeen[num] || drawDate > globalLastSeen[num]) {
            globalLastSeen[num] = drawDate;
          }
        }
      });

      // Calculate heat levels
      const allCounts: number[] = [];
      Object.values(matrix).forEach(times => {
        Object.values(times).forEach(cell => {
          if (cell.count > 0) allCounts.push(cell.count);
        });
      });
      
      const avgCount = allCounts.length > 0 
        ? allCounts.reduce((a, b) => a + b, 0) / allCounts.length 
        : 1;

      // Assign levels
      numberRange.forEach(num => {
        const lastSeen = globalLastSeen[num];
        const daysSince = lastSeen 
          ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        drawTimes.forEach(time => {
          const cell = matrix[num][time];
          cell.daysSince = daysSince;
          cell.lastSeen = lastSeen?.toLocaleDateString();

          if (daysSince > 15) {
            cell.level = 'overdue';
          } else if (cell.count >= avgCount * 1.5) {
            cell.level = 'hot';
          } else if (cell.count >= avgCount * 0.8) {
            cell.level = 'warm';
          } else if (cell.count > 0) {
            cell.level = 'cold';
          } else {
            cell.level = 'none';
          }
        });
      });

      setHeatData(matrix);
    } catch (error) {
      console.error('Error loading heat data:', error);
    }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => {
    loadHeatData();
  }, [loadHeatData]);

  // Load more on scroll
  const loadMore = useCallback(() => {
    setVisibleRange(prev => ({
      start: prev.start,
      end: Math.min(prev.end + 20, numberRange.length)
    }));
  }, [numberRange.length]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Matriz de Frecuencia (Heatmap)
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={(v) => {
              setSelectedLottery(v);
              setVisibleRange({ start: 0, end: 20 });
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                      {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={loadHeatData} disabled={loading} variant="outline" size="sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Legend with tooltip */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <div className="w-4 h-4 rounded bg-red-500" />
                <Flame className="w-3 h-3 text-red-500" />
                <span>Caliente</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Esta matriz analiza la repetición de animales en periodos específicos para detectar tendencias calientes y frías.</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span>Posible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <Snowflake className="w-3 h-3 text-blue-500" />
            <span>Frío</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <Clock className="w-3 h-3 text-gray-500" />
            <span>Vencido (15+ días)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/50 border" />
            <Ban className="w-3 h-3 text-muted-foreground" />
            <span>Sin datos</span>
          </div>
        </div>
        
        {/* Documentation tooltip */}
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          ℹ️ Esta matriz analiza la repetición de animales en periodos específicos para detectar tendencias calientes y frías.
        </p>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <ScrollArea className="w-full h-[400px]">
              <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 z-20 bg-card">
                    <tr>
                      <th className="sticky left-0 z-30 bg-card p-2 text-left font-semibold border-b">
                        #
                      </th>
                      <th className="sticky left-10 z-30 bg-card p-2 text-left font-semibold border-b">
                        Animal
                      </th>
                      {drawTimes.map(time => (
                        <th key={time} className="p-1 text-center font-medium border-b min-w-[45px]">
                          {time.replace(':00 ', '').replace(' ', '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNumbers.map(num => {
                      const animal = getAnimalByCode(num);
                      const emoji = getAnimalEmoji(num);
                      return (
                        <tr key={num} className="hover:bg-muted/30">
                          <td className="sticky left-0 z-10 bg-card p-1 font-mono font-bold border-b text-sm">
                            {num === "0" ? "0" : num === "00" ? "00" : num.padStart(2, '0')}
                          </td>
                          <td className="sticky left-10 z-10 bg-card p-1 border-b">
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{emoji}</span>
                              <span className="truncate max-w-20 text-[10px] font-medium">
                                {animal?.name || `#${num}`}
                              </span>
                            </div>
                          </td>
                          {drawTimes.map(time => {
                            const cell = heatData[num]?.[time] || { count: 0, level: 'none' as HeatLevel };
                            return (
                              <td key={time} className="p-0.5 border-b">
                                <HeatCell cell={cell} animal={animal} num={num} time={time} />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
            
            {/* Load more button */}
            {visibleRange.end < numberRange.length && (
              <Button onClick={loadMore} variant="outline" className="w-full mt-2" size="sm">
                Cargar más ({numberRange.length - visibleRange.end} restantes)
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
