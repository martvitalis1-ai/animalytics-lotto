import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, Key, Upload, Loader2, Trash2, Edit3, 
  ShieldCheck, Gift, Database, Lock, Unlock 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOTTERIES } from '@/lib/constants';

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');
  const [accessCodes, setAccessCodes] = useState<any[]>([]);

  useEffect(() => { if (auth) { loadAccessCodes(); } }, [auth]);

  const loadAccessCodes = async () => {
    // Simulado para visualización
    setAccessCodes([
      { id: 1, code: "GANADOR2026", type: "MAESTRO", status: "active" },
      { id: 2, code: "PRUEBA-01", type: "APP", status: "active" },
      { id: 3, code: "BLOQUEADO-X", type: "APP", status: "blocked" },
    ]);
  };

  if (!auth) {
    return (
      <div className="p-8 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-md mt-20">
        <Key size={50} className="text-emerald-600 mb-4" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-500">
      {/* NAVEGACIÓN TAB: Corregido para móvil */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2 rounded-[2.5rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {(['resultados', 'accesos', 'regalos', 'agencias'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[85px] py-3 rounded-full font-black text-[9px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- ACCESOS CORREGIDOS (IMAGEN 1) --- */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-5 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-4xl mx-auto">
           <h3 className="font-black text-xl md:text-3xl uppercase italic text-emerald-600 flex items-center gap-2 border-b-4 pb-3"><ShieldCheck size={28} /> CÓDIGOS APP</h3>
           
           <div className="flex flex-col xs:flex-row gap-3">
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black text-lg flex-1" placeholder="NUEVO CÓDIGO" />
              <Button className="bg-emerald-500 h-14 px-8 rounded-xl font-black text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">Crear</Button>
           </div>
           
           <div className="space-y-3">
              {accessCodes.map(ac => (
                <div key={ac.id} className={`p-4 border-4 border-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${ac.status === 'blocked' ? 'bg-slate-100 opacity-60' : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                   <div className="flex flex-col">
                      <span className="font-black text-lg md:text-xl tracking-tighter leading-none">{ac.code}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{ac.type} | {ac.status === 'active' ? 'ACTIVO' : 'BLOQUEADO'}</span>
                   </div>
                   {/* 🛡️ BOTONES AJUSTADOS PARA QUE NO SE SALGAN */}
                   <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button className="p-2.5 bg-blue-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Edit3 size={16}/></button>
                      <button className={`p-2.5 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${ac.status === 'active' ? 'bg-orange-500' : 'bg-slate-900'}`}>{ac.status === 'active' ? <Lock size={16}/> : <Unlock size={16}/>}</button>
                      <button className="p-2.5 bg-red-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* RESULTADOS SECCIÓN */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-5 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto">
          <ResultsInsert />
        </div>
      )}

      {/* Otras pestañas aquí... */}
    </div>
  );
}
