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

  // 🛡️ MAPEO PROFESIONAL SEGÚN TU SQL (SOLUCIONA EL HISTORIAL VACÍO)
  const dbId = globalLottery === 'la_granjita' ? 'granjita' : 
               globalLottery === 'el_guacharo' ? 'guacharo' : 
               globalLottery; // lotto_rey, guacharito, selva_plus ya coinciden

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* HEADER: SIN EFECTO CORTINA */}
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
             <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="h-10 md:h-16 w-auto object-contain" alt="Logo" />
             <div className="flex flex-col">
                <h1 className="font-black text-lg md:text-3xl italic text-emerald-400 uppercase leading-none">ANIMALYTICS <span className="text-white">PRO</span></h1>
                <span className="text-[7px] md:text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em] ml-1">Bunker Intelligence</span>
             </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="bg-white rounded-xl p-0.5 border-2 border-emerald-500">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-[130px] md:w-[240px] h-9 md:h-11 border-none bg-transparent font-black uppercase text-[10px] md:text-xs text-slate-900 focus:ring-0 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="border-2 border-slate-900 bg-white shadow-2xl z-[150]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-black text-[10px] md:text-xs uppercase">
                      <div className="flex items-center gap-2">
                        <div className="bg-black p-0.5 rounded-full ring-1 ring-slate-200">
                           <img src={getLotteryLogo(l.id)} className="w-5 h-5 rounded-full object-contain bg-white" />
                        </div>
                        {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')} className="bg-[#229ED9] h-9 px-3 rounded-xl shadow-lg"><Send size={14} /></Button>
            <Button variant="ghost" onClick={onLogout} className="text-white p-1"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b-2 border-slate-200 sticky top-[68px] md:top-[92px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto p-1">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1">
              {["ia", "explosivo", "deportes", "resultados", "matriz", "guia", "agencias"].map((t) => (
                <TabsTrigger key={t} value={t} className="px-1 py-2 font-black text-[9px] md:text-[10px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent uppercase">{t}</TabsTrigger>
              ))}
              {isMaster && <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500"><Settings size={16}/></TabsTrigger>}
            </TabsList>
          </div>
        </div>

        <div className="p-2 md:p-6 max-w-7xl mx-auto">
          {/* PASAMOS dbId PARA QUE LOS RESULTADOS NO SALGAN VACÍOS */}
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados" className="mt-0"><ResultsPanel lotteryId={dbId} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12"><FrequencyHeatmap lotteryId={dbId} /><SequenceMatrixView lotteryId={dbId} /></TabsContent>
          <TabsContent value="explosivo" className="mt-0"><ExplosiveData lotteryId={dbId} /></TabsContent>
          <TabsContent value="deportes" className="mt-0"><SportsView /></TabsContent>
          <TabsContent value="guia" className="mt-0"><GuiaUso /></TabsContent>
          <TabsContent value="agencias" className="mt-0"><ModuloJugadas tenantAgency={tenantAgency} /></TabsContent>
          {isMaster && <TabsContent value="admin" className="mt-0"><AdminPanelMaestro userRole={userRole} /></TabsContent>}
        </div>
      </Tabs>
    </div>
  );
}
