import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getDrawTimesForLottery } from '@/lib/constants';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Grid3X3 } from "lucide-react";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const times = getDrawTimesForLottery(lotteryId);
  const allCodes = ["0", "00", ...Array.from({length: 99}, (_, i) => String(i+1).padStart(2, '0'))].filter(c => {
      const n = parseInt(c);
      if (lotteryId === 'guacharito') return true;
      if (lotteryId === 'guacharo') return c === '0' || c === '00' || n <= 75;
      return c === '0' || c === '00' || n <= 36;
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).limit(2000);
      setData(res || []);
    };
    fetch();
  }, [lotteryId]);

  return (
    <div className="bg-white p-8 rounded-[4rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
      <h3 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-3">
        <Grid3X3 className="text-emerald-500" /> Matriz de Frecuencia Total
      </h3>
      <ScrollArea className="w-full h-[600px] border rounded-3xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-slate-900 text-white z-20">
            <tr>
              <th className="p-4 border-r border-white/10 text-[10px] uppercase">#</th>
              <th className="p-4 border-r border-white/10 text-[10px] uppercase text-left">Animal</th>
              {times.map(t => (<th key={t} className="p-2 border-r border-white/10 text-[8px] uppercase min-w-[70px]">{t}</th>))}
            </tr>
          </thead>
          <tbody>
            {allCodes.map(code => (
              <tr key={code} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-2 border-r text-center font-mono font-black text-lg">{code}</td>
                <td className="p-2 border-r min-w-[120px]"><div className="flex items-center gap-3"><img src={getAnimalImageUrl(code)} className="w-12 h-12" /> <span className="font-black text-[10px] uppercase text-slate-400">{getAnimalName(code)}</span></div></td>
                {times.map(t => {
                   const count = data.filter(r => r.draw_time === t && r.result_number.trim() === code).length;
                   return (<td key={t} className={`p-1 border-r text-center font-black text-sm ${count > 0 ? 'bg-emerald-500 text-white' : 'text-slate-200'}`}>{count || '-'}</td>);
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
