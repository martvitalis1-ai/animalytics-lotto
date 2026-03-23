import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  if (!auth) {
    return (
      <div className="p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic text-center">Panel Administrativo</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-14 rounded-2xl font-black text-center text-xl mb-6 w-full max-w-sm text-slate-900" placeholder="CÓDIGO ADMINISTRADOR" />
        <Button onClick={() => pass === 'GANADOR2026' ? setAuth(true) : toast.error("CÓDIGO INVÁLIDO")} className="bg-emerald-500 h-14 px-10 rounded-2xl font-black uppercase text-slate-900">Entrar al Búnker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in zoom-in duration-500">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-2 mb-6"><ShieldCheck /> Control de Acceso App y VIP</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50">Crear Código de Acceso a App</p>
             <div className="flex gap-2"><Input className="bg-slate-800 border-none text-white font-black" /><Button className="bg-emerald-500 text-slate-900">Generar</Button></div>
          </div>
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50">Crear Código VIP Agencia</p>
             <div className="flex gap-2"><Input className="bg-slate-800 border-none text-white font-black" /><Button className="bg-orange-500 text-slate-900">Generar</Button></div>
          </div>
        </div>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-2 mb-6 text-emerald-600"><Gift /> Datos de Regalo y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4 text-slate-900">
              <label className="font-black text-xs uppercase opacity-50">3 Animales de Regalo (Ej: 12, 05, 31)</label>
              <Input className="border-2 border-slate-900 font-black" placeholder="Aparecerán en Explosivos" />
           </div>
           <div className="space-y-4 text-slate-900">
              <label className="font-black text-xs uppercase opacity-50">Cargar Imagen Pirámide / Mapa</label>
              <div className="border-4 border-dashed border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer"><ImageIcon className="text-slate-200" size={32} /></div>
           </div>
        </div>
        <Button className="w-full mt-8 bg-emerald-500 h-14 rounded-2xl font-black uppercase shadow-xl text-white">Guardar Configuración</Button>
      </div>
    </div>
  );
}
