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
    return generateDayForecast('lotto_activo', ["10:00 AM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history]);

  return (
    <Card className="border-2 border-primary/10 shadow-2xl p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-full font-black text-xl mb-6 shadow-md">
        <Clock size={24} /> PRÓXIMO SORTEO <ChevronRight />
      </div>

      {pred?.topPick && (
        <div className="flex flex-col items-center">
          <div className="relative w-56 h-56 lg:w-72 lg:h-72 mb-4 flex items-center justify-center bg-slate-50 rounded-[3rem]">
            {/* CARGA FORZADA DE PNG 3D */}
            <img 
              src={getAnimalImageUrl(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl animate-in zoom-in duration-500" 
              crossOrigin="anonymous"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[150px] font-black text-emerald-500/5 select-none font-mono">
              {pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{getAnimalName(pred.topPick.code)}</h2>
          <div className="mt-8 inline-flex items-center gap-2 px-12 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-3xl shadow-xl border-b-8 border-emerald-900">
            <Zap size={32} fill="yellow" className="text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      )}
    </Card>
  );
}
