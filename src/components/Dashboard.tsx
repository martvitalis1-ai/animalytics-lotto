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

  const LOGO_URL = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png";

  const dbId = globalLottery === 'la_granjita' ? 'granjita' : 
               globalLottery === 'el_guacharo' ? 'guacharo' : globalLottery;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* 🛡️ HEADER CORREGIDO: LOGO ALEJADO DEL BORDE Y LETRAS LEGIBLES */}
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-6 md:px-12 py-2 md:py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          <div className="flex items-center shrink-0">
             {/* LOGO GIGANTE, ALEJADO DEL BORDE Y CON FILTROS DE NITIDEZ */}
             <img 
               src={LOGO_URL} 
               className="h-20 md:h-32 w-auto object-contain drop-shadow-[0_5px_25px_rgba(255,255,255,0.9)] contrast-125 saturate-110 brightness-110 ml-2 md:ml-4" 
               alt="Logo" 
             />
             
             {/* BLOQUE DE TEXTO DESPLAZADO PARA DAR AIRE AL LOGO */}
             <div className="flex flex-col ml-10 md:ml-16">
                <h1 className="font-black text-2xl md:text-5xl italic leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">
                  <span className="text-emerald-400">ANIMALYTICS</span> <span className="text-white">PRO</span>
                </h1>
                
                <span className="text-[10px] md:text-[16px] font-black text-emerald-300 uppercase tracking-[0.35em] mt-2 drop-shadow-md">
                  Bunker Intelligence
                </span>
             </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-md">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-[140px] md:w-[240px] h-11 border-none bg-transparent font-black uppercase text-[10px] md:text-sm text-slate-900 focus:ring-0 px-4">
                  <SelectValue placeholder="Lotería" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="border-2 border-slate-900 bg-white shadow-2xl z-[150]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-black text-slate-900 text-[10px] md:text-sm uppercase py-3">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" onClick={onLogout} className="text-white p-2 hover:bg-red-500 rounded-full transition-colors">
              <LogOut size={28} />
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b-2 border-slate-200 sticky top-[92px] md:top-[132px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto p-1">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1.5">
              {["ia", "explosivo", "deportes", "resultados", "matriz", "guia", "agencias"].map((t) => (
                <TabsTrigger 
                  key={t} 
                  value={t} 
                  className="px-1 py-2.5 font-black text-[9px] md:text-[12px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent transition-all"
                >
                  {t}
                </TabsTrigger>
              ))}
              {isMaster && (
                <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500">
                  <Settings size={20}/>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        <div className="p-2 md:p-6 max-w-7xl mx-auto">
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
