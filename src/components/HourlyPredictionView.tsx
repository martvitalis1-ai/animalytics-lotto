import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Zap, Clock, ChevronRight } from "lucide-react";
import { generateDayForecast } from '@/lib/advancedProbability';
import { getAnimalName } from '@/lib/animalData';

export function HourlyPredictionView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CALCULAR EL PRÓXIMO SORTEO REAL (DINÁMICO)
  const nextDrawTime = useMemo(() => {
    const hours = [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
      "05:00 PM", "06:00 PM", "07:00 PM"
    ];
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

    // Buscamos la hora más cercana en el futuro (margen de 5 mins)
    return hours.find(t => toMin(t) >= currentMinutes - 5) || hours[0];
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('lottery_results')
          .select('*')
          .eq('lottery_type', 'lotto_activo')
          .order('created_at', { ascending: false })
          .limit(500);
        if (data) setHistory(data);
      } catch (e) {
        console.error("Error cargando historial");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pred = useMemo(() => {
    if (history.length === 0) return null;
    const today = new Date().toISOString().split('T')[0];
    const forecast = generateDayForecast('lotto_activo', [nextDrawTime], history, today);
    return forecast[0] || null;
  }, [history, nextDrawTime]);

  // RUTA AL BUCKET (ANIMALITOS EN MAYÚSCULAS)
  const get3D = (c: string) => {
    const code = String(c).trim();
    const final = (code === '0' || code === '00') ? code : code.padStart(2, '0');
    return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${final}.png`;
  };

  return (
    <Card className="border-2 border-primary/20 shadow-2xl p-6 lg:p-10 text-center bg-white rounded-[3.5rem] overflow-hidden relative">
      {/* DECORACIÓN DE FONDO */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <Zap size={200} />
      </div>

      <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-full font-black text-2xl mb-10 shadow-xl animate-pulse">
        <Clock size={28} /> {nextDrawTime} <ChevronRight /> PRÓXIMO
      </div>

      {pred?.topPick ? (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-700">
          <div className="relative w-56 h-56 lg:w-80 lg:h-80 mb-6 flex items-center justify-center">
            {/* CARGA FORZADA DE PNG CON FILTRO DE SOMBRA */}
            <img 
              src={get3D(pred.topPick.code)} 
              className="w-full h-full object-contain z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.25)]" 
              alt={pred.topPick.name}
              crossOrigin="anonymous"
              onError={(e) => {
                // Si la imagen no está en el bucket, ocultamos la rota para que el número grande brille
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            
            {/* NÚMERO DE AGUA GIGANTE DETRÁS */}
            <span className="absolute inset-0 flex items-center justify-center text-[160px] lg:text-[220px] font-black text-emerald-500/5 select-none font-mono">
              {pred.topPick.code === '00' || pred.topPick.code === '0' 
                ? pred.topPick.code 
                : pred.topPick.code.padStart(2, '0')}
            </span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-black uppercase text-slate-900 tracking-tighter mb-2">
            {getAnimalName(pred.topPick.code)}
          </h2>
          
          <div className="font-mono font-black text-3xl text-primary/40 mb-8">
            SORTEO: #{pred.topPick.code.padStart(2, '0')}
          </div>

          <div className="inline-flex items-center gap-4 px-12 py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl border-b-8 border-emerald-900 active:translate-y-1 transition-all">
            <Zap size={36} fill="yellow" className="text-yellow-300" /> 
            {Math.floor(pred.topPick.probability)}% ÉXITO
          </div>
          
          <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Análisis de Patrones Atómicos - Animalytics Pro
          </p>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center opacity-20">
          <Clock size={60} className="animate-spin mb-4" />
          <p className="font-black uppercase tracking-widest">Escaneando Sorteos...</p>
        </div>
      )}
    </Card>
  );
}
