import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Plus } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("ACCESO MAESTRO CONCEDIDO");
    } else {
      toast.error("CÓDIGO INVÁLIDO");
    }
  };

  if (!auth) {
    return (
      <div className="p-20 flex flex-col items-center bg-slate-900 rounded-[4rem] border-4 border-emerald-500 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-white font-black text-2xl uppercase mb-6 italic">Panel Administrativo</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-none h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={handleLogin} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 text-xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 animate-in zoom-in duration-500">
      {/* INSERTAR RESULTADOS (Foto 9) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-8 text-slate-800"><Database /> Insertar Resultados Oficiales</h3>
        <ResultsInsert />
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 mb-8"><ShieldCheck /> Gestión de Códigos VIP</h3>
        <div className="flex gap-4"><Input className="bg-slate-800 border-none text-white font-black h-12" placeholder="NUEVO CÓDIGO VIP" /><Button className="bg-orange-500 text-slate-900 font-black px-8 rounded-xl">CREAR</Button></div>
      </div>
    </div>
  );
}
