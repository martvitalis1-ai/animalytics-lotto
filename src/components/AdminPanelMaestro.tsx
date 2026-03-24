import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, ShieldCheck, Gift, Image as ImageIcon, Key } from "lucide-react";
import { toast } from "sonner";

// 🛡️ AHORA RECIBE EL ROL DESDE EL LOGIN
export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  // Si el usuario es admin, la autenticación interna empieza en TRUE
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'explosivos'>('resultados');

  const handleAuthManual = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("BÚNKER DESBLOQUEADO");
    } else {
      toast.error("CÓDIGO DENEGADO");
    }
  };

  // Pantalla de bloqueo solo si no es el administrador principal
  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-slate-50 rounded-[4rem] border-4 border-slate-900 shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" 
          placeholder="CÓDIGO" 
        />
        <Button 
          onClick={handleAuthManual} 
          className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl border-4 border-slate-900 hover:bg-emerald-600 transition-all"
        >
          Entrar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      <div className="flex justify-center gap-4 bg-white p-2 rounded-full border-4 border-slate-900 shadow-xl max-w-2xl mx-auto">
        <button onClick={() => setAdminTab('resultados')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'resultados' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Resultados</button>
        <button onClick={() => setAdminTab('accesos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'accesos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>VIP</button>
        <button onClick={() => setAdminTab('explosivos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'explosivos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Regalos</button>
      </div>

      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4"><ResultsInsert /></div>}
      
      {adminTab === 'explosivos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-50 pb-4 text-pink-600"><Gift /> Configuración de Regalos</h3>
           <div className="grid md:grid-cols-2 gap-8 text-slate-900">
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase">3 Animales Regalo</label>
                 <Input className="border-4 border-slate-900 h-14 rounded-xl font-black text-slate-900" />
              </div>
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase">Cargar Pirámide</label>
                 <div className="border-4 border-dashed border-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"><ImageIcon className="text-slate-200" size={40} /></div>
              </div>
           </div>
           <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white shadow-xl">Guardar Cambios</Button>
        </div>
      )}
    </div>
  );
}
