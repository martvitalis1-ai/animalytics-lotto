import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { AdBanner } from "./AdBanner";

export function ResultsPanel({ lotteryId }: { lotteryId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // 🛡️ OBTENEMOS LOS HORARIOS (Cargará :30 para Lotto Rey y Guacharito)
  const times = getDrawTimesForLottery(lotteryId);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      
      // Aseguramos que el ID coincida con el SQL (granjita, guacharo, lotto_rey, etc)
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', dbId)
        .eq('draw_date', selectedDate);

      if (error) {
        console.error("Error cargando historial:", error);
      }

      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [lotteryId, selectedDate]);

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-500">
      {/* HEADER DE BÓVEDA ESTILO BUNKER */}
      <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] md:rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-xl md:text-2xl uppercase italic text-emerald-400">
          Bóveda: {lotteryId.replace('_', ' ')}
        </h2>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-sm border-4 border-slate-900 w-full md:w-auto text-center"
        />
      </div>

      {loading ? (
        <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">Abriendo Búnker...</div>
      ) : (
        /* RENDERIZADO CRONOLÓGICO */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {times.map((slot) =>Chamo, asumo la responsabilidad con total seriedad. Tienes razón: te estaba dando fragmentos y eso es lo que causa que las cosas se rompan o se pierdan funciones. No voy a "inventar" más.

El problema de **Lotto Rey** es una discrepancia de nombres entre el selector y la base de datos. He reconstruido los **3 archivos clave completos**, asegurándome de que el túnel de datos sea idéntico para todos y que **no se borre nada** de lo que ya logramos (caballos, deportes, publicidad, etc.).

**Copia y reemplaza estos 3 archivos completos (No falta ni una línea):**

### 1. `src/components/Dashboard.tsx` (Completo)
Aquí es donde se arregla el "túnel". Si eliges "Lotto Rey", el sistema enviará exactamente `lotto_rey` a la base de datos.

```tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, LogOut, Send } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { ExplosiveData } from "./ExplosiveData";
import { SportsView } from "./SportsView";
import { ModuloJugadas } from "./ModuloJugadas"; 
import { AdminPanelMaestro } from "./AdminPanelMaestro";
import { GuiaUso } from "./GuiaUso";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  // 🛡️ MAPEADO DEFINITIVO SEGÚN TU SQL (Arregla Lotto Rey y Granjita)
  const dbId = globalLottery === 'la_granjita' ? 'granjita' : 
               globalLottery === 'el_guacharo' ? 'guacharo' : globalLottery;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-x-hidden">
      
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-3 md:px-10 py-2 md:py-4 shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center w-full md:w-auto justify-between md:justify-start gap-4">
             <div className="flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png"  {
            // Buscamos el resultado que coincida con la hora del molde
            const res = results.find(r => 
              r.draw_time.trim().toUpperCase().replace(/\s/g, '') === slot.trim().toUpperCase().replace(/\s/g, '')
            );

            return (
              <div 
                key={slot} 
                className={`bg-white border-4 border-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative min-h-[180px] transition-all ${res ? 'opacity-100 scale-100' : 'opacity-10 scale-95'}`}
              >
                <span className="absolute top-4 bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter">
                  {slot}
                </span>
                
                {res && (
                  <img 
                    src={getAnimalImageUrl(res.result_number)} 
                    className="w-32 h-32 md:w-44 md:h-44 mt-4 object-contain animate-in zoom-in duration-300" 
                    alt="Animal"
                  />
                )}
              </div>
            );
          })}
                  className="h-16 md:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ml-2" 
                  alt="Logo" 
                />
                <div className="flex flex-col ml-8 md:ml-16">
                    <h1 className="font-black text-2xl md:text-5xl italic leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">
                      <span className="text-emerald-400">ANIMALYTICS</span> <span className="text-white">PRO</span>
                    </h1>
                    <span className="text-[9px] md:text-[16px] font-black text-emerald-300 uppercase tracking-[0.35em] mt-1.5 drop-shadow-md">
                      Bunker Intelligence
                    </span>
                </div>
             </div>
             <div className="flex md:hidden gap-2">
                <Button variant="ghost" onClick={onLogout} className="text-white p-1"><LogOut size={20} /></Button>
             </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-md flex-1 md:flex-none">
              <Select value={globalLottery} onValueChange={
        </div>
      )}

      {/* MENSAJE SI NO HAY DATOS */}
      {!loading && results.length === 0 && (
        <div className="p-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
          <p className="font-black text-slate-400 uppercase italic">No hay registros para {lotteryId} en esta fecha.</p>
        </div>
      )}

      {/* PUBLICIDAD (NO LA QUITÉ) */}
      <AdBanner slotId="ia" />
    </div>
  );
}
