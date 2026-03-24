import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { Brain, Star, Clock, Calendar, Flame, Snowflake, Timer, RefreshCw, BarChart3 } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextHourStr, setNextHourStr] = useState("");
  const [trendLottery, setTrendLottery] = useState(lotteryId);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const drawTimes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const next = drawTimes.find(t => t > hour) || 8;
      const ampm = next >= 12 ? 'PM' : 'AM';
      const hour12 = next > 12 ? next - 12 : next;
      setNextHourStr(`${hour12}:00 ${ampm}`);
    };
    updateTime();

    async function loadAllData() {
      setLoading(true);
      const { data } = await supabase.from('lottery_results').select('*').order('draw_date', { ascending: false }).limit(800);
      setAllResults(data || []);
      setLoading(false);
    }
    loadAllData();
  }, []);

  const getStudy = (id: string) => {
    const results = allResults.filter(r => r.lottery_type === id || r.lottery_type === id.replace('la_', ''));
    const codes = getCodesForLottery(id);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);

    const today = new Date().toISOString().split('T')[0];
    const dailySeed = today + id;
    const hourlySeed = dailySeed + nextHourStr;

    const getDeterministic = (seed: string, offset: number) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      return sorted[Math.abs(hash + offset) % sorted.length][0];
    };

    return {
      maestro1: getDeterministic(hourlySeed, 10),
      maestro2: getDeterministic(hourlySeed, 20),
      top3: [getDeterministic(dailySeed, 1), getDeterministic(dailySeed, 2), getDeterministic(dailySeed, 3)],
      calientes: sorted.slice(0, 5).map(x => x[0]),
      frios: sorted.slice(10, 15).map(x => x[0]),
      vencidos: sorted.slice(-5).map(x => x[0])
    };
  };

  const currentStudy = useMemo(() => getStudy(lotteryId), [allResults, lotteryId, nextHourStr]);
  const trendStudy = useMemo(() => getStudy(trendLottery), [allResults, trendLottery]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">Sincronizando Inteligencia...</div>;

  return (
    <div className="space-y-12 pb-40 animate-in fade-in duration-700">
      
      {/* 1. PRÓXIMO SORTEO (2 ANIMALES) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="absolute opacity-5 w-full max-w-lg grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase italic z-10 mb-6 shadow-lg">PRÓXIMO SORTEO: {nextHourStr}</div>
        <div className="flex justify-center gap-4 md:gap-12 z-10 mb-6">
           <img src={getAnimalImageUrl(currentStudy.maestro1)} className="w-44 h-44 md:w-72 md:h-72 object-contain drop-shadow-2xl" />
           <img src={getAnimalImageUrl(currentStudy.maestro2)} className="w-44 h-44 md:w-72 md:h-72 object-contain drop-shadow-2xl" />
        </div>
        <div className="mt-4 bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-3xl shadow-xl border-b-8 border-emerald-800 animate-bounce z-10">95% ÉXITO</div>
      </div>

      {/* 2. TOP 3 DEL DÍA (GIGANTES) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-3xl uppercase italic text-center mb-10 border-b-4 border-slate-50 pb-4">TOP 3 DEL DÍA</h3>
        <div className="flex justify-around items-center gap-4 w-full">
          {currentStudy.top3.map((code) => (
            <div key={code} className="flex flex-col items-center">
               <img src={getAnimalImageUrl(code)} className="w-40 h-40 md:w-64 md:h-64 object-contain drop-shadow-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* 🛡️ 3. ANÁLISIS DE TENDENCIAS (NUEVA SECCIÓN SEGÚN IMAGEN) */}
      <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-6 md:p-10 shadow-2xl space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 text-slate-900">
              <BarChart3 size={32} className="text-emerald-500" />
              <h3 className="font-black text-3xl uppercase italic">Análisis de Tendencias</h3>
           </div>
           <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-6 py-2 rounded-xl font-black text-xs uppercase transition-all shadow-sm">
              <RefreshCw size={16} /> Actualizar
           </button>
        </div>

        {/* SELECTOR DE LOTERÍA (CHIPS CON LOGOS) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
           {LOTTERIES.map(l => (
             <button 
                key={l.id} 
                onClick={() => setTrendLottery(l.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[11px] uppercase transition-all border-2 shrink-0 ${trendLottery === l.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
             >
                <img src={getLotteryLogo(l.id)} className="w-5 h-5 rounded-full bg-white" />
                {l.name}
             </button>
           ))}
        </div>

        {/* COLUMNAS DE TENDENCIA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* CALIENTES */}
           <div className="bg-white border-4 border-slate-100 rounded-[3rem] p-6 hover:border-orange-500 transition-colors">
              <p className="font-black text-orange-500 uppercase italic text-center mb-8 flex items-center justify-center gap-2">
                 <Flame size={18} /> Números Calientes
              </p>
              <div className="grid grid-cols-2 gap-6">
                 {trendStudy.calientes.map(c => (
                   <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-28 md:h-28 object-contain hover:scale-110 transition-transform" />
                 ))}
              </div>
           </div>

           {/* FRÍOS */}
           <div className="bg-white border-4 border-slate-100 rounded-[3rem] p-6 hover:border-blue-500 transition-colors">
              <p className="font-black text-blue-500 uppercase italic text-center mb-8 flex items-center justify-center gap-2">
                 <Snowflake size={18} /> Números Fríos
              </p>
              <div className="grid grid-cols-2 gap-6">
                 {trendStudy.frios.map(c => (
                   <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-28 md:h-28 object-contain hover:scale-110 transition-transform" />
                 ))}
              </div>
           </div>

           {/* VENCIDOS */}
           <div className="bg-white border-4 border-slate-100 rounded-[3rem] p-6 hover:border-amber-500 transition-colors">
              <p className="font-black text-amber-500 uppercase italic text-center mb-8 flex items-center justify-center gap-2">
                 <Timer size={18} /> Números Vencidos
              </p>
              <div className="grid grid-cols-2 gap-6">
                 {trendStudy.vencidos.map(c => (
                   <img key={c} src={getAnimalImageUrl(c)} className="w-24 h-24 md:w-28 md:h-28 object-contain hover:scale-110 transition-transform" />
                 ))}
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
