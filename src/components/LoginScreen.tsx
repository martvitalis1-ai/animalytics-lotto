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
  onLogin: (role: string) => void;
}

export function LoginScreen({ onLogin }: LoginProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleLogin = async () => {
    if (!termsAccepted) {
      toast.error("Debes aceptar los términos para continuar");
      return;
    }
    
    if (!code.trim()) {
      toast.error("Ingresa un código de acceso");
      return;
    }
    
    setLoading(true);
    
    try {
      const { valid, role } = await checkAccess(code);
      
      if (valid && role) {
        toast.success(role === 'admin' ? "¡Bienvenido Jefe!" : "Acceso Concedido");
        onLogin(role);
      } else {
        toast.error("Código no válido o inactivo");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elevated)] border-0 overflow-hidden">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-40 h-40 flex items-center justify-center mb-4">
            <img 
              src={logoAnimalytics} 
              alt="Animalytics Pro" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            ANIMALYTICS PRO
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sistema de Inteligencia de Lotería
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 pb-8 px-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Código de Acceso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
              <Input 
                type={showCode ? "text" : "password"}
                placeholder="Ingresa tu código..." 
                className="pl-10 pr-10 h-12 text-lg font-bold tracking-widest uppercase bg-muted/50 border-border/50 focus:bg-background"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-3 text-muted-foreground/50 hover:text-muted-foreground"
              >
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Terms and Conditions - MANDATORY */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label 
                htmlFor="terms" 
                className="text-xs text-amber-700 dark:text-amber-400 cursor-pointer leading-relaxed"
              >
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Esta app es de pronósticos estadísticos. Puede haber días buenos o malos. El uso es bajo mi total responsabilidad.
              </label>
            </div>
          </div>
          
          <Button 
            className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            onClick={handleLogin}
            disabled={loading || !termsAccepted}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "ENTRAR AL SISTEMA"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground pt-4">
            Acceso exclusivo para miembros autorizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
