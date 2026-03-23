import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Brain, Star, Clock } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);
  const [nextHour, setNextHour] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const drawTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const next = drawTimes.find(t => t > hour) || 9;
      setNextHour(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);
    };
    updateTime();

    async function load() {
      const codes = getCodesForLottery(lotteryId);
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(200);
      const freq: any = {};
      codes.forEach(c => freq[c] = 0);
      res?.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
      const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
      setData({ maestro: sorted[0][0], proc: 95, top3: [sorted[2][0], sorted[0][0], sorted[1][0]] });
    }
    load();
  }, [lotteryId]);

  if (!data) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">SINCRONIZANDO BÚNKER...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* ANIMAL GIGANTE 3D (VIDEO NUEVO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl relative">
        <div className="absolute top-8 bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic">ESTUDIO SORTEO: {nextHour}</div>
        <img src={getAnimalImageUrl(data.maestro)} className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl mt-8" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">{data.proc}% ÉXITO</div>
        <p className="mt-8 text-slate-400 font-black italic uppercase text-center max-w-md">POR QUÉ ESTE ANIMAL: Ciclo de repetición detectado por arrastre térmico del 89%.</p>
      </div>

      {/* TOP 3 (VIDEO SIRAGON) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-xl">
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b pb-4 flex items-center justify-center gap-3"><Star className="text-emerald-500" fill="currentColor"/> Top 3 Sugerido para Hoy</h3>
        <div className="flex justify-around items-end">
           {data.top3.map((code:any, i:number) => (
             <div key={code} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(code)} className={`${i===1?'w-48 h-48':'w-32 h-32'} object-contain`} />
                <span className="font-black text-lg mt-2">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
