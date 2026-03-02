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

type HeatLevel = 'hot' | 'warm' | 'cold' | 'overdue' | 'none';

interface CellData {
  count: number;
  level: HeatLevel;
  daysSince?: number;
}

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, CellData>>>({});
  const [loading, setLoading] = useState(false);

  const drawTimes = useMemo(() => [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '07:30 PM'
  ], []);
  
  const numberRange = useMemo(() => getCodesForLottery(selectedLottery), [selectedLottery]);

  const loadHeatData = useCallback(async () => {
    setLoading(true);
    try {
      // ABSORCIÓN TOTAL: Succionamos cada sorteo desde el inicio de los tiempos
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time, draw_date')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false });

      if (error) throw error;

      const matrix: Record<string, Record<string, CellData>> = {};
      const globalLastSeen: Record<string, Date> = {};
      const now = new Date();
      
      // Inicialización de la Matriz Maestra
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => {
          matrix[num][time] = { count: 0, level: 'none' };
        });
      });

      // Procesamiento Forense de Datos
      history?.forEach(draw => {
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

      // Aplicación de Niveles de Calor según Frecuencia Histórica
      numberRange.forEach(num => {
        const lastSeen = globalLastSeen[num];
        const daysSince = lastSeen ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 999;

        drawTimes.forEach(time => {
          const cell = matrix[num][time];
          cell.daysSince = daysSince;
          
          if (daysSince > 15 && daysSince !== 999) {
            cell.level = 'overdue';
          } else if (cell.count >= 5) {
            cell.level = 'hot';
          } else if (cell.count >= 3) {
            cell.level = 'warm';
          } else if (cell.count > 0) {
            cell.level = 'cold';
          }
        });
      });

      setHeatData(matrix);
    } catch (error) {
      console.error('Error cargando matriz:', error);
    }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => { loadHeatData(); }, [loadHeatData]);

  const getCellClass = (level: HeatLevel) => {
    switch (level) {
      case 'hot': return 'bg-red-600 text-white font-black animate-pulse shadow-inner';
      case 'warm': return 'bg-orange-500 text-white font-bold shadow-sm';
      case 'cold': return 'bg-blue-500 text-white shadow-sm';
      case 'overdue': return 'bg-slate-400 text-white opacity-40';
      default: return 'bg-muted/20 text-muted-foreground/20';
    }
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-primary">
            <Grid3X3 className="w-6 h-6" /> Matriz de Frecuencia Histórica
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
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
            <Button onClick={loadHeatData} disabled={loading} variant="outline" size="icon" className="h-9 w-9 border-primary/20">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 p-2 bg-background/50 rounded-xl border border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-red-600 animate-pulse"/> <Flame className="w-3 h-3 text-red-500"/> Caliente (5+)</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-orange-500"/> Frecuente (3+)</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-blue-500"/> <Snowflake className="w-3 h-3 text-blue-500"/> Frío (1+)</div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase"><div className="w-3 h-3 rounded bg-slate-400"/> <Clock className="w-3 h-3 text-gray-500"/> Vencido</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[550px] rounded-b-xl">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/20 shadow-md">
                <tr>
                  <th className="p-3 text-left font-black uppercase text-[11px] bg-card sticky left-0 z-40 border-r-2" style={{ width: '50px' }}>#</th>
                  <th className="p-3 text-left font-black uppercase text-[11px] bg-card sticky left-[50px] z-40 border-r-2" style={{ width: '120px' }}>Animal</th>
                  {drawTimes.map(time => (
                    <th key={time} className="p-2 text-center font-black text-[10px] bg-muted/20 min-w-[55px] uppercase tracking-tighter">
                      {time.replace(':00 ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {numberRange.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-3 font-mono font-black text-sm bg-card sticky left-0 z-10 border-r-2 group-hover:bg-accent group-hover:text-accent-foreground">
                        {num === "0" ? "0" : num === "00" ? "00" : num.padStart(2, '0')}
                      </td>
                      <td className="p-2 bg-card sticky left-[50px] z-10 border-r-2 group-hover:bg-accent group-hover:text-accent-foreground shadow-sm">
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
                          <td key={time} className="p-1 text-center border">
                            <div className={`w-full h-9 rounded flex items-center justify-center text-xs font-black transition-all ${getCellClass(cell.level)}`}>
                               {cell.count > 0 ? cell.count : '-'}
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
          <ScrollBar orientation="vertical" className="z-50" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
