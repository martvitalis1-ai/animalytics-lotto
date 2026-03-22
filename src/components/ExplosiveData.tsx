import { useState, useEffect } from 'react';
import { supabase } from "../integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Flame, Trophy } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalImageUrl } from '../lib/animalData';

export function ExplosiveData() {
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [displayPredictions, setDisplayPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Cargamos datos de la base de datos
      const { data: ricardoRows } = await supabase
        .from('dato_ricardo_predictions')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .eq('prediction_date', today)
        .order('created_at', { ascending: false })
        .limit(3);

      const mapped = (ricardoRows || []).map((row: any) => ({
        code: row.predicted_numbers?.[0] || '0',
        probability: 95,
        reason: row.notes || 'Análisis de Ciclo'
      }));

      setDisplayPredictions(mapped);
    } catch (e) {
      console.error("Error en Explosivos:", e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedLottery]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-none bg-white overflow-hidden">
        <CardHeader className="pb-2 bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary tracking-tighter italic">
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" /> DATOS EXPLOSIVOS
            </CardTitle>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-[180px] h-9 bg-white font-black text-xs border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="pt-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {displayPredictions.map((pred, idx) => (
              <div key={idx} className="relative flex flex-col items-center group">
                {/* MEDALLA DE RANKING */}
                <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-xl z-20 border-2 border-white">
                  #{idx + 1}
                </div>
                
                {/* IMAGEN 3D LIMPIA - SE PIERDE CON EL FONDO BLANCO */}
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img 
                    src={getAnimalImageUrl(pred.code)} 
                    className="w-full h-full object-contain z-10" 
                    alt="Animal"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* INFO TÉCNICA SIN NOMBRE NI NÚMERO REPETIDO */}
                <div className="mt-4 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase shadow-md">
                    ⚡ {pred.probability}% EFECTIVIDAD
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pt-2 border-t border-slate-100">
                    "{pred.reason}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
