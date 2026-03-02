import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Sparkles, RefreshCw, Loader2, Flame, Snowflake, Clock, ChevronDown, ChevronUp, AlertTriangle, Info, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { CAGED_NUMBERS } from '@/data/historyBatch';
import { RichAnimalCard, RichAnimalCardCompact } from './RichAnimalCard';
import { 
  getAllCachedPredictions, 
  getTodayDate,
  CachedPrediction,
  getAccuracyStats
} from '@/lib/predictionCache';
import { generateBrainPredictions, BrainPrediction } from '@/lib/brainEngine';

export function AIPredictive() {
  const [predictions, setPredictions] = useState<Record<string, CachedPrediction>>({});
  const [ricardoPredictions, setRicardoPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedLottery, setExpandedLottery] = useState<string | null>(null);
  const [hourlyPredictions, setHourlyPredictions] = useState<Record<string, Record<string, CachedPrediction>>>({});
  const [accuracyStats, setAccuracyStats] = useState<{ overall: number; streak: number }>({ overall: 0, streak: 0 });
  const [cacheDate, setCacheDate] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    // ABSORCIÓN TOTAL: Quitamos el filtro de fecha de Lovable para que vea todo el historial
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (data) {
      setHistory(data);
    }
  }, []);

  const generatePredictions = useCallback(async () => {
    if (!history || history.length === 0) return;
    setLoading(true);
    
    try {
      const allPredictions: Record<string, CachedPrediction> = {};
      const allHourlyPredictions: Record<string, Record<string, CachedPrediction>> = {};
      
      for (const lottery of LOTTERIES) {
        const { general, hourly } = getAllCachedPredictions(history, lottery.id);
        allPredictions[lottery.id] = general;
        allHourlyPredictions[lottery.id] = hourly;
      }
      
      setPredictions(allPredictions);
      setHourlyPredictions(allHourlyPredictions);
      setLastUpdate(new Date());
      setCacheDate(getTodayDate());
      
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [history]);

  useEffect(() => {
    loadHistory();
    const channel = supabase.channel('ai-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => loadHistory())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadHistory]);

  useEffect(() => {
    if (history.length > 0) generatePredictions();
  }, [history, generatePredictions]);

  const toggleLottery = (lotteryId: string) => {
    setExpandedLottery(expandedLottery === lotteryId ? null : lotteryId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HOT': return <Flame className="w-3 h-3 text-red-500" />;
      case 'COLD': return <Snowflake className="w-3 h-3 text-blue-500" />;
      case 'OVERDUE': return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="font-black text-xl tracking-tighter uppercase italic">IA Predictiva Pro</h2>
        </div>
        <Button onClick={generatePredictions} disabled={loading} variant="ghost" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOTTERIES.map((lottery) => {
          const cached = predictions[lottery.id];
          const lotteryPredictions = cached?.predictions || [];
          const isExpanded = expandedLottery === lottery.id;
          
          return (
            <Card key={lottery.id} className="glass-card border-2 border-primary/10 overflow-hidden shadow-lg">
              <CardHeader className="pb-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <img src={getLotteryLogo(lottery.id)} alt="" className="w-6 h-6 rounded-full" />
                  <CardTitle className="text-sm font-black uppercase">{lottery.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {lotteryPredictions.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {lotteryPredictions.slice(0, 3).map((pred, idx) => (
                      <RichAnimalCard
                        key={pred.number}
                        code={pred.number}
                        probability={pred.probability}
                        status={pred.status}
                        rank={idx + 1}
                        size="sm"
                        showProbability
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 animate-pulse">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Calculando racha...</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full font-bold text-[10px] uppercase"
                  onClick={() => toggleLottery(lottery.id)}
                >
                  {isExpanded ? 'Cerrar Detalles' : 'Ver Análisis por Hora'}
                </Button>

                {isExpanded && (
                  <div className="mt-2 space-y-2 animate-in fade-in zoom-in-95">
                    {getDrawTimesForLottery(lottery.id).map((time) => (
                      <div key={time} className="p-2 bg-card border rounded flex items-center justify-between">
                        <span className="text-[10px] font-black">{time}</span>
                        <div className="flex gap-1">
                          <Lock className="w-3 h-3 text-green-500 opacity-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
