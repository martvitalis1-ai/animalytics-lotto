import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Zap, Trophy } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { generateBrainPredictions } from '@/lib/brainEngine';

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [displayPredictions, setDisplayPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // 1. BUSCAMOS SI EL JEFE PUSO ALGO MANUAL EN EL ADMIN (admin_picks)
    const { data: manualPicks } = await supabase
      .from('admin_picks')
      .select('*')
      .eq('lottery_type', selectedLottery)
      .eq('pick_date', today);

    // 2. BUSCAMOS LOS AUTOMÁTICOS DE LA IA POR SI ACASO
    const { data: history } = await supabase
      .from('lottery_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const brainPreds = await generateBrainPredictions(selectedLottery, history || [], 5);

    // 3. LA MALICIA: MEZCLAMOS AMBOS
    // Si hay manuales, los ponemos de primero con 98% de probabilidad (FUERZA MÁXIMA)
    const manualMapped = (manualPicks || []).map(p => ({
      code: p.animal_code,
      name: p.animal_name,
      probability: 98,
      status: 'HOT',
      statusEmoji: '🔥',
      reason: p.notes || "Dato especial del Jefe Ricardo para hoy"
    }));

    // Filtramos los de la IA para que no se repitan con los del jefe
    const manualCodes = manualMapped.map(m => m.code);
    const filteredAI = brainPreds.filter(p => !manualCodes.includes(p.code));

    // Mostramos los del jefe primero y rellenamos con IA hasta tener 3
    const finalResult = [...manualMapped, ...filteredAI].slice(0, 3);
    
    setDisplayPredictions(finalResult);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Sincronización en tiempo real: si guardas en el Admin, cambia aquí al segundo
    const channel = supabase.channel('explosive-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_picks' }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedLottery]);

  return (
    <div className="space-y-4">
      <Card className="glass-card border-2 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tighter text-destructive">
              <Flame className="w-5 h-5" /> Datos Explosivos ✨
            </CardTitle>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[150px] h-8 text-xs font-bold bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Top predicciones con probabilidades variables (35-98%) para hoy
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPredictions.map((pred, idx) => (
              <div 
                key={idx} 
                className="relative p-4 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-red-500/10 via-background to-orange-500/10 shadow-lg animate-in zoom-in-95"
              >
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-muted rounded-full border-2 border-primary/20 flex items-center justify-center text-xs font-black">
                  #{idx + 1}
                </div>
                <div className="text-center space-y-2">
                  <span className="text-6xl block drop-shadow-md">{getAnimalEmoji(pred.code)}</span>
                  <div className="font-mono font-black text-4xl text-primary leading-none">
                    {pred.code.padStart(2, '0')}
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest border-b-2 border-primary/10 pb-1">
                    {pred.name}
                  </div>
                  <div className="flex justify-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-600 rounded text-[10px] font-black flex items-center gap-1 uppercase border border-orange-500/30">
                      <Zap className="w-3 h-3" /> Fuerte
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 rounded text-[10px] font-black flex items-center gap-1 border border-emerald-500/30">
                      ⚡ {pred.probability}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
             <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 uppercase border border-red-500/20">🔥 Caliente (90%+)</span>
             <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 uppercase border border-orange-500/20">⚡ Fuerte (75-89%)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
