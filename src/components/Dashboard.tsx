import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { Button } from "./ui/button";

export function Dashboard({ userRole, onLogout }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-8 border-emerald-600 px-4 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-black text-2xl italic uppercase tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-1 border-2 border-emerald-500 shadow-lg">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-48 lg:w-56 h-10 border-none bg-transparent font-black uppercase text-[10px] text-slate-900 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-900 shadow-2xl z-[100]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" /> {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="p-2 md:p-6 max-w-7xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar py-2 -mx-2 px-2 sticky top-[85px] z-40">
            <TabsList className="bg-white p-1 rounded-full h-16 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">Matriz</TabsTrigger>
              {userRole === 'admin' && <TabsTrigger value="admin" className="rounded-full px-5 font-black text-[11px] uppercase bg-slate-900 text-white ml-2">+</TabsTrigger>}
            </TabsList>
          </div>
          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz"><FrequencyHeatmap lotteryId={globalLottery} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
