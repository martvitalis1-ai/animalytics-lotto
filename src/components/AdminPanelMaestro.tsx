// src/components/AdminPanelMaestro.tsx
import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [targetLot, setTargetLot] = useState("lotto_activo");

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-50 rounded-[4rem] border-4 border-slate-900 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel de Comando Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("ACCESO DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl border-4 border-slate-900">Entrar al Búnker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-3 mb-8"><Database size={30} /> Insertar Resultados</h3>
        <ResultsInsert />
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-8 text-emerald-600"><Gift size={30} /> Configuración de Regalos por Lotería</h3>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="font-black text-xs uppercase opacity-50">1. Seleccionar Lotería</label>
              <Select value={targetLot} onValueChange={setTargetLot}>
                <SelectTrigger className="border-4 border-slate-900 h-14 rounded-xl font-black"><SelectValue /></SelectTrigger>
                <SelectContent>{LOTTERIES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
           </div>
           <div className="space-y-4">
              <label className="font-black text-xs uppercase opacity-50">2. Tres Animales de Regalo</label>
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Ej: 12, 05, 31" />
           </div>
        </div>
        <Button className="w-full mt-8 h-14 bg-emerald-500 rounded-xl font-black uppercase text-white shadow-xl">Guardar en {targetLot}</Button>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 mb-8"><ShieldCheck size={30} /> Control de Accesos App</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50">Crear Acceso App</p>
             <div className="flex gap-2"><Input className="bg-slate-800 border-none text-white font-black h-12" /><Button className="bg-emerald-500 text-white font-black">Crear</Button></div>
          </div>
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50">Crear VIP Agencia</p>
             <div className="flex gap-2"><Input className="bg-slate-800 border-none text-white font-black h-12" /><Button className="bg-orange-500 text-white font-black">Generar</Button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
