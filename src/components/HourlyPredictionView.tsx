import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Zap, Clock } from "lucide-react";
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('lottery_results').select('*').order('created_at', { ascending: false }).limit(200);
      if (data) setHistory(data);
    };
    load();
  }, []);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast('lotto_activo', ["10:00 AM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history]);

  return (
    <Card className="border-2 border-primary/10 shadow-2xl p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-black text-sm mb-6">
        <Clock size={16} /> PRÓXIMO SORTEO
      </div>
      {pred?.topPick && (
        <div className="flex flex-col items-center animate-in zoom-in duration-500">
          <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
            <img 
              src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${pred.topPick.code === '0' || pred.topPick.code === '00' ? pred.topPick.code : pred.topPick.code.padStart(2, '0')}.png`} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" crossOrigin="anonymous"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[130px] font-black text-emerald-500/5 select-none">{pred.topPick.code}</span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{pred.topPick.name}</h2>
          <div className="mt-4 inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-xl">
            <Zap size={20} fill="yellow" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      )}
    </Card>
  );
}
