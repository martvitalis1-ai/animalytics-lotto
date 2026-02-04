import { SportsAnalytics } from "@/components/SportsAnalytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoAnimalytics from "@/assets/logo-animalytics.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SportsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logoAnimalytics} alt="Animalytics" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-black text-lg leading-none">TENDENCIAS DEPORTIVAS</h1>
                <p className="text-xs text-muted-foreground">Análisis Estratégico IA</p>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <SportsAnalytics />
      </main>
    </div>
  );
}
