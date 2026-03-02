import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Loader2, Grid3X3, Flame } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getCodesForLottery, getAnimalByCode, getAnimalEmoji } from '@/lib/animalData';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, number>>>({});
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
      // ABSORCIÓN TOTAL: Jalamos toda la historia sin límites
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', selectedLottery);

      if (error) throw error;

      const matrix: Record<string, Record<string, number>> = {};
      numberRange.forEach(num => {
        matrix[num] = {};
        drawTimes.forEach(time => matrix[num][time] = 0);
      });

      history?.forEach(draw => {
        const num = draw.result_number;
        const time = draw.draw_time;
        if (matrix[num] && matrix[num][time] !== undefined) {
          matrix[num][time]++;
        }
      });
      setHeatData(matrix);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery, numberRange, drawTimes]);

  useEffect(() => { loadHeatData(); }, [loadHeatData]);

  const getCellColor = (count: number) => {
    if (count >= 5) return 'bg-red-600 text-white font-black animate-pulse';
    if (count >= 3) return 'bg-red-500 text-white';
    if (count === 2) return 'bg-orange-500 text-white';
    if (count === 1) return 'bg-blue-500 text-white';
    return 'bg-muted/20 text-muted-foreground/20';
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-primary">
            <Grid3X3 className="w-6 h-6" /> Matriz de Frecuencia
          </CardTitle>
          <select 
            value={selectedLottery} 
            onChange={(e) => setSelectedLottery(e.target.value)}
            className="bg-background border-2 border-primary/20 rounded-lg px-2 py-1 text-xs font-black uppercase"
          >
            {LOTTERIES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[500px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-card border-b-2 border-primary/20">
              <tr>
                <th className="p-3 bg-card sticky left-0 z-30 border-r-2 font-black">#</th>
                <th className="p-3 bg-card sticky left-[50px] z-30 border-r-2 font-black text-left">Animal</th>
                {drawTimes.map(t => (
                  <th key={t} className="p-2 font-black text-[10px] min-w-[60px] text-center uppercase">{t.replace(':00 ', '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numberRange.map(num => {
                const animal = getAnimalByCode(num);
                return (
                  <tr key={num} className="hover:bg-primary/5 border-b">
                    <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm">{num.padStart(2, '0')}</td>
                    <td className="p-2 sticky left-[50px] bg-card z-10 border-r-2 font-bold min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getAnimalEmoji(num)}</span>
                        <span className="text-[10px] uppercase truncate">{animal?.name}</span>
                      </div>
                    </td>
                    {drawTimes.map(t => {
                      const count = heatData[num]?.[t] || 0;
                      return (
                        <td key={t} className={`p-1 border text-center text-xs font-black transition-all ${getCellColor(count)}`}>
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
