import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Unlock } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  const handleAuth = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("ACCESO MAESTRO");
    } else {
      toast.error("CÓDIGO INVÁLIDO");
    }
  };

  if (!auth) {
    return (
      <div className="p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl mt-10 text-white">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="font-black text-2xl uppercase mb-6 italic">Panel Administrativo</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={handleAuth} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-3 mb-8"><Database size={30} /> Insertar Resultados Oficiales</h3>
        <ResultsInsert />
      </div>
      <div className="bg-slate-50 border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 mb-8"><ShieldCheck size={30} /> Gestión de Accesos App y VIP</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4"><p className="font-black text-xs uppercase opacity-50">Acceso App</p><div className="flex gap-2"><Input className="border-2 border-slate-900 h-12" /><Button className="bg-emerald-500 text-white">Crear</Button></div></div>
          <div className="space-y-4"><p className="font-black text-xs uppercase opacity-50">VIP Agencia</p><div className="flex gap-2"><Input className="border-2 border-slate-900 h-12" /><Button className="bg-orange-500 text-white">Generar</Button></div></div>
        </div>
      </div>
    </div>
  );
}
