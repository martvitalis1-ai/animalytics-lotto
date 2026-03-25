import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Loader2, Eye, EyeOff, MessageCircle } from "lucide-react";
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
    if (!termsAccepted) return toast.error("Acepta los términos de responsabilidad");
    if (!cleanCode) return toast.error("Ingresa el código de acceso");
    
    setLoading(true);
    if (cleanCode === ADMIN_CODE) { onLogin("admin", cleanCode); setLoading(false); return; }

    try {
      const { valid, role } = await checkAccess(cleanCode);
      if (valid && role) onLogin(role, cleanCode);
      else toast.error("CÓDIGO INVÁLIDO O VENCIDO");
    } catch (e) { toast.error("ERROR DE CONEXIÓN"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans antialiased">
      <Card className="w-full max-w-md border-[3px] border-slate-900 rounded-[2.5rem] overflow-hidden bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        
        {/* 🛡️ BANNER PUBLICITARIO COMPACTO Y ESTÉTICO */}
        <div className="h-28 md:h-32 bg-slate-900 relative border-b-[3px] border-slate-900">
           <AdBanner slotId="login" />
           <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        <CardContent className="px-8 pb-10 pt-0 space-y-6">
          {/* LOGO MEJOR POSICIONADO */}
          <div className="flex flex-col items-center -mt-12 relative z-10">
             <div className="bg-white p-1 rounded-full border-[3px] border-slate-900 shadow-xl">
                <img src={logoAnimalytics} className="h-20 w-20 object-contain" alt="Logo" />
             </div>
             <div className="mt-3 text-center">
                <h1 className="font-black text-2xl text-slate-900 italic tracking-tighter uppercase leading-none">
                  ANIMALYTICS <span className="text-emerald-500">PRO</span>
                </h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Intelligence System</p>
             </div>
          </div>

          {/* FORMULARIO PROFESIONAL */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-black text-[9px] uppercase text-slate-400 tracking-widest ml-1">Acceso de Seguridad</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type={showCode ? "text" : "password"}
                  placeholder="DIGITE SU CÓDIGO..."
                  className="pl-12 pr-12 h-14 border-[3px] border-slate-900 rounded-2xl font-black text-lg tracking-[0.15em] bg-slate-50 focus:bg-white shadow-inner transition-all"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
               <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(c) => setTermsAccepted(c === true)} 
                className="mt-0.5 border-2 border-slate-900 data-[state=checked]:bg-slate-900" 
               />
               <label htmlFor="terms" className="text-[8px] font-black leading-tight text-amber-900 uppercase italic cursor-pointer select-none">
                 Entiendo que esta App ofrece pronósticos estadísticos. Toda jugada es responsabilidad del usuario.
               </label>
            </div>

            <Button 
              onClick={handleLoginAction}
              disabled={loading || !termsAccepted}
              className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xl border-[3px] border-slate-900 rounded-2xl shadow-[0_5px_0_0_#064e3b] active:translate-y-1 active:shadow-none transition-all uppercase italic"
            >
              {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL BÚNKER 💰"}
            </Button>
          </div>

          <button 
             className="w-full font-black text-[9px] text-[#24A1DE] uppercase tracking-[0.15em] hover:underline flex items-center justify-center gap-2"
             onClick={() => window.open("https://t.me/Animalytics", '_blank')}
          >
             <MessageCircle size={14} /> SOLICITAR CÓDIGO VIP
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
