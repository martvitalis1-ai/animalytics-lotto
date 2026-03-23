import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Lock, Unlock, Plus } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic text-center">Panel Administrativo Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-2xl mb-6 w-full text-slate-900 shadow-inner" placeholder="CÓDIGO DE COMANDO" />
        <Button onClick={() => pass === 'GANADOR2026' ? setAuth(true) : toast.error("ACCESO DENEGADO")} className="bg-emerald-500 hover:bg-emerald-600 h-16 px-12 rounded-2xl font-black uppercase text-slate-900 text-xl shadow-lg w-full">Entrar al Búnker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in zoom-in duration-500">
      {/* 🛡️ CONTROL DE ACCESO APP (FOTO 8) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-2 mb-6"><ShieldCheck /> Control de Acceso a la App</h3>
        <div className="flex gap-4 mb-8">
          <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="CREAR NUEVO CÓDIGO DE ENTRADA" />
          <Button className="bg-emerald-500 h-14 px-8 rounded-2xl font-black uppercase">Crear</Button>
        </div>
        <div className="space-y-3">
          {["ADMIN-2026", "SOCIO-VIP"].map(c => (
            <div key={c} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl shadow-sm">
              <p className="font-black text-slate-700">{c}</p>
              <div className="flex gap-2"><Button size="icon" variant="ghost" className="text-emerald-500"><Unlock /></Button><Button size="icon" variant="ghost" className="text-red-500"><Trash2 /></Button></div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎫 CÓDIGOS VIP AGENCIA (FOTO 6) */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-2 mb-6"><Key /> Gestión Códigos VIP (Agencias)</h3>
        <div className="flex gap-4 mb-6"><Input className="bg-slate-800 border-none text-white font-black h-14 rounded-xl" placeholder="NUEVO CÓDIGO VIP" /><Button className="bg-orange-500 text-slate-900 font-black h-14 px-6 rounded-xl uppercase">Generar VIP</Button></div>
      </div>

      {/* ✍️ INSERTAR RESULTADOS (FOTO 6) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-2 mb-6"><Database /> Insertar Resultados Manuales</h3>
        <ResultsInsert />
      </div>

      {/* 🎁 REGALOS Y PIRÁMIDE (FOTO 8) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-2 mb-6 text-emerald-600"><Gift /> Datos de Regalo y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="font-black text-xs uppercase opacity-50">3 Animales de Regalo (Ej: 12, 05, 31)</label>
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black" />
           </div>
           <div className="space-y-4">
              <label className="font-black text-xs uppercase opacity-50">Cargar Pirámide / Mapa</label>
              <div className="border-4 border-dashed border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><ImageIcon className="text-slate-200" size={32} /></div>
           </div>
        </div>
        <Button className="w-full mt-8 bg-emerald-500 h-14 rounded-2xl font-black uppercase shadow-xl text-white">Actualizar Explosivos</Button>
      </div>
    </div>
  );
}
