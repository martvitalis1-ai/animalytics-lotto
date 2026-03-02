import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Zap, Trophy, Brain, Lock } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateBrainPredictions, BrainPrediction } from '@/lib/brainEngine';

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [displayPredictions, setDisplayPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadAllData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. ABSOREMOS EL MANDO MANUAL (admin_picks)
      // Buscamos lo que tú agregaste manualmente hoy
      const { data: manualPicks } = await supabase
        .from('admin_picks')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .eq('pick_date', today)
        .order('created_at', { ascending: false });

      // 2. ABSOREMOS EL MOTOR DE IA (Brain Engine)
      // Jalamos el historial para que la IA trabaje de fondo
      const { data: history } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const brainPreds = await generateBrainPredictions(selectedLottery, history || [], 10);

      // 3. LA FUSIÓN MAESTRA (Prioridad Jefe > IA)
      const manualMapped = (manualPicks || []).map(p => ({
        code: p.animal_code,
        name: p.animal_name,
        probability: p.pick_type === 'explosivo' ? 98 : 95, // Probabilidad de Jefe
        status: p.pick_type === 'explosivo' ? 'HOT' : 'STRONG',
        statusEmoji: p.pick_type === 'explosivo' ? '🔥' : '💎',
        reason: p.notes || "Dato especial del Jefe Ricardo (Malicia Pura)",
        isManual: true
      }));

      // Filtramos los de la IA para que no se repitan con los tuyos
      const manualCodes = manualMapped.map(m => m.code);
      const filteredAI = brainPreds.filter(p => !manualCodes.includes(p.code));

      // Unimos: Tus datos van de PRIMERO, la IA rellena los huecos
      const finalResult = [...manualMapped, ...filteredAI].slice(0, 3);
      
      setDisplayPredictions(finalResult);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error en el búnker:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    // SINCRONIZACIÓN REALTIME TOTAL
    // Si agregas algo en el Admin, esto se actualiza solo sin refrescar
    const channelPicks = supabase.channel('realtime-picks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_picks' }, loadAllData)
      .subscribe();

    const channelResults = supabase.channel('realtime-results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, loadAllData)
      .subscribe();

    return () => {
      supabase.removeChannel(channelPicks);
      supabase.removeChannel(channelResults);
    };
  }, [selectedLottery]);

  const getStatusStyle = (prob: number) => {
    if (prob >= 90) return "bg-red-500/20 text-red-600 border-red-500/50";
    if (prob >= 75) return "bg-orange-500/20 text-orange-600 border-orange-500/50";
    return "bg-emerald-500/20 text-emerald-600 border-emerald-500/50";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2 bg-muted/10 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-primary">
              <Flame className="w-6 h-6 text-destructive animate-pulse" />
              Datos Explosivos
              <Sparkles className="w-4 h-4 text-amber-500" />
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-[10px] font-bold text-muted-foreground uppercase text-right mr-2">
                Búnker Activo<br/>{lastUpdate}
              </div>
              <Select value={selectedLottery} onValueChange={setSelectedLottery}>
                <SelectTrigger className="w-[180px] h-9 bg-background font-black text-xs border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-bold">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" />
                        {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPredictions.map((pred, idx) => (
              <div 
                key={idx} 
                className={`relative p-6 rounded-3xl border-2 transition-all duration-500 hover:scale-105 ${
                  pred.isManual 
                  ? 'bg-gradient-to-br from-red-500/15 via-background to-orange-500/15 border-red-500/40 shadow-red-500/10' 
                  : 'bg-card border-primary/20'
                } shadow-xl`}
              >
                {/* Badge de Posición / Corona */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg border-2 border-primary/30">
                  {pred.isManual ? <Trophy className="w-5 h-5 text-amber-500" /> : <span className="font-black text-sm">#{idx + 1}</span>}
                </div>

                {pred.isManual && (
                  <div className="absolute top-2 right-3 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-500" />
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Dato Fijo</span>
                  </div>
                )}

                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <span className="text-7xl block drop-shadow-2xl animate-in zoom-in duration-700">
                      {getAnimalEmoji(pred.code)}
                    </span>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs border-2 border-background">
                      {pred.code.padStart(2, '0')}
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">
                      {pred.name}
                    </h3>
                    <div className="flex justify-center gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 uppercase border ${getStatusStyle(pred.probability)}`}>
                        <Zap className="w-3 h-3 fill-current" />
                        {pred.probability >= 90 ? 'Caliente' : 'Fuerte'}
                      </span>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black border border-emerald-500/30 bg-emerald-500/10 text-emerald-600`}>
                        ⚡ {Math.floor(pred.probability)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground leading-tight italic">
                      "{pred.reason}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda Profesional */}
          <div className="mt-8 pt-4 border-t flex flex-wrap justify-center gap-4">
             <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-muted-foreground uppercase">Procesado con IA V6.0</span>
             </div>
             <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-muted-foreground uppercase">Algoritmo de Malicia Activo</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
