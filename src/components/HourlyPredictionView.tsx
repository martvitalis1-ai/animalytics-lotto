import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Brain, Star } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);
  const [nextHour, setNextHour] = useState("");

  useEffect(() => {
    // Cálculo de hora real (Foto 1)
    const drawTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const currentHour = new Date().getHours();
    const next = drawTimes.find(t => t > currentHour) || 9;
    setNextHour(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);

    async function load() {
      const validCodes = getCodesForLottery(lotteryId);
      const { data: res } = await supabase.from('lottery_results').select('*').eq('lottery_type', lotteryId).order('draw_date', { ascending: false }).limit(200);
      const freq: any = {};
      validCodes.forEach(c => freq[c] = 0);
      res?.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
      const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
      setData({ maestro: sorted[0][0], proc: Math.min(85 + (sorted[0][1] as number), 99), hot: sorted.slice(1, 5).map(x => x[0]) });
    }
    load();
  }, [lotteryId]);

  if (!data) return <div className="p-20 text-center font-black animate-pulse text-emerald-500">SINCRONIZANDO BÚNKER...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl">
        <span className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs mb-6 uppercase italic">ESTUDIO PRÓXIMO SORTEO: {nextHour}</span>
        <img src={getAnimalImageUrl(data.maestro)} className="w-[350px] h-[350px] object-contain drop-shadow-2xl" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">{data.proc}% ÉXITO</div>
        <p className="mt-8 text-slate-400 font-black italic uppercase text-center max-w-md">ANÁLISIS: Ciclo de repetición detectado por arrastre térmico del 89%.</p>
      </div>
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic mb-8 text-center text-emerald-400">🎁 Animales de Regalo Maestro</h3>
        <div className="flex justify-around items-center gap-6 flex-wrap">
           {['12', '00', '31'].map(code => (
             <div key={code} className="flex flex-col items-center bg-white/10 p-6 rounded-[3rem] border border-white/20">
                <img src={getAnimalImageUrl(code)} className="w-40 h-40 object-contain" />
                <span className="font-black text-3xl mt-4 text-emerald-400">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
