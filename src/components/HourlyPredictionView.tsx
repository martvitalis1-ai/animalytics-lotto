import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, ChevronRight, Loader2 } from "lucide-react";
import { getAnimalName, getAnimalImageUrl } from '@/lib/animalData';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('created_at', { ascending: false }).limit(500);
      if (data) setHistory(data);
    } catch (error) { console.error(error); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, ["04:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery]);

  return (
    <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-full font-black mb-10 shadow-lg">
        <Clock size={20} /> PRÓXIMO SORTEO <ChevronRight />
      </div>

      {pred?.topPick ? (
        <div className="flex flex-col items-center animate-in zoom-in duration-500">
          <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-6 flex items-center justify-center">
            <img 
              src={getAnimalImageUrl(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" 
              crossOrigin="anonymous"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[140px] font-black text-emerald-500/5 select-none font-mono">
              {pred.topPick.code === '00' || pred.topPick.code === '0' ? pred.topPick.code : pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-5xl font-black uppercase text-slate-800 tracking-tighter mb-4">{getAnimalName(pred.topPick.code)}</h2>
          <div className="mt-4 inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-xl border-b-8 border-emerald-900">
            <Zap size={24} fill="yellow" className="text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center opacity-30 grayscale"><Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" /><p className="font-black uppercase tracking-widest text-sm text-center">Analizando Datos...</p></div>
      )}
    </Card>
  );
}
