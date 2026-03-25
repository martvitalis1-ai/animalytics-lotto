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
      <Card className="w-full max-w-md border-4 border-slate-900 rounded-[2.5rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)]">
        
        {/* 🛡️ BANNER PUBLICITARIO: MÁS PEQUEÑO Y ESTÉTICO */}
        <div className="p-3 bg-slate-100">
           <div className="h-32 md:h-36 w-full bg-slate-900 rounded-[1.5rem] overflow-hidden border-2 border-slate-200 shadow-inner relative">
              <AdBanner slotId="login" />
              {/* Reflejo de cristal para estética */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
           </div>
        </div>

        <CardContent className="px-8 pb-10 space-y-6">
          {/* LOGO CON OVERLAP SUAVE */}
          <div className="flex flex-col items-center -mt-12 relative z-10">
             <div className="bg-white p-1.5 rounded-full border-4 border-slate-900 shadow-2xl">
                <img src={logoAnimalytics} className="h-20 w-20 object-contain" alt="Logo" />
             </div>
             <div className="mt-4 text-center">
                <h1 className="font-black text-3xl text-slate-900 italic tracking-tighter uppercase leading-none">
                  ANIMALYTICS <span className="text-emerald-500 font-black">PRO</span>
                </h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">Intelligence System</p>
             </div>
          </div>

          {/* FORMULARIO */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Acceso de Seguridad</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                <Input 
                  type={showCode ? "text" : "password"}
                  placeholder="DIGITE SU CÓDIGO..."
                  className="pl-12 h-16 border-4 border-slate-900 rounded-2xl font-black text-lg tracking-[0.15em] bg-slate-50 focus:bg-white shadow-inner"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-4 text-slate-400">
                  {showCode ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-100">
               <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-0.5 border-2 border-slate-900" />
               <label htmlFor="terms" className="text-[9px] font-black leading-tight text-amber-800 uppercase italic cursor-pointer">
                 Entiendo que esta App ofrece pronósticos estadísticos. Toda jugada es responsabilidad del usuario.
               </label>
            </div>

            <Button 
              onClick={handleLoginAction}
              disabled={loading || !termsAccepted}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-black text-xl border-4 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all uppercase italic"
            >
              {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL BÚNKER 💰"}
            </Button>
          </div>

          <button 
             className="w-full font-black text-[10px] text-[#24A1DE] uppercase tracking-widest hover:underline flex items-center justify-center gap-2"
             onClick={() => window.open("https://t.me/Animalytics", '_blank')}
          >
             <MessageCircle size={14} /> ¿SIN CÓDIGO? SOLICITAR AQUÍ
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
