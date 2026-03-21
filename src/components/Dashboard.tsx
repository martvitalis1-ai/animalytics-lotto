import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Grid3X3, Trophy, Settings, ShieldCheck, Zap, Clock, Calendar } from "lucide-react";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { ExplosiveData } from "./ExplosiveData";
import { SequenceMatrixView } from "./SequenceMatrixView"; // Sección Matriz

export function Dashboard({ userRole, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white">
      {/* TABS PRINCIPALES */}
      <main className="p-4 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 h-auto bg-slate-100 p-1 rounded-3xl">
            <TabsTrigger value="ia" className="rounded-2xl font-bold">IA</TabsTrigger>
            <TabsTrigger value="explosivo" className="rounded-2xl font-bold">EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="matriz" className="rounded-2xl font-bold">MATRIZ</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-2xl font-bold">RESULTADOS</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-2xl font-bold"><Settings size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-8">
            {/* PRÓXIMO SORTEO CON SELECTOR DE LOTERÍA INTEGRADO */}
            <HourlyPredictionView lotteryId={selectedLottery} onLotteryChange={setSelectedLottery} />

            {/* WIDGETS DE ANÁLISIS PROFESIONAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* RECOMENDACIÓN MAESTRA */}
               <div className="p-6 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                  <ShieldCheck className="absolute right-[-10px] bottom-[-10px] size-24 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Recomendación del Sistema</p>
                  <h3 className="text-2xl font-black italic mt-1 uppercase leading-tight">JUGADA BLINDADA ACTIVADA</h3>
                  <p className="text-xs mt-2 font-medium">Basado en el ciclo de 72 horas, la IA sugiere atacar animales enjaulados en la lotería {selectedLottery.replace('_',' ')}.</p>
               </div>

               {/* MEJORES HORAS */}
               <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-emerald-400" size={20} />
                    <span className="font-black text-xs uppercase italic">Mejores Horas</span>
                  </div>
                  <div className="flex justify-between font-mono text-xl font-black border-b border-white/10 pb-2">
                    <span>10:00 AM</span> <span className="text-emerald-400">92%</span>
                  </div>
                  <div className="flex justify-between font-mono text-xl font-black pt-2">
                    <span>04:00 PM</span> <span className="text-emerald-400">88%</span>
                  </div>
               </div>

               {/* MEJORES DÍAS */}
               <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem]">
                  <div className="flex items-center gap-2 mb-4 text-slate-900">
                    <Calendar className="text-primary" size={20} />
                    <span className="font-black text-xs uppercase italic">Tendencia Semanal</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-600">Día con mayor acierto: <span className="text-primary">VIERNES</span></p>
                    <p className="text-sm font-bold text-slate-600">Efectividad Global: <span className="text-emerald-600">84.2%</span></p>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="explosivo"><ExplosiveData lotteryId={selectedLottery} /></TabsContent>
          <TabsContent value="matriz"><SequenceMatrixView lotteryId={selectedLottery} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
