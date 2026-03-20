import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Zap, Clock, ChevronRight } from "lucide-react";
import { generateDayForecast } from '@/lib/advancedProbability';
import { getAnimalName, getAnimalImageUrl } from '@/lib/animalData';

export function HourlyPredictionView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('lottery_results').select('*').order('created_at', { ascending: false }).limit(500);
      if (data) setHistory(data);
    };
    load();
  }, []);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast('lotto_activo', ["01:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history]);

  return (
    <Card className="border-2 border-primary/20 shadow-2xl p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-full font-black text-xl mb-6 shadow-md">
        <Clock size={24} /> PRÓXIMO SORTEO <ChevronRight />
      </div>

      {pred?.topPick && (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-4 flex items-center justify-center">
            {/* ESTA ES LA IMAGEN 3D REAL DESDE SUPABASE */}
            <img 
              src={getAnimalImageUrl(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" 
              crossOrigin="anonymous"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[140px] font-black text-emerald-500/5 select-none">
              {pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{getAnimalName(pred.topPick.code)}</h2>
          <div className="mt-6 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-xl">
            <Zap size={28} fill="yellow" className="text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      )}
    </Card>
  );
}
