import { SportsAnalytics } from "@/components/SportsAnalytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoAnimalytics from "@/assets/logo-animalytics.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RicardoBot } from "@/components/RicardoBot";

export default function SportsPage() {
  const navigate = useNavigate();

  // Handle browser back button
  const handleBack = () => {
    navigate('/');
  };

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
                onClick={handleBack}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logoAnimalytics} alt="Animalytics" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-black text-lg leading-none flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  TENDENCIAS DEPORTIVAS
                </h1>
                <p className="text-xs text-muted-foreground">Análisis Estratégico IA</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBack}
                className="hidden sm:flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                Loterías
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <SportsAnalytics />
      </main>

      {/* RicardoBot disponible en deportes */}
      <RicardoBot />
    </div>
  );
}
