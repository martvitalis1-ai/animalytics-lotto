import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, FileText, Settings, LogOut, Send } from "lucide-react";
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

  const LOGO_URL = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* 🛡️ HEADER DE ALTO IMPACTO - SOLO MODIFICADO ESTA SECCIÓN */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          {/* LOGO GIGANTE Y NOMBRE IDENTITARIO */}
          <div className="flex items-center gap-4 shrink-0">
             <img src={LOGO_URL} className="h-12 md:h-16 w-auto object-contain drop-shadow-md" alt="Logo" />
             <div className="flex flex-col">
                <h1 className="font-black text-2xl md:text-3xl italic tracking-tighter text-emerald-400 uppercase leading-none">
                  ANIMALYTICS <span className="text-white">PRO</span>
                </h1>
                <span className="text-[8px] md:text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em] ml-1">Bunker Intelligence</span>
             </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            
            {/* SELECTOR DE LOTERÍA EN BLANCO SÓLIDO (MÁXIMA VISIBILIDAD) */}
            <div className="bg-white rounded-xl p-1 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-[140px] md:w-[220px] h-9 border-none bg-transparent font-black uppercase text-[11px] text-slate-900 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-slate-900 bg-white shadow-2xl z-[100]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-slate-900 text-[11px]">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BOTÓN TELEGRAM GIGANTE - CANAL VIP */}
            <Button
              onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')}
              className="bg-[#229ED9] hover:bg-[#1e8ec5] h-11 px-6 rounded-xl text-white font-black uppercase text-xs flex items-center gap-2 shadow-lg border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={20} className="fill-white" />
              <span className="hidden md:inline">CANAL VIP</span>
            </Button>

            {/* CERRAR SESIÓN */}
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full p-2">
              <LogOut size={24} />
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* NAVEGACIÓN SLIM (INTACTA) */}
        <div className="bg-white border-b-2 border-slate-200 sticky top-[72px] md:top-[88px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <TabsList className="bg-transparent h-12 w-full justify-start md:justify-center overflow-x-auto no-scrollbar flex px-2">
              {[ 
                {id: "ia", label: "IA"}, 
                {id: "explosivo", label: "EXPLOSIVO"}, 
                {id: "deportes", label: "DEPORTES"}, 
                {id: "resultados", label: "RESULTADOS"}, 
                {id: "matriz", label: "MATRIZ"}, 
                {id: "guia", label: "GUÍA"}, 
                {id: "agencias", label: "AGENCIAS"} 
              ].map((t) => (
                <TabsTrigger 
                  key={t.id} 
                  value={t.id} 
                  className="px-5 font-black text-[10px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent transition-all"
                >
                  {t.label}
                </TabsTrigger>
              ))}
              {isMaster && (
                <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500">
                  <Settings size={16}/>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* CONTENIDOS (INTACTOS) */}
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
        </div>
      </Tabs>
    </div>
  );
}
