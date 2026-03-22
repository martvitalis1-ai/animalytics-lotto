import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Trophy } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';

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
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: ricardoRows } = await supabase
        .from('dato_ricardo_predictions')
        .select('lottery_type, predicted_numbers, predicted_animals, notes, prediction_date')
        .eq('lottery_type', selectedLottery)
        .eq('prediction_date', today)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: superForecast } = await (supabase as any)
        .from('super_pronostico_final')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('power_score', { ascending: false })
        .limit(10);

      const manualMapped = (ricardoRows || []).flatMap((row: any) => {
        const code = normalizeCode(row?.predicted_numbers?.[0]);
        if (!code) return [];
        const fallbackName = getAnimalName(code) || `Animal ${code.padStart(2, '0')}`;
        return [{
          code,
          name: row?.predicted_animals?.[0] || fallbackName,
          probability: 98,
          isManual: true,
          reason: row?.notes || 'Dato cargado en dato_ricardo_predictions'
        }];
      });

      const aiMapped = (superForecast || []).flatMap((row: any) => {
        const base = Math.max(1, Math.min(99, Math.floor(Number(row?.power_score ?? 80))));
        const candidates = [
          { code: normalizeCode(row?.pronostico_dia), reason: 'Pronóstico día', probability: base },
          { code: normalizeCode(row?.pronostico_jaladera), reason: 'Pronóstico jaladera', probability: Math.max(1, base - 4) },
          { code: normalizeCode(row?.pronostico_fijo), reason: 'Pronóstico fijo', probability: Math.max(1, base - 8) }
        ];

        return candidates
          .filter((c) => !!c.code)
          .map((c) => ({
            code: c.code,
            name: getAnimalName(c.code as string) || `Animal ${(c.code as string).padStart(2, '0')}`,
            probability: c.probability,
            isManual: false,
            reason: c.reason
          }));
      });

      const deduped = [...manualMapped, ...aiMapped].filter((item, index, arr) => {
        return arr.findIndex((x) => x.code === item.code) === index;
      });

      setDisplayPredictions(deduped.slice(0, 3));
    } catch (e) {
      console.error("Error en Explosivos:", e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedLottery]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2 bg-muted/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary tracking-tighter">
              <Flame className="w-6 h-6 text-destructive animate-pulse" /> DATOS EXPLOSIVOS
            </CardTitle>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2 font-bold">
                      <img src={getLotteryLogo(l.id)} alt={l.name} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-xs font-bold text-muted-foreground uppercase">Cargando explosivos reales...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayPredictions.map((pred, idx) => (
                <div key={idx} className={`relative p-6 rounded-3xl border-2 transition-all shadow-xl ${pred.isManual ? 'bg-gradient-to-br from-red-500/10 via-background to-orange-500/10 border-red-500/30' : 'bg-card border-primary/10'}`}>
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center border-2 border-primary/30 font-black">
                    {pred.isManual ? <Trophy className="w-5 h-5 text-amber-500" /> : `#${idx + 1}`}
                  </div>
                  <div className="text-center space-y-3">
                    <span className="text-7xl block drop-shadow-2xl">{getAnimalEmoji(pred.code)}</span>
                    <h3 className="text-3xl font-black text-primary leading-none">{pred.code.padStart(2, '0')}</h3>
                    <p className="text-sm font-black uppercase tracking-widest opacity-80">{pred.name}</p>
                    <div className="flex justify-center gap-2 pt-1">
                      <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">⚡ {Math.floor(pred.probability)}%</span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground italic bg-muted/30 p-2 rounded-xl">"{pred.reason}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
