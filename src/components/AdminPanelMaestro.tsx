import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, Key, Upload, Loader2, Trash2, Edit3, 
  ShieldCheck, Gift, Database, Megaphone, ImageIcon, Lock, Unlock, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOTTERIES } from '@/lib/constants';

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias' | 'publicidad'>('resultados');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE DATOS REALES ---
  const [agencias, setAgencias] = useState<any[]>([]);
  const [adsData, setAdsData] = useState<Record<string, string>>({});
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");

  // --- ESTADOS DE FORMULARIOS AGENCIAS ---
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);
  const [agencyForm, setAgencyForm] = useState({ name: "", phone: "", rif: "", bank: "", ad_image: "" });

  useEffect(() => { 
    if (auth) {
      loadAllData();
    } 
  }, [auth, adminTab]);

  const loadAllData = async () => {
    // Cargar Códigos de Acceso
    const { data: codes } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false });
    setAccessCodes(codes || []);

    // Cargar Agencias
    const { data: ag } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(ag || []);

    // Cargar Publicidad
    const { data: ads } = await supabase.from('ads').select('*');
    const mappedAds = (ads || []).reduce((acc: any, ad: any) => ({ ...acc, [ad.id]: ad.image_url }), {});
    setAdsData(mappedAds);
  };

  // --- LÓGICA DE ACCESOS (REAL) ---
  const handleCreateCode = async () => {
    if (!newCode.trim()) return toast.error("Escribe un código");
    setLoading(true);
    try {
      const { error } = await supabase
        .from('access_codes')
        .insert([{ code: newCode.trim().toUpperCase(), status: 'active', role: 'user' }]);

      if (error) {
        if (error.code === '23505') throw new Error("Este código ya existe");
        throw error;
      }
      
      toast.success("CÓDIGO CREADO");
      setNewCode("");
      loadAllData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleToggleCodeStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await supabase.from('access_codes').update({ status: newStatus }).eq('id', id);
    toast.success(newStatus === 'blocked' ? "CÓDIGO BLOQUEADO" : "CÓDIGO ACTIVADO");
    loadAllData();
  };

  const handleDeleteCode = async (id: number, code: string) => {
    if (code === 'GANADOR2026') return toast.error("No puedes borrar el código maestro");
    if (!confirm("¿Borrar este acceso?")) return;
    await supabase.from('access_codes').delete().eq('id', id);
    toast.success("ACCESO ELIMINADO");
    loadAllData();
  };

  // --- LÓGICA DE PUBLICIDAD ---
  const handleUploadAd = async (slot: string, file: File) => {
    setLoading(true);
    try {
      const fileName = `ads/${slot}-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('ANIMALITOS').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
      await supabase.from('ads').upsert({ id: slot, image_url: urlData.publicUrl });
      toast.success("BANNER ACTUALIZADO");
      loadAllData();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  // --- LÓGICA DE AGENCIAS ---
  const handleSaveAgencia = async () => {
    if (!agencyForm.name || !agencyForm.phone || !agencyForm.rif || !agencyForm.bank) return toast.error("Faltan datos");
    setLoading(true);
    try {
      if (editingAgencyId) await supabase.from('agencies').update(agencyForm).eq('id', editingAgencyId);
      else await supabase.from('agencies').insert([agencyForm]);
      toast.success("AGENCIA GUARDADA");
      setAgencyForm({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setEditingAgencyId(null);
      loadAllData();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
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
      {/* NAVEGACIÓN PRINCIPAL */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2.5 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-5xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias', 'publicidad'].map((tab: any) => (
          <button 
            key={tab} 
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[90px] py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- PESTAÑA ACCESOS (AHORA FUNCIONAL) --- */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4"><ShieldCheck /> CONTROL DE ACCESOS</h3>
           
           <div className="flex gap-3">
              <Input 
                value={newCode} 
                onChange={e => setNewCode(e.target.value.toUpperCase())} 
                className="border-4 border-slate-900 h-14 rounded-xl font-black text-lg" 
                placeholder="NUEVO CÓDIGO" 
              />
              <Button 
                onClick={handleCreateCode} 
                disabled={loading}
                className="bg-emerald-500 h-14 px-8 rounded-xl font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900 uppercase"
              >
                {loading ? "..." : "CREAR"}
              </Button>
           </div>

           <div className="grid gap-3">
              {accessCodes.length > 0 ? accessCodes.map(ac => (
                <div key={ac.id} className={`p-4 border-4 border-slate-900 rounded-2xl flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${ac.status === 'blocked' ? 'opacity-50 grayscale' : ''}`}>
                   <div className="flex flex-col">
                      <span className="font-black text-xl uppercase tracking-tighter">{ac.code}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{ac.status === 'active' ? '● ACTIVO' : '○ BLOQUEADO'}</span>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleCodeStatus(ac.id, ac.status)}
                        className={`p-2 rounded-lg border-2 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${ac.status === 'active' ? 'bg-orange-500' : 'bg-slate-900'}`}
                      >
                        {ac.status === 'active' ? <Lock size={18}/> : <Unlock size={18}/>}
                      </button>
                      <button 
                        onClick={() => handleDeleteCode(ac.id, ac.code)}
                        className="p-2 bg-red-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 size={18}/>
                      </button>
                   </div>
                </div>
              )) : <p className="text-center font-black text-slate-300 uppercase py-10">Cargando accesos...</p>}
           </div>
        </div>
      )}

      {/* Las demás pestañas se mantienen con el código completo que te pasé antes */}
      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 shadow-2xl mx-auto max-w-5xl"><ResultsInsert /></div>}
      {/* ... Resto de pestañas ... */}

    </div>
  );
}
