import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Grid3X3, barChart } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalImageUrl } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FrequencyHeatmap() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [heatData, setHeatData] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const drawTimes = useMemo(() => getDrawTimesForLottery(selectedLottery), [selectedLottery]);

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
      const { data: history, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', selectedLottery)
        .limit(10000); 

      if (error) throw error;

      const matrix: Record<string, Record<string, number>> = {};
      
      history?.forEach(draw => {
        let num = draw.result_number.trim();
        if (num !== '0' && num !== '00' && num.length === 1) num = '0' + num;

        let time = draw.draw_time.trim().toUpperCase();
        if (time.length === 7) time = '0' + time; 

        if (!matrix[num]) matrix[num] = {};
        matrix[num][time] = (matrix[num][time] || 0) + 1;
      });

      setHeatData(matrix);
    } catch (e) { 
      console.error("Error en Matriz:", e); 
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  // Colores profesionales sin bordes que ensucien
  const getCellColor = (count: number) => {
    if (!count || count === 0) return 'bg-slate-50 text-slate-200';
    if (count >= 5) return 'bg-red-500 text-white font-black animate-pulse';
    if (count >= 3) return 'bg-orange-500 text-white';
    if (count >= 2) return 'bg-blue-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <Card className="border-none shadow-none bg-white overflow-hidden rounded-[3rem]">
      <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase text-slate-800 italic tracking-tighter">
            <Grid3X3 className="w-6 h-6 text-emerald-600" /> Matriz de Frecuencia 3D
          </CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-full md:w-[220px] h-11 bg-white font-black text-xs border-slate-200 rounded-2xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold uppercase text-[10px]">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="ghost" size="icon" className="h-11 w-11 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[650px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-30 bg-white border-b-2 border-slate-100">
              <tr>
                <th className="p-4 bg-white sticky left-0 z-40 border-r border-slate-100 font-black uppercase text-[10px] text-slate-400">#</th>
                <th className="p-4 bg-white sticky left-[55px] z-40 border-r border-slate-100 font-black uppercase text-[10px] text-slate-400 text-left">Animal 3D</th>
                {drawTimes.map(t => (
                  <th key={t} className="p-2 font-black text-[10px] min-w-[75px] text-center bg-slate-50/50 border-r border-slate-100 uppercase tracking-tighter text-slate-600">
                    {t.replace(':00 ', '').replace(':30 ', '')}
                    <span className="block text-[8px] opacity-40">{t.includes('AM') ? 'AM' : 'PM'}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {numberRange.map(num => (
                <tr key={num} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                  {/* COLUMNA NÚMERO */}
                  <td className="p-2 sticky left-0 bg-white z-10 border-r border-slate-100 font-mono font-black text-lg text-slate-800 text-center">
                    {num}
                  </td>
                  
                  {/* COLUMNA ANIMAL (IMAGEN GRANDE) */}
                  <td className="p-1 sticky left-[55px] bg-white z-10 border-r border-slate-100 min-w-[90px]">
                    <div className="flex items-center justify-center p-1">
                      <img 
                        src={getAnimalImageUrl(num)} 
                        className="w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-sm" 
                        alt={num}
                        crossOrigin="anonymous"
                      />
                    </div>
                  </td>

                  {/* CELDAS DE CALOR */}
                  {drawTimes.map(t => {
                    let colTime = t.trim().toUpperCase();
                    if (colTime.length === 7) colTime = '0' + colTime;
                    
                    const count = heatData[num]?.[colTime] || 0;
                    return (
                      <td key={t} className={`p-1 border-r border-slate-100 text-center text-sm font-black transition-all ${getCellColor(count)}`}>
                        {count > 0 ? count : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
