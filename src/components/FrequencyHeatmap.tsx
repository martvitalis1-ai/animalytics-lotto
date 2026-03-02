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
interface CellData { count: number; level: HeatLevel; daysSince?: number; }

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
      // ABSORCIÓN TOTAL: Sin límites de fecha para que entre Enero, Febrero y Marzo
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time, draw_date')
        .eq('lottery_type', selectedLottery);

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

  const getCellClass = (level: HeatLevel) => {
    switch (level) {
      case 'hot': return 'bg-red-600 text-white font-black animate-pulse shadow-lg';
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
            <Grid3X3 className="w-6 h-6" /> Matriz de Frecuencia Máxima
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
                      <img src={getLotteryLogo(l.id)} className="w-5 h-5 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadHeatData} disabled={loading} variant="outline" size="icon" className="h-10 w-10 border-primary/30">
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
          <div className="min-w-[850px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-card border-b-2 border-primary/30 shadow-md">
                <tr>
                  <th className="p-3 bg-card sticky left-0 z-40 border-r-2 font-black uppercase text-[11px]" style={{ width: '50px' }}>#</th>
                  <th className="p-3 bg-card sticky left-[50px] z-40 border-r-2 font-black uppercase text-[11px] text-left" style={{ width: '130px' }}>Animal</th>
                  {drawTimes.map(time => (
                    <th key={time} className="p-2 text-center font-black text-[10px] bg-muted/20 min-w-[60px] uppercase tracking-tighter border-r">
                      {time.replace(':00 ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleNumbers.map(num => {
                  const animal = getAnimalByCode(num);
                  return (
                    <tr key={num} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm group-hover:bg-accent group-hover:text-accent-foreground">{num.padStart(2, '0')}</td>
                      <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-black text-[10px] uppercase group-hover:bg-accent group-hover:text-accent-foreground border-r">
                        <div className="flex items-center gap-2"><span>{getAnimalEmoji(num)}</span> <span className="truncate">{animal?.name}</span></div>
                      </td>
                      {drawTimes.map(t => {
                        const cell = heatData[num]?.[t] || { count: 0, level: 'none' };
                        return (
                          <td key={t} className="p-1 text-center border-r">
                            <div className={`w-full h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all ${getCellClass(cell.level)}`}>
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
        {visibleRange.end < numberRange.length && (
          <div className="p-4 bg-muted/10 border-t">
            <Button onClick={() => setVisibleRange(p => ({...p, end: p.end + 25}))} variant="ghost" className="w-full font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white border-2 border-dashed border-primary/20">Cargar más resultados del búnker...</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
