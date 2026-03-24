import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Store, Key } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      {/* DISEÑO MEJORADO PARA QUE NO SOBRESALGAN LOS BOTONES */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias'].map((tab: any) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl"><ResultsInsert /></div>}
      
      {adminTab === 'agencias' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4"><Store /> Crear Agencia</h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="font-black text-xs uppercase ml-2">Nombre</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="Nombre" /></div>
              <div className="space-y-2"><label className="font-black text-xs uppercase ml-2">Teléfono</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="Pago móvil" /></div>
              <div className="space-y-2 md:col-span-2"><label className="font-black text-xs uppercase ml-2">Banco</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="Datos de banco" /></div>
              <div className="space-y-2 md:col-span-2"><label className="font-black text-xs uppercase ml-2">Banner Publicidad</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="URL imagen" /></div>
           </div>
           <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white shadow-xl border-b-8 border-emerald-700">Guardar Agencia</Button>
        </div>
      )}
    </div>
  );
}
