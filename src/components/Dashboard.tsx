import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, LogOut, Send } from "lucide-react";
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
      
      {/* 🛡️ HEADER CORREGIDO: SECTOR FIJO SIN EFECTO CORTINA */}
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <img src={LOGO_URL} className="h-10 md:h-16 w-auto object-contain" alt="Logo" />
             <div className="flex flex-col">
                <h1 className="font-black text-lg md:text-3xl italic tracking-tighter text-emerald-400 uppercase leading-none">
                  ANIMALYTICS <span className="text-white">PRO</span>
                </h1>
                <span className="text-[7px] md:text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em] ml-1">Bunker Intelligence</span>
             </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* SELECTOR CENTRADO Y SIN DESPLAZAR CONTENIDO */}
            <div className="bg-white rounded-xl p-0.5 border-2 border-emerald-500 shadow-lg">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-[125px] md:w-[220px] h-8 md:h-10 border-none bg-transparent font-black uppercase text-[10px] md:text-xs text-slate-900 focus:ring-0 px-2">
                  <SelectValue />
                </SelectTrigger>
                {/* position="popper" es CLAVE para evitar que se mueva la app */}
                <SelectContent position="popper" sideOffset={5} className="border-2 border-slate-900 bg-white shadow-2xl z-[150]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-black text-slate-900 text-[10px] md:text-xs uppercase flex items-center gap-2">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')}
              className="bg-[#229ED9] h-8 md:h-11 px-3 md:px-6 rounded-xl text-white font-black uppercase text-[10px] flex items-center gap-1 shadow-lg border-2 border-white/20"
            >
              <Send size={14} className="fill-white" />
              <span className="hidden sm:inline">CANAL VIP</span>
            </Button>

            <Button variant="ghost" onClick={onLogout} className="text-white p-1">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* NAVEGACIÓN DE DOS PISOS PARA MÓVIL */}
        <div className="bg-white border-b-2 border-slate-200 sticky top-[64px] md:top-[88px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1">
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
                  className="px-1 py-2 font-black text-[9px] md:text-[10px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent transition-all"
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
