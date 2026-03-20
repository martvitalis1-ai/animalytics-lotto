import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Trophy, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalName } from '@/lib/animalData';

const normalizeCode = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (str === '0' || str === '00') return str;
  const num = Number(str);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(99, num)).toString();
};

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [displayPredictions, setDisplayPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (loading) return; // FRENO DE MANO PARA EVITAR BUCLES
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: ricardoRows } = await supabase.from('dato_ricardo_predictions').select('*').eq('lottery_type', selectedLottery).eq('prediction_date', today).limit(5);
      const { data: superForecast } = await supabase.from('ai_predictions').select('*').eq('lottery_type', selectedLottery).limit(5);

      const manualMapped = (ricardoRows || []).flatMap((row: any) => {
        const code = normalizeCode(row?.predicted_numbers?.[0]);
        if (!code) return [];
        return [{ code, name: getAnimalName(code), probability: 98, isManual: true }];
      });

      const deduped = [...manualMapped].filter((item, index, arr) => arr.findIndex((x) => x.code === item.code) === index);
      setDisplayPredictions(deduped.slice(0, 3));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedLottery]);

  const get3D = (c: string) => `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${(c === '0' || c === '00') ? c : c.padStart(2, '0')}.png`;

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary">
            <Flame className="w-6 h-6 text-destructive animate-pulse" /> DATOS EXPLOSIVOS 3D
          </CardTitle>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/20"><SelectValue /></SelectTrigger>
            <SelectContent>{LOTTERIES.map(l => (<SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPredictions.map((pred, idx) => (
            <div key={idx} className="relative p-6 rounded-[2.5rem] border-2 bg-white shadow-xl flex flex-col items-center">
              <div className="relative w-32 h-32 mb-3">
                <img src={get3D(pred.code)} className="w-full h-full object-contain z-10 relative drop-shadow-xl" alt="" crossOrigin="anonymous" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                <span className="absolute inset-0 flex items-center justify-center text-[80px] font-black text-emerald-500/5 select-none">{pred.code}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{pred.code.padStart(2, '0')} - {pred.name}</h3>
              <div className="mt-3 px-4 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg">⚡ {pred.probability}% PROBABILIDAD</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
