import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Grid3X3, Zap, ShieldCheck, Clock, Calendar, Settings } from "lucide-react";
import { HourlyPredictionView } from "./HourlyPredictionView"; // Su componente actual mejorado
import { ExplosiveData } from "./ExplosiveData"; // Nuevo componente
import { SequenceMatrixView } from "./SequenceMatrixView"; // Nuevo componente

export function Dashboard({ userRole, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* RECOMENDACIÓN MAESTRA DE LA IA (BANNER DE ALTO IMPACTO) */}
        <div className="bg-emerald-600 p-6 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
           <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-40 opacity-10 rotate-12" />
           <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
              <Zap size={40} className="fill-yellow-300 text-yellow-300 animate-pulse" />
           </div>
           <div className="text-center md:text-left flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Recomendación del Sistema</p>
              <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none">Frecuencia de Ciclo Activada</h2>
              <p className="text-sm font-medium mt-1">La matriz detecta alta probabilidad en el grupo de aves para la lotería seleccionada.</p>
           </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 h-auto bg-slate-100 p-1.5 rounded-[2rem]">
            <TabsTrigger value="ia" className="rounded-2xl font-black text-xs">IA</TabsTrigger>
            <TabsTrigger value="explosivo" className="rounded-2xl font-black text-xs">EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="matriz" className="rounded-2xl font-black text-xs">MATRIZ</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-2xl font-black text-xs">BÓVEDA</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-2xl font-black text-xs"><Settings size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-8">
            {/* OPCIÓN 3: PANEL DE ANÁLISIS POR LOTERÍA (CALIENTES, FRÍOS, ENJAULADOS) */}
            <HourlyPredictionView /> 
          </TabsContent>

          <TabsContent value="explosivo">
            <ExplosiveData />
          </TabsContent>

          <TabsContent value="matriz">
            <SequenceMatrixView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
