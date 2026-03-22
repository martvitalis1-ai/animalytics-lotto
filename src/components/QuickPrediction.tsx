import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Sparkles, Brain, Loader2, Trophy, Lock } from "lucide-react";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { supabase } from "@/integrations/supabase/client";
import { getAnimalEmoji } from '@/lib/animalData';

type SuperPrediction = {
  code: string;
  probability: number;
  emoji: string;
};

const normalizeCode = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (str === '0' || str === '00') return str;
  const num = Number(str);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(99, num)).toString();
};

export function QuickPrediction() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [lastResults, setLastResults] = useState<string[]>(['', '', '', '']);
  const [predictions, setPredictions] = useState<SuperPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);

  const updateResult = (index: number, value: string) => {
    const newResults = [...lastResults];
    newResults[index] = value.replace(/\D/g, '').slice(0, 2);
    setLastResults(newResults);
  };

  const generatePrediction = async () => {
    const validResults = lastResults.filter(r => r.trim() !== '');
    if (validResults.length < 2) return;

    setLoading(true);

    const { data, error } = await (supabase as any)
      .from('super_pronostico_final')
      .select('*')
      .eq('lottery_type', selectedLottery)
      .order('power_score', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error leyendo super_pronostico_final:', error);
      setPredictions([]);
      setLoading(false);
      return;
    }

    const candidates = (data || []).flatMap((row: any) => {
      const base = Math.max(1, Math.min(99, Math.floor(Number(row?.power_score ?? 80))));
      return [
        { code: normalizeCode(row?.pronostico_dia), probability: base },
        { code: normalizeCode(row?.pronostico_jaladera), probability: Math.max(1, base - 4) },
        { code: normalizeCode(row?.pronostico_fijo), probability: Math.max(1, base - 8) },
      ];
    });

    const normalized = candidates
      .filter((item) => !!item.code)
      .map((item) => ({
        code: item.code as string,
        probability: item.probability,
        emoji: getAnimalEmoji(item.code as string),
      }));

    const deduped = normalized.filter((item, index, arr) => {
      return arr.findIndex((x) => x.code === item.code) === index;
    });

    setPredictions(deduped.slice(0, 5));
    setLoading(false);
  };

  return (
    <Card className="glass-card border-2 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-tighter">
          <Calculator className="w-5 h-5 text-primary" />
          Calculadora UNIBRAIN V5.1
        </CardTitle>
        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
          Ingresa los últimos 4 sorteos. El cálculo final lee super_pronostico_final.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase">Lotería</label>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="bg-background font-bold h-10">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(selectedLottery)} alt={lottery?.name || selectedLottery} className="w-5 h-5 rounded-full" />
                  <span>{lottery?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2 font-bold">
                    <img src={getLotteryLogo(l.id)} alt={l.name} className="w-4 h-4 rounded-full" />
                    <span>{l.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase">
            Secuencia de Resultados (Reciente a Antiguo)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {lastResults.map((result, index) => (
              <div key={index} className="space-y-1">
                <Input
                  type="text"
                  value={result}
                  onChange={(e) => updateResult(index, e.target.value)}
                  placeholder="00"
                  className="text-center font-mono font-black text-xl h-14 bg-primary/5 border-primary/20"
                  maxLength={2}
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={generatePrediction}
          disabled={loading || lastResults.filter(r => r.trim()).length < 2}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Procesar con IA
        </Button>

        {predictions.length > 0 && (
          <div className="space-y-3 pt-4 border-t-2 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-tighter">Resultados Top 5</h3>
                <Lock className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 bg-muted rounded-full uppercase">
                super_pronostico_final
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {predictions.slice(0, 5).map((pred, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                    idx === 0
                      ? 'bg-amber-500/20 border-amber-500/50 scale-105 shadow-md'
                      : 'bg-card border-border shadow-sm'
                  }`}
                >
                  <span className="text-xl mb-1">{pred.emoji}</span>
                  <span className={`font-mono font-black text-lg ${
                    idx === 0 ? 'text-amber-600' : 'text-primary'
                  }`}>
                    {pred.code.padStart(2, '0')}
                  </span>
                  <span className={`text-[8px] mt-1 font-black px-1.5 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {pred.probability}%
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest pt-2">
              <Brain className="w-3 h-3" />
              Fuente real: super_pronostico_final
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
