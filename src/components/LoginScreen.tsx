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
    if (!termsAccepted) {
      toast.error("Debes aceptar los términos");
      return;
    }
    if (!code.trim()) {
      toast.error("Ingresa tu código");
      return;
    }
    setLoading(true);
    try {
      const { valid, role } = await checkAccess(code.toUpperCase().trim());
      if (valid && role) {
        onLogin(role, code.toUpperCase().trim());
      } else {
        toast.error("Código inválido");
      }
    } catch (error) {
      toast.error("Error de red");
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
            <label className="text-xs font-bold uppercase text-muted-foreground">Código de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
              <Input 
                type={showCode ? "text" : "password"}
                className="pl-10 pr-10 h-12 text-lg font-bold tracking-widest uppercase bg-muted/50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLoginAction()}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-3 text-muted-foreground/50">
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} />
            <label htmlFor="terms" className="text-xs text-amber-700 cursor-pointer">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> Acepto los términos de uso.
            </label>
          </div>
          <Button className="w-full h-12 bg-foreground text-background font-black uppercase italic" onClick={handleLoginAction} disabled={loading || !termsAccepted}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENTRAR AL SISTEMA"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
