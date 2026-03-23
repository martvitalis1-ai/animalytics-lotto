import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, Settings, Plus } from "lucide-react";
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { AdminAgencias } from "./AdminAgencias";
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-8 border-emerald-600 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-black text-2xl italic tracking-tighter text-emerald-400 uppercase">ANIMALYTICS PRO</h1>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={22} /></Button>
        </div>
      </header>

      <main className="p-2 md:p-6 max-w-7xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          
          <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar py-2 -mx-2 px-2 sticky top-[80px] z-40">
            <TabsList className="bg-white p-1 rounded-full h-16 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[11px] uppercase gap-2">Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-6 font-black text-[11px] uppercase gap-2">Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[11px] uppercase gap-2">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[11px] uppercase gap-2">Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2">Guía</TabsTrigger>
              {isMaster && <TabsTrigger value="admin" className="rounded-full px-5 bg-slate-900 text-white ml-2">+</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="ia"><HourlyPredictionView /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMaster} /></TabsContent>
          <TabsContent value="matriz" className="space-y-12"><FrequencyHeatmap /><SequenceMatrixView /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData /></TabsContent>
          
          {isMaster && (
            <TabsContent value="admin" className="space-y-10">
               <div className="grid gap-10 md:grid-cols-2">
                  <ResultsInsert />
                  <AdminAgencias />
               </div>
            </TabsContent>
          )}

          <TabsContent value="deportes">
            <div className="p-20 text-center border-4 border-slate-900 bg-white rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <Trophy size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic text-slate-800">Sincronizando Líneas Deportivas</h3>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
