import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { ShieldCheck, Database, Key, Trash2, Edit3, Unlock, Store, Phone, CreditCard, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl border-4 border-slate-900">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      {/* DISEÑO MEJORADO PARA QUE NO SOBRESALGAN LOS BOTONES */}
      <div className="flex flex-wrap justify-center gap-2 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-3xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias'].map((tab: any) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 px-4 py-3 rounded-full font-black text-[10px] md:text-xs uppercase transition-all border-2 ${adminTab === tab ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4"><ResultsInsert /></div>}
      
      {adminTab === 'agencias' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4 space-y-8">
           <h3 className="font-black text-2xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4"><Store /> Gestión de Agencias</h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="font-black text-xs uppercase ml-2">Nombre Agencia</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="EJ: AGENCIA EL REY" /></div>
              <div className="space-y-2"><label className="font-black text-xs uppercase ml-2">Teléfono Pago Móvil</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="0412-5555555" /></div>
              <div className="space-y-2 md:col-span-2"><label className="font-black text-xs uppercase ml-2">Datos Bancarios (Banco, Cédula, etc)</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="BANCO / C.I / TIPO" /></div>
              <div className="space-y-2 md:col-span-2"><label className="font-black text-xs uppercase ml-2">URL Imagen Publicidad (Footer)</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="https://link-de-imagen.jpg" /></div>
           </div>
           <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white shadow-xl text-xl border-b-8 border-emerald-700">Crear Agencia</Button>
        </div>
      )}

      {/* Accesos y Regalos siguen igual pero con el diseño de botones corregido... */}
    </div>
  );
}
