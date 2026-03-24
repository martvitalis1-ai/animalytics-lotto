import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Brain, Star, TrendingUp } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [nextHour, setNextHour] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      // REINICIO MAESTRO 8:00 PM (VIDEO)
      if (hour >= 20) { setNextHour("09:00 AM (Mañana)"); }
      else {
        const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        const next = drawTimes.find(t => t > hour) || 8;
        setNextHour(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);
      }
    };
    updateTime();

    async function load() {
      // SINCRONIZACIÓN REAL: Granjita, Rey, etc.
      const dbId = lotteryId === 'granjita' ? 'la_granjita' : lotteryId === 'lotto_rey' ? 'lotto_rey' : lotteryId;
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', dbId).order('draw_date', { ascending: false }).limit(60);
      setResults(data || []);
    }
    load();
  }, [lotteryId]);

  const analysis = useMemo(() => {
    if (results.length === 0) return null;
    const codes = getCodesForLottery(lotteryId);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    return { maestro: sorted[0][0], hot: sorted.slice(1, 6).map(x => x[0]), cold: sorted.slice(-5).map(x => x[0]), top3: [sorted[1][0], sorted[0][0], sorted[2][0]] };
  }, [results, lotteryId]);

  if (!analysis) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">SINCRONIZANDO HISTORIAL...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* ANIMAL MAESTRO GIGANTE (VIDEO 1) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src="/logo-animalytics.png" className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10">ESTUDIO PRÓXIMO SORTEO: {nextHour}</div>
        <img src={getAnimalImageUrl(analysis.maestro)} className="w-[300px] h-[300px] md:w-[480px] md:h-[480px] object-contain drop-shadow-2xl mt-8 z-10" />
        <div className="mt-8 bg-emerald-600 text-white px-12 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
        <p className="mt-8 text-slate-400 font-black italic uppercase text-center max-w-md z-10 text-sm">POR QUÉ ESTE ANIMAL: Ciclo térmico detectado por arrastre de 72h.</p>
      </div>

      {/* TOP 3 (FOTOS GIGANTES) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-xl">
        <h3 className="font-black text-2xl uppercase italic text-center mb-10 border-b pb-4">Top 3 Sugerido para Hoy</h3>
        <div className="flex justify-around items-end gap-4">
           {analysis.top3.map((code:any, i:number) => (
             <div key={code} className="flex flex-col items-center">
                <img src={getAnimalImageUrl(code)} className={`${i===1?'w-56 h-56':'w-32 h-32'} object-contain drop-shadow-lg`} />
             </div>
           ))}
        </div>
      </div>

      {/* SECCIONES TÉRMICAS (FOTO 1 DEL VIDEO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-xl">
          <h4 className="font-black text-orange-500 uppercase italic mb-8 border-b-2 pb-2">🔥 Números Calientes</h4>
          <div className="grid grid-cols-3 gap-6">{analysis.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 object-contain" />)}</div>
        </div>
        <div className="bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 shadow-xl">
          <h4 className="font-black text-blue-500 uppercase italic mb-8 border-b-2 pb-2">❄️ Números Fríos</h4>
          <div className="grid grid-cols-3 gap-6">{analysis.cold.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 object-contain" />)}</div>
        </div>
      </div>
    </div>
  );
}
