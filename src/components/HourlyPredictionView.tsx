import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateDayForecast, HourlyForecast } from '@/lib/advancedProbability';

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

  const pred = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, ["10:00 AM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden text-slate-900">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-full font-black text-2xl shadow-xl">
            PRÓXIMO SORTEO
          </div>
          {pred?.topPick && (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden flex flex-col items-center">
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <img 
                  key={pred.topPick.code}
                  src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${pred.topPick.code.padStart(2, '0').replace('00', '00').replace(/^0(\d)$/, '0$1')}.png`} 
                  className="w-full h-full object-contain drop-shadow-2xl z-10 animate-in zoom-in-95 duration-500" 
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">{pred.topPick.code.padStart(2, '0')}</span>
              </div>
              <h3 className="text-4xl font-black uppercase mt-4 tracking-tighter text-slate-800">{pred.topPick.name}</h3>
              <div className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl">
                <Zap className="w-7 h-7 fill-yellow-300 text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
