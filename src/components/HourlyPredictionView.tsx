import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock } from "lucide-react";
import { getDrawTimesForLottery } from '@/lib/constants';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);

  const nextDrawTime = useMemo(() => {
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
    return times.find(t => toMin(t) >= currentMin - 5) || times[0];
  }, [selectedLottery]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('created_at', { ascending: false }).limit(500);
      if (data) setHistory(data);
    };
    load();
  }, [selectedLottery]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, [nextDrawTime], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery, nextDrawTime]);

  // URL DE SUPABASE DIRECTA
  const get3D = (c: string) => `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${c.padStart(2, '0').replace('00', '00').replace(/^0(\d)$/, '0$1')}.png`;

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden p-6 text-center">
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-black mb-6">
        <Clock size={20} /> {nextDrawTime} - PRÓXIMO
      </div>

      {pred?.topPick && (
        <div className="bg-white rounded-[3rem] p-8 border-4 border-slate-100 shadow-2xl relative flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
            <img 
              src={get3D(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-2xl" 
              crossOrigin="anonymous"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="absolute bottom-0 text-[130px] font-black text-emerald-500/5 leading-none select-none">
              {pred.topPick.code.padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">{pred.topPick.name}</h2>
          <div className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">
            <Zap size={20} fill="yellow" /> {Math.floor(pred.topPick.probability)}% PROBABILIDAD
          </div>
        </div>
      )}
    </Card>
  );
}
