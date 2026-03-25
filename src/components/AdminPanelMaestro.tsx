import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Key, Upload, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500 px-2">
      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias'].map((tab: any) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[80px] px-3 py-3 rounded-full font-black text-[9px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4"><ResultsInsert /></div>}
      
      {adminTab === 'agencias' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl md:text-3xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 border-slate-100 pb-4">
             <Store size={32} /> GESTIÓN AGENCIAS
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CAMPO 1: NOMBRE */}
              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600 tracking-tighter">Nombre de la Agencia</label>
                <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg shadow-inner" placeholder="Ej: AGENCIA EL REY" />
              </div>

              {/* CAMPO 2: PAGO MOVIL */}
              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600 tracking-tighter">Número de Pago Móvil</label>
                <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg shadow-inner" placeholder="0412-5555555" />
              </div>

              {/* CAMPO 3: CEDULA */}
              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600 tracking-tighter">Número de Cédula / RIF</label>
                <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg shadow-inner" placeholder="V-12.345.678" />
              </div>

              {/* CAMPO 4: BANCO */}
              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600 tracking-tighter">Banco</label>
                <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg shadow-inner" placeholder="Ej: BANESCO" />
              </div>

              {/* CAMPO 5: CARGAR IMAGEN (NO LINK) */}
              <div className="space-y-3 md:col-span-2">
                <label className="font-black text-sm uppercase ml-2 text-slate-600 tracking-tighter">Publicidad de la Agencia (Imagen)</label>
                <div className="relative group">
                   <Input 
                    type="file" 
                    accept="image/*" 
                    className="border-4 border-dashed border-slate-900 h-32 rounded-3xl font-black cursor-pointer bg-slate-50 file:hidden text-transparent"
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                      <Upload className="text-slate-400 group-hover:text-emerald-500 transition-colors" size={32} />
                      <span className="font-black text-slate-400 uppercase text-xs">Toca para seleccionar o subir imagen publicitaria</span>
                   </div>
                </div>
              </div>
           </div>

           <Button className="w-full h-20 bg-emerald-500 rounded-3xl font-black uppercase text-white shadow-xl border-b-8 border-emerald-700 text-2xl active:scale-95 transition-transform">
             GUARDAR DATOS AGENCIA
           </Button>
        </div>
      )}
    </div>
  );
}
