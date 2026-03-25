import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Loader2, Eye, EyeOff, AlertTriangle, MessageCircle } from "lucide-react";
import { checkAccess } from "@/lib/accessControl";
import { toast } from "sonner";
import { AdBanner } from "./AdBanner"; // 🛡️ Importación del componente de publicidad
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface LoginProps {
  onLogin: (role: string, code: string) => void;
}

export function LoginScreen({ onLogin }: LoginProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const TELEGRAM_SUPPORT_URL = "https://t.me/Animalytics?text=QUIERO%20MI%20CODIGO%20DE%20ACCESO";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-slate-800 overflow-hidden rounded-[2.5rem] bg-white">
        
        {/* 1. PUBLICIDAD ARRIBA (Slot: login) */}
        <div className="w-full border-b-4 border-slate-100 bg-slate-50">
           <AdBanner slotId="login" />
        </div>

        <CardHeader className="text-center pb-2 pt-6">
          {/* 2. LOGO BAJADO (Debajo de la publicidad) */}
          <div className="mx-auto w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-2">
            <img 
              src={logoAnimalytics} 
              alt="Logo" 
              className="w-full h-full object-contain drop-shadow-xl" 
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">ANIMALYTICS PRO</h1>
        </CardHeader>

        <CardContent className="space-y-4 pt-2 pb-8 px-6 md:px-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Código de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
              <Input 
                type={showCode ? "text" : "password"}
                placeholder="INGRESA TU CÓDIGO..."
                className="pl-12 pr-12 h-14 text-lg font-black tracking-widest uppercase bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoginAction()}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-600">
                {showCode ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-100">
            <Checkbox 
              id="terms" 
              checked={termsAccepted} 
              onCheckedChange={(checked) => setTermsAccepted(checked === true)} 
              className="mt-1 border-2 border-amber-400 data-[state=checked]:bg-amber-500" 
            />
            <div className="flex-1 text-[10px] leading-tight font-black text-amber-700 uppercase italic">
              Entiendo que esta App ofrece pronósticos estadísticos. Toda jugada es bajo mi responsabilidad.
            </div>
          </div>
          
          <Button 
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl rounded-2xl border-b-4 border-emerald-800 transition-all active:translate-y-1 active:border-b-0 uppercase italic"
            onClick={handleLoginAction}
            disabled={loading || !termsAccepted}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ENTRAR AL SISTEMA 💰"}
          </Button>

          <div className="pt-2 space-y-3">
             <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-slate-100"></span></div>
                <span className="relative bg-white px-3 text-[9px] font-black text-slate-300 uppercase">¿No tienes acceso?</span>
             </div>
             
             <Button 
                variant="outline"
                className="w-full h-12 border-2 border-[#24A1DE] text-[#24A1DE] hover:bg-[#24A1DE] hover:text-white font-black text-xs uppercase italic gap-2 rounded-xl"
                onClick={() => window.open(TELEGRAM_SUPPORT_URL, '_blank')}
             >
                <MessageCircle className="w-5 h-5" />
                Solicitar código
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
