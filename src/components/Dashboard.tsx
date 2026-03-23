import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, Settings, LogOut, Plus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { AdminAgencias } from "./AdminAgencias";
import { ResultsInsert } from "./ResultsInsert";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100">
      {/* HEADER DE ALTO IMPACTO */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-black text-lg uppercase italic tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
              <p className="text-[9px] font-black text-emerald-500/50 tracking-[0.3em]">MILITARY GRADE ANALYTICS</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full transition-all"><LogOut size={20} /></Button>
        </div>
      </header>

      <main className="p-2 md:p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* NAVEGACIÓN RESPONSIVA (FIX FOTO 9) */}
          <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
            <TabsList className="bg-white p-1 rounded-full h-14 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase gap-2">Deportes</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase gap-2">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase gap-2">Matriz</TabsTrigger>
              {isMaster && <TabsTrigger value="admin" className="rounded-full px-4 md:px-6 font-black text-[10px] uppercase bg-slate-900 text-white">+</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMaster} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData /></TabsContent>
          <TabsContent value="matriz" className="space-y-10"><FrequencyHeatmap /><SequenceMatrixView /></TabsContent>
          
          {isMaster && (
            <TabsContent value="admin" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ResultsInsert />
                <AdminAgencias />
              </div>
            </TabsContent>
          )}

          <TabsContent value="deportes">
            <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[3rem] bunker-shadow">
               <Trophy size={48} className="mx-auto mb-4 text-slate-300" />
               <h3 className="font-black uppercase text-xl">Sincronizando Líneas de Las Vegas</h3>
               <p className="text-xs text-slate-400 font-bold uppercase mt-2">Próxima actualización en 15 minutos</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
