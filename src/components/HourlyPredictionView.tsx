import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Zap, Clock, ChevronRight } from "lucide-react";
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', 'lotto_activo')
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setHistory(data);
    };
    load();
  }, []);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast('lotto_activo', ["12:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history]);

  // URL DIRECTA AL BUCKET SUPABASE
  const get3D = (c: string) => `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${c === '0' || c === '00' ? c : c.padStart(2, '0')}.png`;

  return (
    <Card className="border-2 border-primary/20 shadow-2xl p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-full font-black mb-6 shadow-md">
        <Clock size={20} /> 12:00 PM - PRÓXIMO <ChevronRight size={16} />
      </div>

      {pred?.topPick && (
        <div className="flex flex-col items-center animate-in zoom-in duration-500">
          <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-4 flex items-center justify-center">
            {/* IMAGEN 3D REAL DESDE STORAGE */}
            <img 
              src={get3D(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" 
              crossOrigin="anonymous"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[140px] font-black text-emerald-500/5 select-none">
              {pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{pred.topPick.name}</h2>
          <div className="mt-6 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-xl border-b-4 border-emerald-800">
            <Zap size={28} fill="yellow" className="text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      )}
    </Card>
  );
}
