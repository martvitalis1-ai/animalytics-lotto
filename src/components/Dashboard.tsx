import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, Flame, Dices, FileText, ShoppingCart, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { DataMapDisplay } from "./DataMapDisplay";
import { ResultsPanel } from "./ResultsPanel";
import { ModuloJugadas } from "./ModuloJugadas";
import { AdminAgencias } from "./AdminAgencias";
import { ThemeToggle } from "./ThemeToggle";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <h1 className="font-black text-lg uppercase italic">{tenantAgency?.nombre || "ANIMALYTICS PRO"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {isMasterAdmin ? '👑 MASTER' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut size={18} /></Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 justify-center rounded-2xl">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="explosivo">EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="ruleta">RULETA</TabsTrigger>
            <TabsTrigger value="resultados">RESULTADOS</TabsTrigger>
            <TabsTrigger value="jugadas">AGENCIAS</TabsTrigger>
            {(isMasterAdmin || isAgencyManager) && <TabsTrigger value="admin"><Settings size={16}/></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><DatoRicardoSection agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? <AdminAgencias /> : <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
