import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen w-full bg-white flex flex-col font-sans antialiased">
      
      {/* 🛡️ 1. PUBLICIDAD A TODO ANCHO (Header) */}
      <div className="w-full h-40 md:h-56 bg-slate-900 relative border-b-4 border-emerald-500 shadow-lg">
         <AdBanner slotId="login" />
         {/* Capa de brillo para que se vea como pantalla LED */}
         <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* 🛡️ 2. CUERPO DE LA APP (Pantalla Completa) */}
      <div className="flex-1 flex flex-col items-center px-8 pt-4 pb-10 max-w-md mx-auto w-full">
        
        {/* LOGO CON OVERLAP REDISEÑADO */}
        <div className="flex flex-col items-center -mt-14 relative z-10">
           <div className="bg-white p-2 rounded-full border-4 border-slate-900 shadow-2xl">
              <img src={logoAnimalytics} className="h-24 w-24 object-contain" alt="Logo" />
           </div>
           <div className="mt-4 text-center">
              <h1 className="font-black text-3xl text-slate-900 italic tracking-tighter uppercase leading-none">
                ANIMALYTICS <span className="text-emerald-500">PRO</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Intelligence System</p>
           </div>
        </div>

        {/* FORMULARIO INTEGRADO EN LA PANTALLA */}
        <div className="w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="font-black text-[11px] uppercase text-slate-400 tracking-widest ml-1">Acceso de Seguridad</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
              <Input 
                type={showCode ? "text" : "password"}
                placeholder="DIGITE SU CÓDIGO..."
                className="pl-12 pr-12 h-16 border-4 border-slate-900 rounded-2xl font-black text-xl tracking-[0.2em] bg-slate-50 focus:bg-white shadow-inner transition-all text-slate-900"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                {showCode ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-3xl bg-amber-50 border-2 border-amber-100 shadow-sm">
             <Checkbox 
              id="terms" 
              checked={termsAccepted} 
              onCheckedChange={(c) => setTermsAccepted(c === true)} 
              className="mt-1 border-2 border-slate-900 w-5 h-5 data-[state=checked]:bg-slate-900" 
             />
             <label htmlFor="terms" className="text-[10px] font-black leading-tight text-amber-900 uppercase italic cursor-pointer select-none">
               Entiendo que esta App ofrece pronósticos estadísticos basados en IA. Toda jugada es responsabilidad del usuario.
             </label>
          </div>

          <Button 
            onClick={handleLoginAction}
            disabled={loading || !termsAccepted}
            className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-2xl border-4 border-slate-900 rounded-[2rem] shadow-[0_8px_0_0_#064e3b] active:translate-y-1 active:shadow-none transition-all uppercase italic"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL BÚNKER 💰"}
          </Button>

          <div className="pt-6 flex justify-center">
            <button 
               className="font-black text-xs text-[#24A1DE] uppercase tracking-[0.2em] hover:underline flex items-center gap-2"
               onClick={() => window.open("https://t.me/Animalytics", '_blank')}
            >
               <MessageCircle size={16} /> SOLICITAR CÓDIGO VIP
            </button>
          </div>
        </div>
      </div>

      {/* Footer decorativo de seguridad */}
      <div className="p-4 text-center">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Secure Encryption 256-bit • Animalytics Pro v4.0</p>
      </div>
    </div>
  );
}
