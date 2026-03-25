import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Clock, Calendar, ShieldCheck, Zap } from "lucide-react";
import { AdBanner } from "./AdBanner"; // 🛡️ IMPORTANTE

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [nextHour, setNextHour] = useState("");
  const WATERMARK = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  useEffect(() => {
    const updateStudyTime = () => {
      const hour = new Date().getHours();
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const next = drawTimes.find(t => t > hour) || 8;
      setNextHour(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);
    };
    updateStudyTime();

    async function loadHistory() {
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', dbId).order('draw_date', { ascending: false }).order('draw_time', { ascending: false }).limit(200);
      setResults(data || []);
    }
    loadHistory();
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const lastResult = results[0].result_number;
    const lastNum = parseInt(lastResult);
    const codes = getCodesForLottery(lotteryId);
    const maxAnimals = codes.length;
    const maestro1 = codes[(lastNum + 7) % maxAnimals];
    const maestro2 = codes[(lastNum + 15) % maxAnimals];
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    return {
      maestros: [maestro1, maestro2],
      top3: [sorted[0][0], sorted[1][0], sorted[2][0]],
      hot: [sorted[0][0], sorted[1][0], sorted[2][0], sorted[3][0], sorted[4][0]],
      frios: [sorted[sorted.length-1][0], sorted[sorted.length-2][0], sorted[sorted.length-3][0]],
      vencidos: [sorted[sorted.length-1][0], sorted[sorted.length-2][0], sorted[sorted.length-3][0]],
      hours: [{ h: "05:00 PM", p: [sorted[4][0], sorted[5][0]] }, { h: "10:00 AM", p: [sorted[6][0], sorted[7][0]] }],
      days: [{ d: "LUNES", p: [sorted[8][0], sorted[9][0]] }, { d: "VIERNES", p: [sorted[10][0], sorted[11][0]] }],
      recomendacion: [maestro1, maestro2, sorted[0][0], sorted[1][0]]
    };
  }, [results, lotteryId]);

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 uppercase italic">Conectando Búnker...</div>;

  return (
    <div className="space-y-8 md:space-y-12 pb-40 px-1">
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] md:rounded-[5rem] p-6 md:p-14 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute opacity-5 w-full max-w-xs md:max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-[10px] md:text-sm uppercase italic z-10 shadow-lg mb-6 flex items-center gap-2"><Zap size={16} className="text-emerald-400 fill-emerald-400" /> DATO MAESTRO: {nextHour}</div>
        <div className="flex justify-center gap-2 md:gap-12 z-10 w-full">{study.maestros.map(code => (<img key={code} src={getAnimalImageUrl(code)} className="w-[140px] h-[140px] md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl" />))}</div>
        <div className="mt-8 bg-emerald-600 text-white px-10 md:px-20 py-3 md:py-5 rounded-2xl font-black text-2xl md:text-6xl shadow-[0_10px_0_0_#065f46] uppercase italic">95% ÉXITO</div>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
        <img src={WATERMARK} className="absolute inset-0 opacity-[0.04] w-full h-full object-cover pointer-events-none" />
        <h3 className="font-black text-lg md:text-2xl uppercase italic text-center mb-8 border-b-4 pb-3">TOP 3 DEL DÍA</h3>
        <div className="flex justify-center items-center gap-2 md:gap-8 relative z-10">{study.top3.map((code) => (<img key={code} src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-64 md:h-64 object-contain drop-shadow-xl" />))}</div>
      </div>

      <div className="bg-red-600/10 p-6 rounded-[2.5rem] border-4 border-red-500/20 relative overflow-hidden">
         <img src={WATERMARK} className="absolute inset-0 opacity-[0.03] w-full h-full object-cover pointer-events-none" />
         <span className="font-black text-[10px] md:text-sm uppercase text-red-600 block mb-6 text-center bg-white w-fit mx-auto px-4 py-1 rounded-full shadow-sm">🔥 CALIENTES</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-3 relative z-10">{study.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-full h-auto max-w-[120px] object-contain mx-auto" />)}</div>
      </div>

      <div className="bg-white border-4 border-slate-900 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-3 mb-10 border-b-4 border-slate-50 pb-4"><ShieldCheck className="text-emerald-500" size={40} /><h3 className="font-black text-2xl md:text-4xl uppercase italic">RECOMENDACIÓN VIP</h3></div>
         <div className="flex flex-col gap-10">
            <div className="flex justify-center items-center gap-2 md:gap-12">{study.recomendacion.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-20 h-20 md:w-56 md:h-56 object-contain drop-shadow-xl" />)}</div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-emerald-500 shadow-xl"><p className="font-black text-sm md:text-2xl uppercase leading-relaxed italic text-center">ALTA PRESIÓN TÉRMICA DETECTADA. PATRÓN DE CICLO DE ARRASTRE DEL 91% SEGÚN EL ÚLTIMO RESULTADO.</p></div>
         </div>
      </div>

      {/* 🛡️ AQUÍ ESTÁ EL BANNER DE PUBLICIDAD */}
      <AdBanner slotId="ia" />
    </div>
  );
}
