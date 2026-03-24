import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, FileText, Grid3X3, Settings, LogOut, Send } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* HEADER TIPO APP VIEJA: TODO EN UNA LÍNEA */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
             <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="h-8 md:h-10 w-auto" alt="Logo" />
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* SELECTOR DISCRETO (COMO EL VIDEO) */}
            <div className="bg-white/10 rounded-xl px-2 border border-white/20">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-[140px] md:w-[200px] h-9 border-none bg-transparent font-black uppercase text-[10px] text-white focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-slate-900 bg-white">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-slate-900 text-[10px]">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <a href="https://t.me/" target="_blank" className="bg-sky-500 p-2 rounded-full text-white shadow-lg"><Send size={18} /></a>
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full p-2"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* NAVEGACIÓN LIMPIA */}
        <div className="bg-white border-b-2 border-slate-200 sticky top-[56px] md:top-[64px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <TabsList className="bg-transparent h-12 w-full justify-start md:justify-center overflow-x-auto no-scrollbar flex px-2">
              {[ {id: "ia", label: "IA"}, {id: "explosivo", label: "EXPLOSIVO"}, {id: "deportes", label: "DEPORTES"}, {id: "resultados", label: "RESULTADOS"}, {id: "matriz", label: "MATRIZ"}, {id: "guia", label: "GUÍA"}, {id: "agencias", label: "AGENCIAS"} ].map((t) => (
                <TabsTrigger 
                  key={t.id} 
                  value={t.id} 
                  className="px-5 font-black text-[10px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent"
                >
                  {t.label}
                </TabsTrigger>
              ))}
              {isMaster && <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500"><Settings size={16}/></TabsTrigger>}
            </TabsList>
          </div>
        </div>

        <div className="p-2 md:p-6 max-w-7xl mx-auto">
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo" className="mt-0"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="deportes" className="mt-0"><SportsView /></TabsContent>
          <TabsContent value="resultados" className="mt-0"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12">
            <FrequencyHeatmap lotteryId={globalLottery} />
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          <TabsContent value="guia" className="mt-0"><GuiaUso /></TabsContent>
          <TabsContent value="agencias" className="mt-0"><ModuloJugadas tenantAgency={tenantAgency} /></TabsContent>
          {isMaster && (
  <TabsContent value="admin" className="mt-0">
     <AdminPanelMaestro userRole={userRole} /> 
  </TabsContent>
)}
