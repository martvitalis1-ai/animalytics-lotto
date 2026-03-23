import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Unlock } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic text-center">Panel Administrativo</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6" placeholder="CÓDIGO" />
        <Button onClick={() => pass === 'GANADOR2026' ? setAuth(true) : toast.error("ACCESO DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl">Entrar al Búnker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 mb-6"><ShieldCheck /> Códigos de Acceso App</h3>
        <div className="flex gap-4 mb-4"><Input className="border-2 border-slate-900 font-black h-12" placeholder="NUEVO CÓDIGO" /><Button className="bg-emerald-500 text-white font-black">Crear</Button></div>
      </div>
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 mb-6"><Key /> Gestión VIP Agencia</h3>
        <div className="flex gap-4"><Input className="bg-slate-800 border-none text-white font-black h-12" placeholder="CÓDIGO VIP" /><Button className="bg-orange-500 text-slate-900 font-black">Generar</Button></div>
      </div>
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl"><h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-6 text-slate-800"><Database /> Resultados Manuales</h3><ResultsInsert /></div>
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl space-y-8">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 text-pink-600"><Gift /> Regalos y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50 text-slate-900">3 Regalos por Lotería</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="Ej: 12, 05, 31" /></div>
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50 text-slate-900">Pirámide / Mapa</label><div className="border-4 border-dashed border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><ImageIcon className="text-slate-200" size={32} /></div></div>
        </div>
        <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white shadow-xl">Guardar Explosivos</Button>
      </div>
    </div>
  );
}
