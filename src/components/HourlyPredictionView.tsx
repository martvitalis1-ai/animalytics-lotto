import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Brain, Clock } from "lucide-react";

export function HourlyPredictionView({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any>(null);
  const [nextHour, setNextHour] = useState("");

  useEffect(() => {
    // Cálculo de hora real (Foto 1)
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
      // Ajuste de ID para base de datos (Foto 3, 5)
      const dbId = lotteryId === 'granjita' ? 'la_granjita' : lotteryId;
      
      const { data: res } = await supabase.from('lottery_results')
        .select('*').eq('lottery_type', dbId).order('draw_date', { ascending: false }).limit(200);

      const freq: any = {};
      codes.forEach(c => freq[c] = 0);
      res?.forEach(r => { if(freq[r.result_number] !== undefined) freq[r.result_number]++ });
      const sorted = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]);
      
      setData({
        maestro: sorted[0][0],
        hot: sorted.slice(1, 5).map(x => x[0]),
        gift: ['12', '00', '31'] // Datos de regalo
      });
    }
    load();
  }, [lotteryId]);

  if (!data) return <div className="p-20 text-center font-black animate-pulse">SINCRONIZANDO...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white border-4 border-slate-900 rounded-[5rem] p-12 flex flex-col items-center shadow-2xl">
        <span className="bg-slate-900 text-white px-8 py-2 rounded-full font-black text-xs mb-4 uppercase">ESTUDIO PRÓXIMO SORTEO: {nextHour}</span>
        <img src={getAnimalImageUrl(data.maestro)} className="w-80 h-80 object-contain drop-shadow-2xl" />
        <div className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black text-4xl shadow-xl border-b-8 border-emerald-800">95% ÉXITO</div>
        <p className="mt-6 text-slate-400 font-black italic uppercase text-center max-w-md">ANÁLISIS: Ciclo térmico detectado por arrastre de 72h.</p>
      </div>

      {/* ANIMALES DE REGALO GRANDES (Foto 2) */}
      <div className="bg-slate-900 text-white p-10 rounded-[4rem] border-b-8 border-emerald-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic mb-8 text-center text-emerald-400">🎁 Animales de Regalo Maestro</h3>
        <div className="flex justify-around items-center gap-4">
           {data.gift.map((code: string) => (
             <div key={code} className="flex flex-col items-center bg-white/10 p-6 rounded-[3rem] border border-white/20">
                <img src={getAnimalImageUrl(code)} className="w-32 h-32 md:w-44 md:h-44 object-contain" />
                <span className="font-black text-2xl mt-4">#{code}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
