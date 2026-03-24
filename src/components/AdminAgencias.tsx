import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO DE ACCESO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("ACCESO DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 text-xl shadow-lg">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl text-slate-900">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-8 text-slate-800"><Database size={30} /> Insertar Resultados Oficiales</h3>
        <ResultsInsert />
      </div>
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl text-slate-900 space-y-8">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 text-emerald-600"><Gift size={30} /> Configuración de Regalos y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-4 text-slate-900"><label className="font-black text-xs uppercase opacity-50">3 Animales Regalo</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black text-slate-900" /></div>
           <div className="space-y-4 text-slate-900"><label className="font-black text-xs uppercase opacity-50">Cargar Pirámide</label><div className="border-4 border-dashed border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><ImageIcon className="text-slate-200" size={40} /></div></div>
        </div>
        <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white text-xl shadow-xl">Guardar Cambios</Button>
      </div>
    </div>
  );
}
