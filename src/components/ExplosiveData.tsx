import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, Loader2, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalName, getAnimalImageUrl } from '@/lib/animalData';

const normalizeCode = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (str === '0' || str === '00') return str;
  const num = Number(str);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(99, num)).toString().padStart(2, '0');
};

interface ExplosiveAnimal {
  code: string;
  name: string;
  probability: number;
  status: 'hot' | 'cold' | 'caged';
}

export function ExplosiveData({ lotteryId: externalLotteryId }: { lotteryId?: string }) {
  const [selectedLottery, setSelectedLottery] = useState<string>(externalLotteryId || LOTTERIES[0].id);
  const [displayPredictions, setDisplayPredictions] = useState<ExplosiveAnimal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalLotteryId) setSelectedLottery(externalLotteryId);
  }, [externalLotteryId]);

  const loadData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get Dato Ricardo predictions
      const { data: ricardoRows } = await supabase
        .from('dato_ricardo_predictions')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .eq('prediction_date', today)
        .limit(5);

      // Get frequency from last 15 days for status
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      const { data: recentResults } = await supabase
        .from('lottery_results')
        .select('result_number, draw_date')
        .eq('lottery_type', selectedLottery)
        .gte('draw_date', fifteenDaysAgo.toISOString().split('T')[0])
        .order('draw_date', { ascending: false });

      // Build frequency map
      const freq: Record<string, number> = {};
      const lastSeen: Record<string, string> = {};
      (recentResults || []).forEach((r: any) => {
        const num = r.result_number?.toString().trim();
        if (!num) return;
        const n = num === '00' ? '00' : num === '0' ? '0' : num.padStart(2, '0');
        freq[n] = (freq[n] || 0) + 1;
        if (!lastSeen[n]) lastSeen[n] = r.draw_date;
      });

      const getStatus = (code: string): 'hot' | 'cold' | 'caged' => {
        const count = freq[code] || 0;
        const last = lastSeen[code];
        if (!last) return 'caged';
        const days = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 7) return 'caged';
        if (count >= 3) return 'hot';
        return 'cold';
      };

      const manualMapped = (ricardoRows || []).flatMap((row: any) => {
        const code = normalizeCode(row?.predicted_numbers?.[0]);
        if (!code) return [];
        return [{
          code,
          name: getAnimalName(code),
          probability: 98,
          status: getStatus(code),
        }];
      });

      // If no manual predictions, use top frequent animals
      let predictions = manualMapped;
      if (predictions.length === 0) {
        predictions = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([code, count]) => ({
            code,
            name: getAnimalName(code),
            probability: Math.min(95, 60 + count * 5),
            status: getStatus(code),
          }));
      }

      const deduped = predictions.filter((item, index, arr) =>
        arr.findIndex((x) => x.code === item.code) === index
      );
      setDisplayPredictions(deduped.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedLottery]);

  const statusLabel = (s: string) => {
    if (s === 'hot') return { text: '🔥 CALIENTE', bg: 'bg-orange-500' };
    if (s === 'cold') return { text: '❄️ FRÍO', bg: 'bg-blue-500' };
    return { text: '🔒 ENJAULADO', bg: 'bg-slate-700' };
  };

  return (
    <Card className="border border-slate-100 overflow-hidden rounded-2xl">
      <CardHeader className="pb-2 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase text-primary">
            <Flame className="w-5 h-5 text-destructive" /> Datos Explosivos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 font-bold text-xs border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" />
                      {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline" size="icon" className="h-9 w-9" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : displayPredictions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {displayPredictions.map((pred) => {
              const sl = statusLabel(pred.status);
              return (
                <div key={pred.code} className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-50">
                  <img
                    src={getAnimalImageUrl(pred.code)}
                    className="w-20 h-20 object-contain"
                    alt={pred.name}
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.opacity = '0.3')}
                  />
                  <div className={`mt-2 px-2 py-0.5 rounded-full text-white text-[9px] font-black uppercase ${sl.bg}`}>
                    {sl.text}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600">{pred.probability}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs font-bold uppercase">Sin predicciones para hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
