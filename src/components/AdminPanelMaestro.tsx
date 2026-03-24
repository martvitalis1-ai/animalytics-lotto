import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { Database, ShieldCheck, Gift, Image as ImageIcon, Key, Users, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'explosivos'>('resultados');
  
  // 🛡️ Estado para el selector de lotería en Regalos
  const [targetLottery, setTargetLottery] = useState("lotto_activo");

  const handleAuthManual = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("BÚNKER DESBLOQUEADO");
    } else {
      toast.error("CÓDIGO DENEGADO");
    }
  };

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" 
          placeholder="CÓDIGO" 
        />
        <Button 
          onClick={handleAuthManual} 
          className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl border-2 border-slate-900 hover:bg-emerald-600"
        >
          Entrar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      {/* NAVEGACIÓN ADMIN */}
      <div className="flex justify-center gap-4 bg-white p-2 rounded-full border-4 border-slate-900 shadow-xl max-w-2xl mx-auto">
        <button onClick={() => setAdminTab('resultados')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'resultados' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Resultados</button>
        <button onClick={() => setAdminTab('accesos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'accesos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Accesos y VIP</button>
        <button onClick={() => setAdminTab('explosivos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'explosivos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Regalos</button>
      </div>

      {/* 1. SECCIÓN RESULTADOS */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4">
          <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-8 text-slate-800">
            <Database className="text-emerald-500" /> Insertar Sorteos Oficiales
          </h3>
          <ResultsInsert />
        </div>
      )}
      
      {/* 2. SECCIÓN ACCESOS Y VIP (YA NO ESTÁ VACÍA) */}
      {adminTab === 'accesos' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
          {/* Códigos de Inicio de Sesión (APP) */}
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
            <h3 className="font-black text-2xl uppercase italic text-emerald-600 mb-8 flex items-center gap-3">
              <ShieldCheck /> Códigos de Inicio de Sesión (App)
            </h3>
            <div className="flex gap-4 mb-6">
              <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black text-slate-900" placeholder="NUEVO CÓDIGO DE ACCESO" />
              <Button className="bg-emerald-500 h-14 px-10 rounded-2xl font-black uppercase text-white shadow-lg border-2 border-slate-900">Crear</Button>
            </div>
            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex justify-between items-center">
              <p className="font-black text-slate-700 uppercase tracking-widest">ADMIN-2026 (ACTIVO)</p>
              <Trash2 className="text-red-500 cursor-pointer hover:scale-125 transition-all" />
            </div>
          </div>

          {/* Códigos VIP (AGENCIAS) */}
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
            <h3 className="font-black text-2xl uppercase italic text-orange-500 mb-8 flex items-center gap-3">
              <Users /> Gestión de Códigos VIP (Agencias)
            </h3>
            <div className="flex gap-4 mb-6">
              <Input className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" placeholder="NUEVO CÓDIGO VIP" />
              <Button className="bg-orange-500 h-14 px-10 rounded-2xl font-black uppercase text-slate-900 shadow-lg">Generar</Button>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
              <p className="font-black text-orange-400">VIP-SOCIO-01</p>
              <Trash2 className="text-red-400 cursor-pointer hover:scale-125 transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* 3. SECCIÓN EXPLOSIVOS Y REGALOS (CON SELECTOR DE LOTERÍA) */}
      {adminTab === 'explosivos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-50 pb-4 text-pink-600 flex items-center gap-3">
             <Gift /> Configuración de Regalos
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* SELECTOR DE LOTERÍA (NUEVO) */}
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase text-slate-400 ml-2">1. Seleccionar Lotería</label>
                 <Select value={targetLottery} onValueChange={setTargetLottery}>
                    <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black bg-slate-50">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-slate-900">
                       {LOTTERIES.map(l => (
                         <SelectItem key={l.id} value={l.id} className="font-black uppercase">{l.name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>

              {/* INPUT DE ANIMALES */}
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase text-slate-400 ml-2">2. Tres Animales de Regalo</label>
                 <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-xl" placeholder="Ej: 12, 05, 31" />
              </div>

              {/* CARGAR IMAGEN */}
              <div className="md:col-span-2 space-y-4">
                 <label className="font-black text-xs uppercase text-slate-400 ml-2">3. Cargar Pirámide o Mapa</label>
                 <div className="border-4 border-dashed border-slate-100 p-12 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                    <ImageIcon className="text-slate-200 mb-2 group-hover:text-emerald-500 transition-colors" size={50} />
                    <span className="font-black text-xs uppercase text-slate-300 group-hover:text-slate-600">Click para subir imagen (JPG/PNG)</span>
                 </div>
              </div>
           </div>

           <Button className="w-full h-20 bg-emerald-500 hover:bg-emerald-600 rounded-[2.5rem] font-black uppercase text-white text-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-2 border-slate-900">
              Publicar Cambios en {LOTTERIES.find(l => l.id === targetLottery)?.name}
           </Button>
        </div>
      )}
    </div>
  );
}
