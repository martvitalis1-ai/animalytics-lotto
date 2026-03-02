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

  // Lista de horas oficial para las columnas
  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);

  // Rango de animales (Corregido el peo de los ceros)
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
      // ABSORCIÓN TOTAL: Jalamos toda la historia sin filtros de fecha
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', selectedLottery);

      if (error) throw error;

      // MOTOR DE CONTEO QUIRÚRGICO
      const matrix: Record<string, Record<string, number>> = {};
      
      history?.forEach(draw => {
        const rawNum = draw.result_number.trim();
        // Normalizamos el número para que coincida con el range (0, 00, 01, 02...)
        let num = rawNum;
        if (rawNum !== '0' && rawNum !== '00' && rawNum.length === 1) {
          num = '0' + rawNum;
        }

        const time = draw.draw_time.trim().toUpperCase();
        
        if (!matrix[num]) matrix[num] = {};
        // Solo sumamos si la hora existe en el horario oficial de esta lotería
        if (drawTimes.includes(time)) {
          matrix[num][time] = (matrix[num][time] || 0) + 1;
        }
      });

      setHeatData(matrix);
    } catch (e) {
      console.error('Error en Matriz:', e);
    }
    setLoading(false);
  }, [selectedLottery, drawTimes]);

  useEffect(() => { loadData(); }, [loadData]);

  // Colores dinámicos basados en la malicia real
  const getCellColor = (count: number) => {
    if (!count || count === 0) return 'bg-muted/10 text-muted-foreground/10';
    if (count >= 10) return 'bg-red-600 text-white font-black animate-pulse shadow-lg'; // Súper Caliente
    if (count >= 5) return 'bg-orange-500 text-white font-bold'; // Caliente
    if (count >= 2) return 'bg-blue-500 text-white'; // Frecuente
    return 'bg-slate-400/50 text-white'; // Salió poco
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
            <Grid3X3 className="w-6 h-6 text-primary" /> MATRIZ DE FRECUENCIA MASTER
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
            <Button onClick={loadData} variant="outline" size="icon" className="h-9 w-9 border-primary/30">
              <RefreshCw className={loading ? 'animate-spin' : ''} />
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
                {drawTimes.map(t => (
                  <th key={t} className="p-2 font-black text-[9px] min-w-[65px] text-center bg-muted/50 uppercase tracking-tighter border-r">
                    {t.replace(':00 ', '').replace(':30 ', '').replace(' ', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numberRange.map(num => {
                const animal = getAnimalByCode(num);
                return (
                  <tr key={num} className="hover:bg-primary/5 transition-colors border-b">
                    <td className="p-3 sticky left-0 bg-card z-10 border-r-2 font-mono font-black text-sm text-center">
                      {num}
                    </td>
                    <td className="p-2 sticky left-[45px] bg-card z-10 border-r-2 font-black text-[10px] uppercase min-w-[120px] border-r">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getAnimalEmoji(num)}</span>
                        <span className="truncate">{animal?.name || 'Animal'}</span>
                      </div>
                    </td>
                    {drawTimes.map(t => {
                      const count = heatData[num]?.[t] || 0;
                      return (
                        <td key={t} className={`p-1 border-r text-center text-xs font-black transition-all ${getCellColor(count)}`}>
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
