import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap, Clock, RefreshCw, ChevronRight } from "lucide-react";
import { getAnimalName, getAnimalImageUrl } from '@/lib/animalData';
import { generateDayForecast } from '@/lib/advancedProbability';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const { data } = await supabase.from('lottery_results').select('*').eq('lottery_type', selectedLottery).order('created_at', { ascending: false }).limit(500);
    if (data) setHistory(data);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, ["12:00 PM"], history, new Date().toISOString().split('T')[0])[0] || null;
  }, [history, selectedLottery]);

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden text-slate-900 bg-white rounded-[3rem]">
      <CardContent className="pt-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-full font-black text-2xl shadow-xl animate-pulse">
            12:00 PM <ChevronRight /> PRÓXIMO
          </div>
          {pred?.topPick ? (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden flex flex-col items-center">
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                {/* CARGA DIRECTA 3D VIP */}
                <img 
                   src={getAnimalImageUrl(pred.topPick.code)} 
                   className="w-full h-full object-contain drop-shadow-2xl z-10 animate-in zoom-in-95 duration-500" 
                   crossOrigin="anonymous" 
                   onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">
                   {pred.topPick.code === '00' || pred.topPick.code === '0' ? pred.topPick.code : pred.topPick.code.padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-4xl font-black uppercase mt-4 tracking-tighter text-slate-800">{getAnimalName(pred.topPick.code)}</h3>
              <div className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-emerald-800">
                <Zap className="w-7 h-7 fill-yellow-300 text-yellow-300" /> {Math.floor(pred.topPick.probability)}% ÉXITO
              </div>
            </div>
          ) : <div className="py-20 flex flex-col items-center opacity-30 grayscale"><Clock size={48} className="animate-spin mb-4" /><p className="font-black uppercase tracking-widest text-sm text-center">Analizando Datos...</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
