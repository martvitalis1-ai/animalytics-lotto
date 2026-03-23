import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2, ShieldCheck, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalImageUrl, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView({ lotteryId: externalLotteryId, onLotteryChange }: any) {
  const [selectedLottery, setSelectedLottery] = useState(externalLotteryId || 'lotto_activo');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('draw_date', { ascending: false }).limit(500);
      if (data) setHistory(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    const times = getDrawTimesForLottery(selectedLottery);
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => {
      const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return 0;
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(m[2]);
    };
    const nextTime = times.find(t => toMin(t) >= currentMin - 5) || times[0];
    const forecasts = generateDayForecast(selectedLottery, [nextTime], history, new Date().toISOString().split('T')[0]);
    return { time: nextTime, ...forecasts[0]?.topPick };
  }, [history, selectedLottery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 p-8 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="bg-emerald-500 p-4 rounded-[2rem] shadow-lg"><Zap size={40} className="fill-white text-white animate-pulse" /></div>
          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Sugerencia Inteligente</p>
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none mt-1">Alta Probabilidad en {getAnimalName(pred?.code || '0')}</h2>
            <p className="text-sm mt-2 font-medium text-slate-300">Mejor oportunidad: <span className="text-emerald-400 font-black underline">{pred?.time || "---"}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[4.5rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center relative overflow-hidden">
         <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center bg-white mt-4">
            <img src={getAnimalImageUrl(pred?.code || '0')} className="w-full h-full object-contain z-10" alt="" crossOrigin="anonymous" />
         </div>
         <div className="mt-8 bg-emerald-600 text-white px-10 py-4 rounded-3xl font-black text-3xl shadow-xl border-b-8 border-emerald-800 uppercase italic">
            {pred?.probability || 0}% ÉXITO
         </div>
      </div>
    </div>
  );
}
