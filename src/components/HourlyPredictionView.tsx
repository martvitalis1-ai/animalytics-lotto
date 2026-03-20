import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, RefreshCw, Loader2, ChevronRight } from "lucide-react";
import { generateDayForecast, HourlyForecast } from '@/lib/advancedProbability';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';
import { getDrawTimesForLottery } from '@/lib/constants';

export function HourlyPredictionView() {
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // 1. CÁLCULO DINÁMICO DEL PRÓXIMO SORTEO (RELOJ REAL)
  const nextDrawTime = useMemo(() => {
    const times = getDrawTimesForLottery(selectedLottery);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const toMin = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let h = parseInt(match[1]);
      if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(match[2]);
    };

    // Buscamos el sorteo más cercano (margen de 5 mins antes de que pase)
    return times.find(t => toMin(t) >= currentMinutes - 5) || times[0];
  }, [selectedLottery]);

  const loadData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', selectedLottery)
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setHistory(data);
    } catch (error) { 
      console.error('Falla en sincronización:', error); 
    }
    setLoading(false);
  }, [selectedLottery]);

  useEffect(() => { loadData(); }, [loadData]);

  const pred = useMemo((): HourlyForecast | null => {
    if (history.length === 0) return null;
    return generateDayForecast(selectedLottery, [nextDrawTime], history, today)[0] || null;
  }, [history, selectedLottery, nextDrawTime, today]);

  // --- MOTOR VISUAL 3D (BLINDAJE DE IDENTIDAD 00) ---
  const get3DImage = (code: string) => {
    const clean = String(code).trim();
    // REGLA DE ORO: '0' y '00' pasan directo. 1-9 pasan a '01'-'09'
    const finalCode = (clean === '0' || clean === '00') ? clean : clean.padStart(2, '0');
    return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${finalCode}.png`;
  };

  return (
    <Card className="glass-card border-2 border-primary/20 shadow-2xl overflow-hidden p-6 text-center bg-white rounded-[3rem]">
      <div className="flex justify-between items-center mb-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-black shadow-md">
          <Clock size={20} /> {nextDrawTime} <ChevronRight size={16}/> PRÓXIMO
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="p-2 text-primary hover:bg-slate-100 rounded-full transition-all"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={24} />
        </button>
      </div>

      {pred?.topPick ? (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
          <div className="relative w-56 h-56 lg:w-72 lg:h-72 mb-4 flex items-center justify-center bg-slate-50 rounded-[3.5rem] shadow-inner border-2 border-slate-100">
            {/* CARGA DE PNG 3D DESDE SUPABASE */}
            <img 
              src={get3DImage(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)]" 
              crossOrigin="anonymous"
              onError={(e) => {
                // Si falla la imagen 3D, ocultamos el icono de error roto
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* EFECTO DE NÚMERO DE AGUA GIGANTE DETRÁS */}
            <span className="absolute inset-0 flex items-center justify-center text-[150px] lg:text-[200px] font-black text-emerald-500/5 select-none font-mono leading-none">
              {pred.topPick.code === '00' || pred.topPick.code === '0' ? pred.topPick.code : pred.topPick.code.padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-1 mt-4">
             <h2 className="text-5xl font-black uppercase text-slate-800 tracking-tighter">
                {getAnimalName(pred.topPick.code)}
             </h2>
             <p className="text-xl font-bold text-primary/40 font-mono italic">
                NÚMERO: {pred.topPick.code === '00' || pred.topPick.code === '0' ? pred.topPick.code : pred.topPick.code.padStart(2, '0')}
             </p>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl border-b-8 border-emerald-900 active:translate-y-1 transition-all">
            <Zap size={32} fill="yellow" className="text-yellow-300" /> 
            {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
          
          <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-100 w-full max-w-[300px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              ANÁLISIS TECNICO - ANIMALYTICS PRO
            </p>
          </div>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center opacity-30">
          <Loader2 className="animate-spin mb-4" size={48} color="#10b981" />
          <p className="font-black uppercase tracking-widest text-sm">Escaneando Malicia en la Base...</p>
        </div>
      )}
    </Card>
  );
}
