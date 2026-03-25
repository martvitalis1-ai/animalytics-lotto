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
      
      {/* 🛡️ BANNER SUPERIOR: ALTURA OPTIMIZADA PARA PC Y MÓVIL */}
      <div className="w-full h-44 md:h-80 bg-black relative border-b-4 border-emerald-500 shadow-xl overflow-hidden">
         <AdBanner slotId="login" />
         {/* Brillo sutil de pantalla */}
         <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* CUERPO DE LA APP */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-10 max-w-md mx-auto w-full">
        
        {/* LOGO POSICIONADO PROFESIONALMENTE */}
        <div className="flex flex-col items-center -mt-16 md:-mt-24 relative z-10">
           <div className="bg-white p-1.5 rounded-full border-[3px] border-slate-900 shadow-2xl">
              <img src={logoAnimalytics} className="h-20 w-20 md:h-32 md:w-32 object-contain" alt="Logo" />
           </div>
           <div className="mt-4 text-center">
              <h1 className="font-black text-2xl md:text-3xl text-slate-900 italic tracking-tighter uppercase leading-none">
                ANIMALYTICS <span className="text-emerald-500">PRO</span>
              </h1>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">Intelligence System</p>
           </div>
        </div>

        {/* FORMULARIO */}
        <div className="w-full space-y-5 mt-10">
          <div className="space-y-1.5">
            <label className="font-black text-[10px] uppercase text-slate-400 tracking-widest ml-1">Acceso de Seguridad</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input 
                type={showCode ? "text" : "password"}
                placeholder="DIGITE SU CÓDIGO..."
                className="pl-12 pr-12 h-14 border-[3px] border-slate-900 rounded-2xl font-black text-lg tracking-[0.15em] bg-slate-50 focus:bg-white shadow-inner transition-all text-slate-900"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                {showCode ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-3xl bg-amber-50 border border-amber-200">
             <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(c) => setTermsAccepted(c === true)} 
                className="mt-0.5 border-2 border-slate-900 data-[state=checked]:bg-slate-900" 
             />
             <label htmlFor="terms" className="text-[9px] font-black leading-tight text-amber-900 uppercase italic cursor-pointer select-none">
               Entiendo que esta App ofrece pronósticos estadísticos basados en IA. Toda jugada es responsabilidad del usuario.
             </label>
          </div>

          <Button 
            onClick={handleLoginAction}
            disabled={loading || !termsAccepted}
            className="w-full h-16 md:h-20 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xl border-[3px] border-slate-900 rounded-2xl shadow-[0_5px_0_0_#064e3b] active:translate-y-1 active:shadow-none transition-all uppercase italic"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL BÚNKER 💰"}
          </Button>

          <div className="pt-4 flex justify-center">
            <button 
               className="font-black text-[10px] text-[#24A1DE] uppercase tracking-[0.2em] hover:underline flex items-center gap-2"
               onClick={() => window.open("https://t.me/Animalytics", '_blank')}
            >
               <MessageCircle size={14} /> SOLICITAR CÓDIGO VIP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
