import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Database, Gift, Image as ImageIcon, Key, Trash2, Unlock } from "lucide-react";
import { ResultsInsert } from "./ResultsInsert";
import { toast } from "sonner";

export function AdminAgencias() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("BÚNKER DESBLOQUEADO");
    } else {
      toast.error("ACCESO DENEGADO");
    }
  };

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-50 rounded-[4rem] border-4 border-slate-900 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={handleLogin} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 text-xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 animate-in zoom-in duration-500">
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-slate-800 flex items-center gap-3 mb-8"><Database size={30} /> Insertar Resultados Oficiales</h3>
        <ResultsInsert />
      </div>
      <div className="bg-emerald-50 border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic text-emerald-700 flex items-center gap-3 mb-8"><ShieldCheck size={30} /> Gestión de Accesos App y VIP</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50 text-slate-900">Acceso App</p>
             <div className="flex gap-2"><Input className="border-2 border-slate-900 h-12 bg-white" /><Button className="bg-emerald-500 text-white font-black border-2 border-slate-900">Crear</Button></div>
          </div>
          <div className="space-y-4">
             <p className="font-black text-xs uppercase opacity-50 text-slate-900">VIP Agencia</p>
             <div className="flex gap-2"><Input className="border-2 border-slate-900 h-12 bg-white" /><Button className="bg-orange-500 text-white font-black border-2 border-slate-900">Generar</Button></div>
          </div>
        </div>
      </div>
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl space-y-8">
        <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 text-pink-600"><Gift size={30} /> Explosivos: Regalos y Pirámide</h3>
        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50 text-slate-900">3 Animales Regalo</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black text-slate-900" /></div>
           <div className="space-y-4"><label className="font-black text-xs uppercase opacity-50 text-slate-900">Cargar Pirámide</label><div className="border-4 border-dashed border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><ImageIcon className="text-slate-200" size={40} /></div></div>
        </div>
        <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white text-xl border-4 border-slate-900 shadow-xl">Guardar Todo</Button>
      </div>
    </div>
  );
}
