import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Lock, Unlock } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic text-center">Acceso Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-2xl mb-6 w-full text-slate-900" placeholder="CÓDIGO DE COMANDO" />
        <Button onClick={() => pass === 'GANADOR2026' ? setAuth(true) : toast.error("CÓDIGO ERRÓNEO")} className="bg-emerald-500 h-16 px-12 rounded-2xl font-black uppercase text-slate-900 text-xl shadow-lg w-full">Entrar al Búnker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-2 mb-6"><ShieldCheck /> Control de Acceso App (Foto 8)</h3>
        <div className="flex gap-4 mb-6"><Input className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="NUEVO CÓDIGO" /><Button className="bg-emerald-500 h-14 px-6 rounded-xl font-black uppercase">Crear</Button></div>
        <div className="flex justify-between p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl"><p className="font-black">ADMIN-2026 (PRINCIPAL)</p><div className="flex gap-2"><Unlock className="text-emerald-500"/><Trash2 className="text-red-500"/></div></div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-2 mb-6"><Key /> Gestión VIP Agencia (Foto 6)</h3>
        <div className="flex gap-4"><Input className="bg-slate-800 border-none text-white h-14 rounded-xl" placeholder="CÓDIGO VIP" /><Button className="bg-orange-500 text-slate-900 h-14 px-6 rounded-xl font-black uppercase">Generar</Button></div>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-2 mb-6"><Database /> Resultados Manuales</h3>
        <ResultsInsert />
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-2 mb-6 text-emerald-600"><Gift /> Regalos y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50">3 Animales Regalo</label><Input className="border-4 border-slate-900 h-14 rounded-xl font-black" /></div>
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50">Pirámide / Mapa</label><div className="border-4 border-dashed border-slate-100 p-6 rounded-2xl flex items-center justify-center cursor-pointer"><ImageIcon className="text-slate-200" size={32} /></div></div>
        </div>
        <Button className="w-full mt-8 bg-emerald-500 h-14 rounded-2xl font-black uppercase text-white shadow-xl">Actualizar Explosivos</Button>
      </div>
    </div>
  );
}
