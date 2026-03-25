import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, Key, Upload, Loader2, Trash2, Edit3, 
  ShieldCheck, Gift, Database, Megaphone, ImageIcon, Lock, Unlock 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOTTERIES } from '@/lib/constants';

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias' | 'publicidad'>('resultados');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE DATOS ---
  const [agencias, setAgencias] = useState<any[]>([]);
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newAlias, setNewAlias] = useState("");

  useEffect(() => { 
    if (auth) {
      loadAllData();
    } 
  }, [auth, adminTab]);

  const loadAllData = async () => {
    // Cargar Códigos (Usando is_active como pide tu accessControl.ts)
    const { data: codes } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false });
    setAccessCodes(codes || []);

    const { data: ag } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(ag || []);
  };

  // --- LÓGICA DE ACCESOS (CORREGIDA PARA TU DB) ---
  const handleCreateCode = async () => {
    if (!newCode.trim()) return toast.error("Escribe un código");
    setLoading(true);
    try {
      const { error } = await supabase
        .from('access_codes')
        .insert([{ 
          code: newCode.trim().toUpperCase(), 
          is_active: true, 
          role: 'user',
          alias: newAlias.trim() || null 
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Ese código ya existe");
        throw error;
      }
      
      toast.success("ACCESO CREADO EXITOSAMENTE");
      setNewCode("");
      setNewAlias("");
      loadAllData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async (code: string, currentActive: boolean) => {
    if (code === 'GANADOR2026') return toast.error("No puedes bloquear al maestro");
    await supabase.from('access_codes').update({ is_active: !currentActive }).eq('code', code);
    toast.success(!currentActive ? "ACTIVADO" : "BLOQUEADO");
    loadAllData();
  };

  const handleDeleteCode = async (code: string) => {
    if (code === 'GANADOR2026') return toast.error("Prohibido borrar al maestro");
    if (!confirm(`¿Borrar código ${code}?`)) return;
    await supabase.from('access_codes').delete().eq('code', code);
    toast.success("ELIMINADO");
    loadAllData();
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-md mt-20">
        <Key size={50} className="text-emerald-600 mb-4" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 px-1 animate-in fade-in duration-500">
      {/* NAVEGACIÓN */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2.5 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-5xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias', 'publicidad'].map((tab: any) => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 min-w-[90px] py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105 shadow-lg' : 'text-slate-400 hover:text-white'}`}>{tab}</button>
        ))}
      </div>

      {/* PESTAÑA ACCESOS (REPARADA) */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4"><ShieldCheck /> CONTROL DE ACCESOS</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="border-4 border-slate-900 h-14 rounded-xl font-black text-lg" placeholder="NUEVO CÓDIGO" />
              <Input value={newAlias} onChange={e => setNewAlias(e.target.value)} className="border-4 border-slate-900 h-14 rounded-xl font-black text-lg" placeholder="ALIAS (OPCIONAL)" />
              <Button onClick={handleCreateCode} disabled={loading} className="bg-emerald-500 h-14 rounded-xl font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900 uppercase">
                {loading ? "..." : "CREAR"}
              </Button>
           </div>

           <div className="grid gap-3">
              {accessCodes.map(ac => (
                <div key={ac.code} className={`p-4 border-4 border-slate-900 rounded-2xl flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${!ac.is_active ? 'opacity-40 grayscale' : ''}`}>
                   <div className="flex flex-col">
                      <span className="font-black text-xl uppercase tracking-tighter leading-none">{ac.code}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{ac.alias || 'SIN ALIAS'} | {ac.role}</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleToggleStatus(ac.code, ac.is_active)} className={`p-2 rounded-lg border-2 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${ac.is_active ? 'bg-orange-500' : 'bg-slate-900'}`}>
                        {ac.is_active ? <Lock size={18}/> : <Unlock size={18}/>}
                      </button>
                      <button onClick={() => handleDeleteCode(ac.code)} className="p-2 bg-red-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Trash2 size={18}/>
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Mantener las demás pestañas que ya te funcionan... */}
      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-2xl mx-auto max-w-5xl"><ResultsInsert /></div>}
    </div>
  );
}
