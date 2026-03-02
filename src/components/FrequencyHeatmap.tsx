import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Grid3X3, Flame, Snowflake, Clock, Ban, Info } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type HeatLevel = 'hot' | 'warm' | 'cold' | 'overdue' | 'none';
interface CellData { count: number; level: HeatLevel; lastSeen?: string; daysSince?: number; }

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, CellData>>>({});
  const [loading, setLoading] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

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
      // ABSORCIÓN TOTAL: Jalamos todos los registros (Enero, Febrero, Marzo)
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('draw_date', { ascending: false });

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

  const getCellClass = (level: HeatLevel) => {
    switch (level) {
      case 'hot': return 'bg-red-600 text-white font-black animate-pulse shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';
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
            <Grid3X3 className="w-6 h-6" /> Matriz de Frecuencia Total (Histórica)
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
            <Button onClick={loadHeatData} variant="outline" size="icon" className="h-9 w-9 border-primary/20">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600 animate-pulse"/> Caliente (5+)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500"/> Frecuente (3+)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500"/> Frío (1+)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-400"/> Vencido</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <TooltipProvider>
          <ScrollArea className="w-full h-[550px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-40 bg-card border-b-2 border-primary/30">
                <tr>
                  <th className="p-3 bg-card sticky left-0 z-50 border-r-2 font-black uppercase text-[10px]" style={{width:'50px'}}>#</th>
                  <th className="p-3 bg-card sticky left-[50px] z-50 border-r-2 font-black uppercase text-[10px] text-left" style={{width:'120px'}}>Animal</th>
                  {drawTimes.map(t => (
                    <th key={t} className="p-2 font-black text-[9px] min-w-[55px] text-center bg-muted/50 uppercase tracking-tighter">{t.replace(':00 ', '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleNumbers.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 group">
                      <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm group-hover:bg-accent">{num.padStart(2, '0')}</td>
                      <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-black text-[10px] uppercase group-hover:bg-accent">
                        <div className="flex items-center gap-2"><span>{getAnimalEmoji(num)}</span> <span className="truncate">{animal?.name}</span></div>
                      </td>
                      {drawTimes.map(t => {
                        const cell = heatData[num]?.[t] || { count: 0, level: 'none' };
                        return (
                          <td key={t} className="p-0.5 border">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`w-full h-9 flex items-center justify-center text-xs transition-all cursor-crosshair ${getCellClass(cell.level)}`}>
                                  {cell.count || '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border-2 border-primary/30 p-2 shadow-2xl">
                                <div className="text-[10px] font-black uppercase">
                                  <p className="text-primary">{animal?.name} (#{num})</p>
                                  <p>Hora: {t}</p>
                                  <p>Apariciones: {cell.count}</p>
                                  {cell.daysSince !== 999 && <p className="text-muted-foreground mt-1 border-t pt-1 italic">Visto hace: {cell.daysSince} días</p>}
                                </div>
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
        </TooltipProvider>
        {visibleRange.end < numberRange.length && (
          <div className="p-4 bg-muted/10 border-t">
            <Button onClick={() => setVisibleRange(p => ({...p, end: p.end + 20}))} variant="ghost" className="w-full font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white">Cargar más historial del búnker...</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
}
