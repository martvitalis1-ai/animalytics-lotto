import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Grid3X3, Settings, ShieldCheck, Zap, Clock, Calendar, Star } from "lucide-react";
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";

export function Dashboard({ userRole, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  // VERIFICACIÓN VISUAL PARA EL JEFE
  console.log("🔥 BÚNKER ANALÍTICO v2.1 DESPLEGADO");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* FRANJA DE VERIFICACIÓN (Solo para confirmar que el código cambió) */}
      <div className="bg-emerald-600 text-white text-[9px] font-black text-center py-1 uppercase tracking-[0.4em]">
         Búnker Analítico v2.1 — Conexión Blindada Activa
      </div>

      <main className="p-4 max-w-7xl mx-auto space-y-8">
        
        {/* BANNER DE RECOMENDACIÓN MAESTRA (Inteligencia de Datos) */}
        <div className="bg-slate-900 p-6 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden border-b-8 border-emerald-500">
           <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
           <div className="bg-emerald-500 p-4 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Zap size={32} className="fill-white text-white animate-pulse" />
           </div>
           <div className="text-center md:text-left flex-1 z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Sugerencia del Sistema</p>
              <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none mt-1">Ciclo de Alta Frecuencia Detectado</h2>
              <p className="text-sm font-medium text-slate-300 mt-2">La IA recomienda fijar jugadas en el grupo de "Enjaulados" para {globalLottery.replace('_',' ')}.</p>
           </div>
        </div>

        {/* NAVEGACIÓN PROFESIONAL */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 shadow-inner border border-slate-200 w-full max-w-2xl">
              <TabsTrigger value="ia" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md">Analítica IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md">Explosivos</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md">Matriz</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md">Bóveda</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ia" className="space-y-10">
            {/* AQUÍ CARGA EL PANEL CON CALIENTES, FRÍOS, ENJAULADOS, HORAS Y DÍAS */}
            <HourlyPredictionView lotteryId={globalLottery} onLotteryChange={setGlobalLottery} />
          </TabsContent>

          <TabsContent value="matriz">
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          
          <TabsContent value="explosivo">
            <ExplosiveData lotteryId={globalLottery} />
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER DE ESTADO */}
      <footer className="p-8 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Animalytics Pro — Military Grade Analytics</p>
      </footer>
    </div>
  );
}
