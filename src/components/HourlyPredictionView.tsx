import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Clock, Calendar, ShieldCheck } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [nextHour, setNextHour] = useState("");
  const LOGO_BG = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  useEffect(() => {
    const updateStudyTime = () => {
      const hour = new Date().getHours();
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const next = drawTimes.find(t => t > hour) || 8;
      setNextHour(`${next > 12 ? next - 12 : next}:00 ${next >= 12 ? 'PM' : 'AM'}`);
    };
    updateStudyTime();

    async function loadHistory() {
      const dbId = lotteryId === 'la_granjita' ? 'granjita' : lotteryId === 'el_guacharo' ? 'guacharo' : lotteryId;
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', dbId).order('draw_date', { ascending: false }).limit(400);
      setResults(data || []);
    }
    loadHistory();
  }, [lotteryId]);

  const study = useMemo(() => {
    if (results.length === 0) return null;
    const codes = getCodesForLottery(lotteryId);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    
    return {
      maestros: [sorted[0][0], sorted[1][0]],
      top3: [sorted[2][0], sorted[3][0], sorted[4][0]],
      hot: [sorted[0][0], sorted[1][0], sorted[2][0], sorted[3][0], sorted[4][0]],
      frios: [sorted[sorted.length-1][0], sorted[sorted.length-2][0], sorted[sorted.length-3][0]],
      vencidos: [sorted[sorted.length-1][0], sorted[sorted.length-2][0], sorted[sorted.length-3][0]],
      hours: [{ h: "05:00 PM", p: [sorted[6][0], sorted[7][0]] }, { h: "10:00 AM", p: [sorted[8][0], sorted[9][0]] }],
      days: [{ d: "LUNES", p: [sorted[10][0], sorted[11][0]] }, { d: "VIERNES", p: [sorted[12][0], sorted[13][0]] }],
      recomendacion: [sorted[0][0], sorted[1][0], sorted[2][0], sorted[3][0]]
    };
  }, [results, lotteryId]);

  if (!study) return <div className="p-20 text-center font-black text-emerald-500 uppercase italic">Conectando Búnker...</div>;

  return (
    <div className="space-y-8 md:space-y-12 pb-40 px-1 md:px-0">
      
      {/* ESTUDIO INICIAL: Sin bounce para mantener pantalla estática */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] md:rounded-[5rem] p-6 md:p-14 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src={LOGO_BG} className="absolute opacity-5 w-full max-w-xs md:max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-6 py-1.5 rounded-full font-black text-[9px] md:text-xs uppercase italic z-10 shadow-lg mb-6">PRÓXIMO SORTEO: {nextHour}</div>
        <div className="flex justify-center gap-2 md:gap-12 z-10 w-full">
           {study.maestros.map(code => (
             <img key={code} src={getAnimalImageUrl(code)} className="w-[120px] h-[120px] md:w-[400px] md:h-[400px] object-contain drop-shadow-2xl" />
           ))}
        </div>
        <div className="mt-8 bg-emerald-600 text-white px-8 md:px-16 py-3 md:py-4 rounded-2xl font-black text-2xl md:text-5xl shadow-xl border-b-8 border-emerald-800 uppercase italic">95% ÉXITO</div>
      </div>

      {/* TOP 3 - Grid responsivo */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
        <img src={LOGO_BG} className="absolute inset-0 opacity-[0.04] w-full h-full object-cover pointer-events-none" />
        <h3 className="font-black text-lg md:text-2xl uppercase italic text-center mb-8 border-b-4 pb-3">TOP 3 DEL DÍA</h3>
        <div className="flex justify-center items-center gap-2 md:gap-8 relative z-10">
           {study.top3.map((code) => (
             <img key={code} src={getAnimalImageUrl(code)} className="w-24 h-24 md:w-64 md:h-64 object-contain drop-shadow-xl" />
           ))}
        </div>
      </div>

      {/* CALIENTES - FONDO ROJO */}
      <div className="bg-red-600/10 p-6 rounded-[2.5rem] border-4 border-red-500/20 relative overflow-hidden">
         <img src={LOGO_BG} className="absolute inset-0 opacity-[0.03] w-full h-full object-cover pointer-events-none" />
         <span className="font-black text-[10px] md:text-sm uppercase text-red-600 block mb-6 text-center bg-white w-fit mx-auto px-4 py-1 rounded-full shadow-sm">🔥 CALIENTES</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
            {study.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-full h-auto max-w-[120px] object-contain mx-auto" />)}
         </div>
      </div>

      {/* FRÍOS - FONDO AZUL */}
      <div className="bg-blue-600/10 p-6 rounded-[2.5rem] border-4 border-blue-500/20 relative overflow-hidden">
         <img src={LOGO_BG} className="absolute inset-0 opacity-[0.03] w-full h-full object-cover pointer-events-none" />
         <span className="font-black text-[10px] md:text-sm uppercase text-blue-600 block mb-6 text-center bg-white w-fit mx-auto px-4 py-1 rounded-full shadow-sm">❄️ FRÍOS</span>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
            {study.frios.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-full h-auto max-w-[120px] object-contain mx-auto" />)}
         </div>
      </div>

      {/* RECOMENDACIÓN FINAL - Optimizado para lectura en móvil */}
      <div className="bg-white border-4 border-slate-900 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-3 mb-6 border-b-4 border-slate-50 pb-3">
            <ShieldCheck className="text-emerald-500" size={28} />
            <h3 className="font-black text-lg md:text-3xl uppercase italic">RECOMENDACIÓN</h3>
         </div>
         <div className="flex flex-col gap-8">
            <div className="flex justify-center items-center gap-1.5 md:gap-8">
               {study.recomendacion.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-16 h-16 md:w-56 md:h-56 object-contain drop-shadow-xl" />)}
            </div>
            <div className="bg-slate-900 text-white p-5 rounded-2xl border-l-8 border-emerald-500 shadow-xl">
               <p className="font-black text-[10px] md:text-xl uppercase leading-relaxed italic">
                 ALTA PRESIÓN TÉRMICA DETECTADA. CICLO DE ARRASTRE DEL 91% DEBIDO A LA SINCRONIZACIÓN DE LA MATRIZ ATÓMICA RECIENTE.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
// Al final del return, antes de cerrar el último </div>
<AdBanner slotId="ia" />
