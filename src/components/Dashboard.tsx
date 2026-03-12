import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send, ShoppingCart, Ticket, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCodeModal } from "./AdminCodeModal";
import { TodayResults } from "./TodayResults";
import { ResultsInsert } from "./ResultsInsert";
import { ResultsPanel } from "./ResultsPanel";
import { HistoryManager } from "./HistoryManager";
import { AdminUserManagement } from "./AdminUserManagement";
import { HourlyMatrix } from "./HourlyMatrix";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardo } from "./DatoRicardo";
import { RicardoBot } from "./RicardoBot";
import { TrendAnalysis } from "./TrendAnalysis";
import { NotificationCenter } from "./NotificationCenter";
import { ExportTools } from "./ExportTools";
import { QuickPrediction } from "./QuickPrediction";
import { ExplosiveData } from "./ExplosiveData";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { ThemeToggle } from "./ThemeToggle";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { HypothesisAudit } from "./HypothesisAudit";
import { AdminImageUpload } from "./AdminImageUpload";
import { DataMapDisplay } from "./DataMapDisplay";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { SportsAnalytics } from "./SportsAnalytics";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { AdminManualOverrides } from "./AdminManualOverrides";
import { GuiaUso } from "./GuiaUso";
import { AdminAgencias } from "./AdminAgencias";
import { ModuloJugadas } from "./ModuloJugadas";
import { useNavigate } from "react-router-dom";
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
  tenantAgency?: any; // Recibe la agencia del link de afiliado
}

export function Dashboard({ userRole, onLogout, tenantAgency }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ia");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  const TELEGRAM_LINK = "https://t.me/+6zATqXM1ucQzNzEx";

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { count } = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
        if (count) setTotalResults(count);
      } catch (e) { console.error(e); }
    };
    loadCount();
  }, []);

  const handleTabChange = (tab: string) => {
    // Si es Dueño de Agencia, lo dejamos entrar a Admin sin pedir código extra
    if (isAgencyManager && (tab === 'admin')) {
      setActiveTab(tab);
      return;
    }

    // Seguridad para usuarios normales
    if ((tab === 'admin' || tab === 'insertar') && !isMasterAdmin) {
      setPendingTab(tab);
      if (tab === 'admin') setShowAdminModal(true);
      else setShowInsertModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAdminVerified = () => {
    setShowAdminModal(false);
    setShowInsertModal(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-left">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-black text-lg leading-none uppercase italic">
                {tenantAgency ? tenantAgency.nombre : "ANIMALYTICS PRO"}
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">
                {isAgencyManager ? "Panel de Gestión de Banca" : `${totalResults.toLocaleString()}+ sorteos`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open(TELEGRAM_LINK, '_blank')} className="hidden md:flex h-9 bg-[#24A1DE] text-white font-black text-[10px] uppercase italic gap-2 shadow-lg rounded-full px-4 border-none">
              <Send className="w-3.5 h-3.5 fill-white" /> Canal Oficial
            </Button>
            <ThemeToggle />
            <NotificationCenter />
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isMasterAdmin ? 'bg-primary text-primary-foreground' : 'bg-emerald-500 text-white'}`}>
              {isMasterAdmin ? '👑 Jefe Maestro' : isAgencyManager ? '🏦 Dueño de Banca' : 'Usuario'}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-1.5" />IA</TabsTrigger>
            <TabsTrigger value="explosivo"><Flame className="w-4 h-4 mr-1.5" />Explosivo</TabsTrigger>
            <TabsTrigger value="ruleta"><Dices className="w-4 h-4 mr-1.5" />Ruleta</TabsTrigger>
            <TabsTrigger value="resultados"><FileText className="w-4 h-4 mr-1.5" />Resultados</TabsTrigger>
            <TabsTrigger value="jugadas" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
               <ShoppingCart className="w-4 h-4 mr-1.5" /> {tenantAgency ? "Mi Agencia" : "Agencias"}
            </TabsTrigger>
            
            {/* Solo el Maestro Admin ve el botón de Insertar Resultados */}
            {isMasterAdmin && (
              <TabsTrigger value="insertar" className="bg-foreground text-background"><Plus className="w-4 h-4" /></TabsTrigger>
            )}

            {/* El Admin y el Agency Manager ven el botón de Configuración */}
            {(isMasterAdmin || isAgencyManager) && (
              <TabsTrigger value="admin" className="bg-foreground text-background"><Settings className="w-4 h-4" /></TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ia" className="space-y-6">
            <HourlyPredictionView />
            <AIPredictive />
          </TabsContent>

          <TabsContent value="explosivo" className="space-y-6">
            <ExplosiveData />
            {/* Pasamos el nombre personalizado de la agencia al botón del dato */}
            <DatoRicardoSection 
               customName={tenantAgency?.nombre_dato_personalizado || "DATO RICARDO"} 
            />
          </TabsContent>

          <TabsContent value="ruleta" className="space-y-6">
            <UniversalRoulette />
            {/* Mostramos el mapa personalizado si la agencia tiene uno */}
            <DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} />
          </TabsContent>

          <TabsContent value="resultados">
            <ResultsPanel isAdmin={isMasterAdmin} />
          </TabsContent>

          <TabsContent value="jugadas">
            {/* BLOQUEO DE AGENCIA: Si hay tenantAgency, el módulo de jugadas solo mostrará ESA agencia */}
            <ModuloJugadas forcedAgency={tenantAgency} />
          </TabsContent>

          <TabsContent value="insertar" className="max-w-xl mx-auto space-y-4">
            <ResultsInsert onInserted={() => {}} />
            <TodayResults />
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? (
              // VISTA TOTAL DEL JEFE
              <>
                <AdminAgencias />
                <div className="grid gap-4 lg:grid-cols-2"><AdminUserManagement /><AdminImageUpload /></div>
                <AdminManualOverrides /><DatoRicardo /><HistoryManager />
              </>
            ) : (
              // VISTA RESTRINGIDA PARA EL DUEÑO DE AGENCIA
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3">
                   <ShieldAlert className="text-amber-600" />
                   <p className="text-xs font-bold text-amber-700 uppercase">Estás en modo gestión de banca. Solo puedes modificar tus datos operativos.</p>
                </div>
                {/* Aquí le pasaremos el ID de la agencia al componente para que solo edite la suya */}
                <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />
              </div>
            )
            }
          </TabsContent>
        </Tabs>
      </main>
      <AdminCodeModal open={showAdminModal} onClose={() => setShowAdminModal(false)} onSuccess={handleAdminVerified} title="Acceso Maestro" />
      <RicardoBot />
    </div>
  );
}
