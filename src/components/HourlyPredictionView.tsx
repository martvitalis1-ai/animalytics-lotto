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
    return generateDayForecast(selectedLottery, ["01:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery]);

  return (
    <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden p-6 text-center bg-white rounded-[3rem]">
      <div className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-full font-black mb-10 shadow-lg">
        <Clock size={20} /> PRÓXIMO SORTEO <ChevronRight />
      </div>

      {pred?.topPick ? (
        // Reemplaza el bloque de la imagen por este:
<div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-50 overflow-hidden">
  <img 
    key={nextPrediction.topPick.code}
    src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' ? nextPrediction.topPick.code : nextPrediction.topPick.code.padStart(2, '0')}.png`} 
    className="w-full h-full object-contain z-10 drop-shadow-2xl animate-in zoom-in-95 duration-500" 
    crossOrigin="anonymous"
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
  />
  <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">
    {nextPrediction.topPick.code.padStart(2, '0')}
  </span>
</div>
