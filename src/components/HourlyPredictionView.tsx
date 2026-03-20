import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { generateDayForecast } from '@/lib/advancedProbability';
import { getAnimalName, getAnimalImageUrl, getAnimalEmoji } from '@/lib/animalData';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setHistory(data);
    } catch (error) { console.error(error); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, ["02:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery]);

  return (
    <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden p-6 text-center bg-white rounded-[3rem]">
      <div className="flex justify-between items-center mb-6">
        <div className="px-6 py-2 bg-primary text-white rounded-full font-black flex items-center gap-2">
          <Clock size={20} /> PRÓXIMO SORTEO
        </div>
        <button onClick={loadData} className="text-primary hover:rotate-180 transition-all duration-500">
          <RefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {pred?.topPick ? (
        <div className="flex flex-col items-center animate-in zoom-in duration-500">
          <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-4 flex items-center justify-center bg-slate-50 rounded-[3rem] shadow-inner">
            {/* CARGA FORZADA DE PNG DESDE STORAGE */}
            <img 
              src={getAnimalImageUrl(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" 
              crossOrigin="anonymous"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[130px] font-black text-emerald-500/5 select-none">
              {pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{pred.topPick.name}</h2>
          <div className="mt-6 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl border-b-4 border-emerald-800">
            <Zap size={28} fill="yellow" className="text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center opacity-30">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-black uppercase tracking-widest text-xs">Sincronizando Búnker...</p>
        </div>
      )}
    </Card>
  );
}
