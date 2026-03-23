import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, ShieldCheck, Trash2, Lock, Unlock } from "lucide-react";

export function AdminAgencias() {
  const [appCodes, setAppCodes] = useState([
    { id: 1, code: "ADMIN-2026", user: "Principal", status: "active" },
    { id: 2, code: "Socio-Vip", user: "Juan Pérez", status: "blocked" }
  ]);

  return (
    <div className="space-y-12">
      {/* GESTIÓN DE ACCESO A LA APP (NUEVO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-2 mb-6">
          <ShieldCheck /> Control de Acceso a la App
        </h3>
        <div className="flex gap-4 mb-8">
          <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="NUEVO CÓDIGO DE ENTRADA" />
          <Button className="bg-emerald-500 h-14 px-8 rounded-2xl font-black uppercase shadow-lg">Crear Acceso</Button>
        </div>
        <div className="space-y-4">
          {appCodes.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl">
              <div>
                <p className="font-black">{c.code} <span className="text-[10px] text-slate-400 font-bold uppercase ml-2">({c.user})</span></p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className={c.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>
                  {c.status === 'active' ? <Unlock size={20} /> : <Lock size={20} />}
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500"><Trash2 size={20} /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ... (VIP Codes section remains here) */}
    </div>
  );
}
