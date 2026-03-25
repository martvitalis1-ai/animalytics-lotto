import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Loader2, Eye, EyeOff, AlertTriangle, MessageCircle } from "lucide-react";
import { checkAccess } from "@/lib/accessControl";
import { toast } from "sonner";
import { AdBanner } from "./AdBanner";
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
    if (!termsAccepted) return toast.error("Acepta los términos");
    if (!cleanCode) return toast.error("Ingresa el código");
    
    setLoading(true);
    if (cleanCode === ADMIN_CODE) { onLogin("admin", cleanCode); setLoading(false); return; }

    try {
      const { valid, role } = await checkAccess(cleanCode);
      if (valid && role) onLogin(role, cleanCode);
      else toast.error("CÓDIGO INVÁLIDO");
    } catch (e) { toast.error("ERROR DE CONEXIÓN"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans antialiased">
      {/* TARJETA UNIFICADA ESTILO BUNKER */}
      <Card className="w-full max-w-md border-4 border-slate-900 rounded-[3rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* ENCABEZADO: PANTALLA DE PUBLICIDAD */}
        <div className="h-48 bg-slate-900 border-b-4 border-slate-900 relative">
           <AdBanner slotId="login" />
           {/* Overlay para que se vea como una pantalla */}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
        </div>

        <CardContent className="p-8 space-y-6">
          {/* LOGO Y TITULO */}
          <div className="flex flex-col items-center -mt-20 relative z-10">
             <div className="bg-white p-2 rounded-full border-4 border-slate-900 shadow-xl">
                <img src={logoAnimalytics} className="h-24 w-24 object-contain" alt="Logo" />
             </div>
             <h1 className="mt-4 font-black text-3xl text-slate-900 italic tracking-tighter uppercase leading-none text-center">
               ANIMALYTICS <span className="text-emerald-500">PRO</span>
             </h1>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Intelligence System</span>
          </div>

          {/* FORMULARIO */}
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Código Maestro / Usuario</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                <Input 
                  type={showCode ? "text" : "password"}
                  placeholder="DIGITE SU ACCESO..."
                  className="pl-12 h-16 border-4 border-slate-900 rounded-2xl font-black text-xl tracking-[0.2em] shadow-inner bg-slate-50 focus:bg-white transition-all"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-4 text-slate-400">
                  {showCode ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
               <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-1 border-2 border-slate-900" />
               <label htmlFor="terms" className="text-[10px] font-black leading-tight text-amber-800 uppercase italic cursor-pointer">
                 Entiendo que esta App ofrece pronósticos estadísticos. Toda jugada es mi responsabilidad.
               </label>
            </div>

            <Button 
              onClick={handleLoginAction}
              disabled={loading || !termsAccepted}
              className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-2xl border-4 border-slate-900 rounded-[2rem] shadow-[0_8px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all uppercase italic"
            >
              {loading ? <Loader2 className="animate-spin" /> : "ACCEDER AHORA 💰"}
            </Button>
          </div>

          <div className="pt-2">
             <Button 
                variant="ghost"
                className="w-full font-black text-xs text-[#24A1DE] uppercase tracking-widest hover:bg-sky-50 rounded-xl"
                onClick={() => window.open("https://t.me/Animalytics", '_blank')}
             >
                <MessageCircle className="mr-2 h-4 w-4" /> ¿Necesitas un código? Soporte VIP
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
