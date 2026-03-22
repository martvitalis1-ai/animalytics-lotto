import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../integrations/supabase/client";
import { Card } from "./ui/card";
import { Zap, Clock, ChevronRight } from "lucide-react";
import { generateDayForecast } from '../lib/advancedProbability';
import { getAnimalImageUrl } from '../lib/animalData';

export function HourlyPredictionView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setHistory(data);
    };
    loadData();
  }, []);

  const pred = useMemo(() => {
    if (!history || history.length === 0) return null;
    const today = new Date().toISOString().split('T')[0];
    const forecasts = generateDayForecast('lotto_activo', ["10:00 AM"], history, today);
    return forecasts[0]?.topPick || null;
  }, [history]);

  return (
    <Card className="border-none shadow-none p-6 text-center bg-white flex flex-col items-center">
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-black text-xs mb-8 shadow-md">
        <Clock size={14} /> PRÓXIMO SORTEO <ChevronRight size={14} />
      </div>

      {pred ? (
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
            <img 
              src={getAnimalImageUrl(pred.code)} 
              className="w-full h-full object-contain z-10" 
              crossOrigin="anonymous"
              alt="Prediction"
            />
          </div>
          <div className="mt-8 inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl border-b-4 border-emerald-800">
            <Zap size={24} fill="yellow" className="text-yellow-300" /> 
            {Math.floor(pred.probability)}% ÉXITO
          </div>
        </div>
      ) : (
        <div className="py-20 opacity-20 font-black uppercase text-xs tracking-widest">
           Sincronizando Inteligencia...
        </div>
      )}
    </Card>
  );
}
