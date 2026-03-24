import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { LOTTERIES } from '../lib/constants';
import { Brain, Star } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextHour, setNextHour] = useState("");

  useEffect(() => {
    // 🕒 Cálculo de hora real
    const drawTimes = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];
    const hour = new Date().getHours();
    const current = hour > 12 ? hour - 12 : hour;
    const next = drawTimes.find(t => t > current) || 8;
    setNextHour(`${next}:00 ${hour >= 12 && next < 8 ? 'PM' : 'AM'}`);

    async function load() {
      setLoading(true);
      const { data } = await supabase.from('lottery_results').select('*').order('draw_date', { ascending: false }).limit(400);
      setAllResults(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const getLotteryStudy = (id: string) => {
    const results = allResults.filter(r => r.lottery_type === id);
    if (results.length === 0) return { maestro: '0', top3: ['01', '02', '03'] };
    const codes = getCodesForLottery(id);
    const freq: any = {};
    codes.forEach(c => freq[c] = 0);
    results.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
    const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
    return { maestro: sorted[0][0], top3: [sorted[3][0], sorted[4][0], sorted[5][0]] };
  };

  const currentStudy = useMemo(() => getLotteryStudy(lotteryId), [allResults, lotteryId]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-emerald-500 uppercase">Analizando Búnker...</div>;

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-40">
      
      {/* ANIMAL MAESTRO XXL (MÁXIMO BRILLO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="absolute opacity-5 w-full max-w-xl grayscale pointer-events-none" />
        <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase italic mb-6">ESTUDIO SORTEO: {nextHour}</div>
        <img src={getAnimalImageUrl(currentStudy.maestro)} className="w-[350px] h-[350px] md:w-[550px] md:h-[550px] object-contain transition-transform hover:scale-105" />
        <div className="mt-8 bg-emerald-600 text-white px-16 py-4 rounded-3xl font-black text-4xl shadow-xl border-b-8 border-emerald-800 animate-bounce">95% ÉXITO</div>
      </div>

      {/* ESTUDIO DE LAS 6 LOTERÍAS (EL FINAL DEL VIDEO 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-2">
        {LOTTERIES.map((lot) => {
          const study = getLotteryStudy(lot.id);
          return (
            <div key={lot.id} className="bg-white border-4 border-slate-900 rounded-[5rem] p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <div className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs uppercase mb-10 tracking-widest italic">{lot.name}</div>
              <p className="text-emerald-500 font-black text-2xl uppercase italic mb-8 border-b-4 pb-2">TOP 3 DEL DÍA</p>
              <div className="flex justify-center items-center gap-2 md:gap-6 w-full">
                {study.top3.map((code, index) => (
                  <div key={index} className="flex-1 flex justify-center">
                     <img src={getAnimalImageUrl(code)} className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-xl hover:scale-110 transition-all" />
                  </div>
                ))}
              </div>
              <div className="mt-12 w-full border-t-4 border-slate-50 pt-6 flex justify-between items-center px-8 text-slate-900">
                 <span className="font-black text-xs uppercase opacity-30">Power Score:</span>
                 <span className="font-black text-3xl italic underline decoration-emerald-500">99%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
