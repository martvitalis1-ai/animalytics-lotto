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

  const dbId = globalLottery === 'la_granjita' ? 'granjita' : 
               globalLottery === 'el_guacharo' ? 'guacharo' : globalLottery;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-x-hidden">
      
      {/* 🛡️ HEADER MOBILE-OPTIMIZED: ESTÁTICO Y UNIFORME */}
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-3 md:px-10 py-2 shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center w-full md:w-auto justify-between md:justify-start gap-3">
             <div className="flex items-center">
                {/* Logo adaptativo */}
                <img 
                  src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" 
                  className="h-14 md:h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] ml-1" 
                  alt="Logo" 
                />
                
                <div className="flex flex-col ml-3 md:ml-10">
                    <h1 className="font-black text-lg md:text-5xl italic leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                      <span className="text-emerald-400">ANIMALYTICS</span> <span className="text-white">PRO</span>
                    </h1>
                    <span className="text-[7px] md:text-[16px] font-black text-emerald-300 uppercase tracking-[0.2em] md:tracking-[0.35em] mt-1 drop-shadow-md">
                      Bunker Intelligence
                    </span>
                </div>
             </div>

             {/* Logout en mobile arriba a la derecha para ahorrar espacio */}
             <div className="flex md:hidden gap-2">
                <Button variant="ghost" onClick={onLogout} className="text-white p-1 h-8 w-8">
                  <LogOut size={18} />
                </Button>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            <div className="bg-white rounded-lg border-2 border-emerald-500 shadow-md flex-1 md:flex-none">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-full md:w-[220px] h-9 md:h-11 border-none bg-transparent font-black uppercase text-[10px] text-slate-900 focus:ring-0 px-3">
                  <SelectValue placeholder="Lotería" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="border-2 border-slate-900 bg-white shadow-2xl z-[150]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-black text-slate-900 text-[10px] md:text-sm uppercase py-2.5">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')} 
              className="bg-[#229ED9] h-9 px-3 rounded-lg shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <Send size={14} className="fill-white" />
              <span className="text-[10px] font-black hidden xs:inline">VIP</span>
            </Button>

            <Button variant="ghost" onClick={onLogout} className="hidden md:flex text-white p-2 hover:bg-red-500 rounded-full">
              <LogOut size={24} />
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b-2 border-slate-200 sticky top-[110px] md:top-[128px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1">
              {["ia", "explosivo", "deportes", "resultados", "matriz", "guia", "agencias"].map((t) => (
                <TabsTrigger 
                  key={t} 
                  value={t} 
                  className="px-1 py-2 font-black text-[8px] md:text-[12px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent"
                >
                  {t}
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

        <div className="p-2 md:p-6 max-w-7xl mx-auto overflow-hidden">
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados" className="mt-0"><ResultsPanel lotteryId={dbId} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12">
            <FrequencyHeatmap lotteryId={dbId} />
            <SequenceMatrixView lotteryId={dbId} />
          </TabsContent>
          <TabsContent value="explosivo" className="mt-0"><ExplosiveData lotteryId={dbId} /></TabsContent>
          <TabsContent value="deportes" className="mt-0"><SportsView /></TabsContent>
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
