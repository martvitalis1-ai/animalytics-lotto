import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Key, Upload, Loader2, Trash2, Image as ImageIcon, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias' | 'publicidad'>('resultados');
  const [loading, setLoading] = useState(false);

  // Lógica para subir publicidad
  const handleUploadAd = async (slot: string, file: File) => {
    setLoading(true);
    try {
      const fileName = `ads/${slot}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upError } = await supabase.storage.from('ANIMALITOS').upload(fileName, file);
      if (upError) throw upError;

      const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
      
      const { error: dbError } = await supabase
        .from('ads')
        .upsert({ id: slot, image_url: urlData.publicUrl, updated_at: new Date() });

      if (dbError) throw dbError;
      toast.success(`PUBLICIDAD ${slot.toUpperCase()} ACTUALIZADA`);
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-md mt-20">
        <Key size={50} className="text-emerald-600 mb-4" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40 px-1 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2 rounded-[2.5rem] border-4 border-slate-900 shadow-xl max-w-5xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias', 'publicidad'].map((tab: any) => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 min-w-[80px] py-3 rounded-full font-black text-[9px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105' : 'text-slate-400'}`}>{tab}</button>
        ))}
      </div>

      // Reemplaza la pestaña de PUBLICIDAD en AdminPanelMaestro.tsx con esto:
{adminTab === 'publicidad' && (
  <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-10 max-w-5xl mx-auto animate-in slide-in-from-bottom-4">
     <h3 className="font-black text-2xl md:text-3xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4">
       <Megaphone size={32} /> GESTIÓN DE BANNERS
     </h3>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { id: 'login', label: '1. Banner Inicio (Arriba del Logo)' },
          { id: 'ia', label: '2. Banner Sección IA (Al Final)' },
          { id: 'explosivo', label: '3. Banner Explosivos (Al Final)' },
          { id: 'deportes', label: '4. Banner Deportes (Al Final)' }
        ].map((slot) => (
          <div key={slot.id} className="space-y-3 p-6 border-4 border-slate-900 rounded-[2rem] bg-slate-50 relative">
             <label className="font-black text-xs uppercase text-slate-600">{slot.label}</label>
             
             {/* El Input ahora está encima de todo para que el clic funcione siempre */}
             <div className="relative h-32 w-full border-4 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-white hover:border-emerald-500 transition-all overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-30 w-full h-full" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAd(slot.id, file);
                  }}
                />
                <ImageIcon className="text-slate-300 z-10" size={30} />
                <span className="text-[10px] font-black text-slate-400 uppercase mt-2 z-10 text-center px-2">Click para subir {slot.id}</span>
                
                {loading && (
                  <div className="absolute inset-0 bg-white/90 z-40 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-2" />
                    <span className="text-[8px] font-black uppercase text-emerald-600">Subiendo...</span>
                  </div>
                )}
             </div>
          </div>
        ))}
     </div>
  </div>
)}
      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl"><ResultsInsert /></div>}
      {/* ... resto de las pestañas configuradas antes ... */}
    </div>
  );
}
