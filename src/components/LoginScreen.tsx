import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { checkAccess } from "@/lib/accessControl";
import { toast } from "sonner";
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface LoginProps {
  onLogin: (role: string, code: string) => void;
}

export function LoginScreen({ onLogin }: LoginProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleLoginAction = async () => {
    const ADMIN_CODE = "GANADOR2026";
    const cleanCode = code.trim().toUpperCase();

    if (!termsAccepted) {
      toast.error("Debes aceptar los términos de responsabilidad.");
      return;
    }
    if (!cleanCode) {
      toast.error("Ingresa tu código de acceso.");
      return;
    }
    
    setLoading(true);
    
    // Si es el admin, no necesitamos chequear la validez en accessControl
    if (cleanCode === ADMIN_CODE) {
      onLogin("admin", cleanCode);
      setLoading(false);
      return;
    }

    try {
      const { valid, role } = await checkAccess(cleanCode);
      if (valid && role) {
        onLogin(role, cleanCode);
      } else {
        toast.error("CÓDIGO INVÁLIDO O VENCIDO");
      }
    } catch (error) {
      toast.error("ERROR DE CONEXIÓN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 text-left">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-40 h-40 flex items-center justify-center mb-4">
            <img src={logoAnimalytics} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">ANIMALYTICS PRO</h1>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 pb-8 px-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Código de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
              <Input 
                type={showCode ? "text" : "password"}
                placeholder="INGRESA TU CÓDIGO..."
                className="pl-10 pr-10 h-12 text-lg font-bold tracking-widest uppercase bg-muted/50 border-border/50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoginAction()}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-3 text-muted-foreground/50 hover:text-muted-foreground">
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-1" />
            <div className="flex-1 text-[11px] leading-tight font-bold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-600" />
              Entiendo que esta App ofrece <span className="italic underline">pronósticos estadísticos</span> y que los resultados NO están garantizados. 
              Toda jugada es bajo mi <span className="uppercase text-amber-700 dark:text-amber-500">total responsabilidad</span>. No promovemos el vicio del juego; 
              recomendamos jugar con inteligencia, frialdad y mucha moderación.
            </div>
          </div>
          
          <Button 
            className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase italic"
            onClick={handleLoginAction}
            disabled={loading || !termsAccepted}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ENTRAR AL SISTEMA 💰🏁"}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest pt-2">
            Acceso exclusivo para miembros del búnker
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
