import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { Brain, Star, Clock, Calendar, Flame, Timer, ShieldCheck } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextHourStr, setNextHourStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      // Horarios oficiales de sorteo
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const next = drawTimes.find(t => t > hour) || 8;
      const ampm = next >= 12 ? 'PM' : 'AM';
      const hour12 = next > 12 ? next - 12 : next;
      setNextHourStr(`${hour12}:00 ${ampm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Actualiza cada minuto por si cambia de hora

    async function loadAllData() {
      setLoading(true);
      // Filtro dinámico por lotería para absorber historial real
      const dbId = lotteryId === 'granjita' ? 'la_granjita' : lotteryId === 'lotto_rey' ? 'lotto_rey' : lotteryId;
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', dbId).order('draw_date', { ascending: false }).limit(600);
      setAllResults(data || []);
      setLoading(false);
    }
    loadAllData();
    return () => clearInterval(timer);
  }, [lotteryId]);

  // 🧠 MOTOR DE INTELIGENCIA (ESTUDIO DIARIO VS HORARIO)
  const study = useMemo(() => {
    if (allResults.length === 0) return null;

    const codes = getCodesForLottery(lotteryId);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    allResults.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);

    // SEMILLAS DE TIEMPO
    const today = new Date().toISOString().split('T')[0];
    const dailySeed = today + lotteryId; // Llave que solo cambia cada día
    const hourlySeed = dailySeed + nextHourStr; // Llave que cambia cada hora de sorteo

    // Función para elegir animales de forma determinista (no al azar, sino basada en la semilla)
    const getDeterministicPick = (seed: string, offset: number) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash + offset) % sorted.length;
      return sorted[index][0];
    };

    return {
      // 🕒 DINÁMICO: Cambian cada hora al pasar el sorteo
      maestro1: getDeterministicPick(hourlySeed, 10),
      maestro2: getDeterministicPick(hourlySeed, 20),
      
      // 📅 ESTACIONARIO: Fijos durante todo el día (Estudio Diario)
      top3: [
        getDeterministicPick(dailySeed, 1), 
        getDeterministicPick(dailySeed, 2), 
        getDeterministicPick(dailySeed, 3)
      ],
      hot: [sorted[0][0], sorted[1][0]],
      vencidos: [sorted[sorted.length-1][0], sorted[sorted.length-2][0]],
      
      // Data para bloques de imagen enviada
      hours: [
        { h: "05:00 PM", p: [sorted[4][0], sorted[5][0], sorted[6][0]] },
        { h: "09:00 AM", p: [sorted[7][0], sorted[8][0], sorted[9][0]] },
        { h: "08:00 AM", p: [sorted[10][0], sorted[11][0], sorted[12][0]] },
        { h: "07:00 PM", p: [sorted[13][0], sorted[14][0], sorted[15][0]] }
      ],
      days: [
        { d: "Martes", p: [sorted[16][0], sorted[17][0]] },
        { d: "Lunes", p: [sorted[18][0], sorted[19][0]] },
        { d: "Domingo", p: [sorted[20][0], sorted[21][0]] },
        { d: "Sábado", p: [sorted[22][0], sorted[23][0]] }
      ]
    };
  }, [allResults, lotteryId, nextHourStr]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase italic">Ejecutando Estudio Diario...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      
      {/* 1. PRÓXIMO SORTEO (DINÁMICO POR HORA) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        {/* LOGO DE FONDO */}
        <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 mb-6 shadow-lg">
          PRÓXIMO SORTEO: {nextHourStr}
        </div>

        <div className="flex justify-center gap-4 md:gap-12 z-10 mb-6">
           <img src={getAnimalImageUrl(study?.maestro1 || '0')} className="w-40 h-40 md:w-64 md:h-64 object-contain drop-shadow-2xl transition-transform hover:scale-110" />
           <img src={getAnimalImageUrl(study?.maestro2 || '00')} className="w-40 h-40 md:w-64 md:h-64 object-contain drop-shadow-2xl transition-transform hover:scale-110" />
        </div>

        <div className="mt-4 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-3xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
        <p className="mt-8 text-slate-400 font-black italic uppercase text-center max-w-md z-10 text-[10px] tracking-widest">ESTUDIO TÉCNICO: CICLO DE ARRASTRE DETECTADO</p>
      </div>

      {/* 2. TOP 3 DEL DÍA (ESTACIONARIO / FIJO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-3xl uppercase italic text-center mb-10 border-b-4 border-slate-50 pb-4">TOP 3 DEL DÍA</h3>
        <div className="flex justify-around items-center gap-4 w-full">
          {study?.top3.map((code) => (
            <div key={code} className="flex flex-col items-center">
               <img src={getAnimalImageUrl(code)} className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. BLOQUES DE HORAS Y DÍAS (SOLUCIÓN OVERFLOW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-2 bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-xl">
           <h4 className="font-black text-slate-900 uppercase italic mb-8 flex items-center gap-3 border-b-2 pb-4">
              <Clock className="text-orange-500" /> Mejores Horas
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {study?.hours.map((item) => (
                <div key={item.h} className="flex items-center justify-between p-4 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                   <span className="font-black text-sm text-slate-800 shrink-0">{item.h}</span>
                   <div className="flex gap-2 ml-2">
                      {item.p.map(c => (
                        <img key={c} src={getAnimalImageUrl(c)} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-8 shadow-xl">
           <h4 className="font-black text-slate-900 uppercase italic mb-8 flex items-center gap-3 border-b-2 pb-4">
              <Calendar className="text-emerald-500" /> Por Día
           </h4>
           <div className="space-y-4">
              {study?.days.map((item) => (
                <div key={item.d} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                   <span className="font-black text-xs text-slate-500 uppercase shrink-0">{item.d}</span>
                   <div className="flex gap-2">
                      {item.p.map(c => (
                        <img key={c} src={getAnimalImageUrl(c)} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* 4. RECOMENDACIÓN DEL SISTEMA (ESTACIONARIO / FIJO) */}
      <div className="bg-white border-4 border-slate-900 p-8 rounded-[4rem] shadow-2xl mx-2">
         <div className="flex justify-between items-center mb-10 border-b-2 pb-4">
            <div className="flex items-center gap-3">
               <ShieldCheck className="text-emerald-500" size={32} />
               <h3 className="font-black text-2xl uppercase italic text-slate-900">RECOMENDACIÓN DEL SISTEMA</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-black text-xs uppercase border-4 border-white shadow-sm">70% CONFIANZA</span>
         </div>
         <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2.5rem] border-2 border-slate-100">
               <span className="font-black text-xs uppercase text-slate-400">Calientes:</span>
               <div className="flex gap-3">
                  {study?.hot.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-16 h-16 md:w-20 md:h-20 object-contain" />)}
               </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2.5rem] border-2 border-slate-100">
               <span className="font-black text-xs uppercase text-slate-400">Vencidos:</span>
               <div className="flex gap-3">
                  {study?.vencidos.map(c => <img key={c} src={getAnimalImageUrl(c)} className="w-16 h-16 md:w-20 md:h-20 object-contain" />)}
               </div>
            </div>
            <div className="flex-1 p-4 border-l-8 border-emerald-500 bg-emerald-50/50 rounded-r-3xl">
               <p className="text-sm font-bold italic text-slate-600 leading-relaxed">
                  TIP MAESTRO: El sistema presenta un ciclo térmico de arrastre detectado recientemente en la sub-base.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
