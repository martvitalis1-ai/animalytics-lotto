import { useState, useEffect } from 'react';
import { getAnimalImageUrl, getCodesForLottery, getAnimalName } from '../lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { getDrawTimesForLottery } from '../lib/constants';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Clock, Wallet, Send } from "lucide-react";

export function ModuloJugadas() {
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const [agencias, setAgencias] = useState<any[]>([]);
  const [activeAgency, setActiveAgency] = useState<any>(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [betAmount, setBetAmount] = useState("10"); // Monto por defecto
  const [cart, setCart] = useState<{code: string, amount: string}[]>([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data } = await supabase.from('agencies').select('*');
      if (data && data.length > 0) {
        setAgencias(data);
        setActiveAgency(data[0]);
      }
    };
    fetchAgencies();
  }, []);

  const animalCodes = getCodesForLottery(selectedLottery);
  const drawTimes = getDrawTimesForLottery(selectedLottery);

  const toggleAnimal = (code: string) => {
    if (cart.find(i => i.code === code)) {
      setCart(cart.filter(i => i.code !== code));
    } else {
      setCart([...cart, { code, amount: betAmount }]);
    }
  };

  const total = cart.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="space-y-10 pb-40 px-2">
      {/* 1. SELECCIÓN DE AGENCIA REAL */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
         {agencias.length > 0 ? agencias.map(ag => (
           <button key={ag.id} onClick={() => setActiveAgency(ag)} className={`px-6 py-2 rounded-full font-black uppercase text-xs shrink-0 transition-all ${activeAgency?.id === ag.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
             {ag.name}
           </button>
         )) : <p className="font-black text-xs text-red-500 uppercase p-2">No hay agencias creadas</p>}
      </div>

      {/* 2. DATOS BANCARIOS DINÁMICOS */}
      <div className="grid gap-3">
         <div className="bg-emerald-500 p-4 rounded-2xl border-b-4 border-emerald-700 flex justify-between items-center shadow-lg">
            <span className="font-black text-slate-900">BANCO:</span>
            <span className="font-black text-white uppercase">{activeAgency?.bank || "---"}</span>
         </div>
         <div className="bg-emerald-500 p-4 rounded-2xl border-b-4 border-emerald-700 flex justify-between items-center shadow-lg">
            <span className="font-black text-slate-900">PAGO MÓVIL:</span>
            <span className="font-black text-white uppercase">{activeAgency?.phone || "---"}</span>
         </div>
         <div className="bg-emerald-500 p-4 rounded-2xl border-b-4 border-emerald-700 flex justify-between items-center shadow-lg">
            <span className="font-black text-slate-900">CÉDULA/RIF:</span>
            <span className="font-black text-white uppercase">{activeAgency?.rif || "---"}</span>
         </div>
      </div>

      {/* 3. CONFIGURACIÓN DE JUGADA (HORA Y MONTO) */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] border-4 border-slate-900 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
            <label className="text-emerald-400 font-black uppercase text-xs flex items-center gap-2"><Clock size={14}/> Elija la Hora del Sorteo</label>
            <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="w-full h-14 rounded-xl border-4 border-emerald-500 bg-white font-black px-4 uppercase">
               <option value="">Seleccionar Hora</option>
               {drawTimes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
         </div>
         <div className="space-y-2">
            <label className="text-emerald-400 font-black uppercase text-xs flex items-center gap-2"><Wallet size={14}/> Monto por Animal (Bs/$) </label>
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="h-14 border-4 border-emerald-500 font-black text-xl text-center rounded-xl" />
         </div>
      </div>

      {/* 4. LOTERÍAS */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl">
         <div className="flex justify-center flex-wrap gap-4">
            {['granjita', 'lotto_activo', 'guacharo', 'guacharito', 'selva_plus', 'lotto_rey'].map(lot => (
              <button key={lot} onClick={() => {setSelectedLottery(lot); setCart([]);}} className={`p-1 rounded-full border-4 transition-all bg-black ${selectedLottery === lot ? 'border-emerald-500 scale-110' : 'border-slate-800 opacity-40'}`}>
                 <img src={getLotteryLogo(lot)} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-contain bg-white" />
              </button>
            ))}
         </div>
      </div>

      {/* 5. ANIMALES */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-8 shadow-2xl">
         <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {animalCodes.map(code => (
              <div key={code} onClick={() => toggleAnimal(code)} className={`relative flex flex-col items-center p-2 rounded-3xl border-4 transition-all cursor-pointer ${cart.find(i => i.code === code) ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-lg' : 'border-slate-50 bg-white'}`}>
                <img src={getAnimalImageUrl(code)} className="w-20 h-20 md:w-32 md:h-32 object-contain" />
              </div>
            ))}
         </div>
      </div>

      {/* 6. TICKET DE LOTERÍA (VISUAL) */}
      {cart.length > 0 && (
        <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[2rem] p-6 shadow-2xl space-y-4 animate-in zoom-in">
           <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-slate-900 font-black uppercase italic"><Ticket /> Resumen del Ticket</div>
           <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Lotería: <span className="text-slate-900">{selectedLottery.replace('_',' ')}</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sorteo: <span className="text-slate-900">{selectedHour || "NO SELECCIONADA"}</span></p>
           </div>
           <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.map(item => (
                <div key={item.code} className="flex justify-between items-center border-b border-dashed border-slate-300 pb-1">
                   <span className="font-black text-sm text-slate-700 uppercase">{item.code} - {getAnimalName(item.code)}</span>
                   <span className="font-mono font-black text-emerald-600">{item.amount} Bs.</span>
                </div>
              ))}
           </div>
           <div className="flex justify-between items-center pt-2 border-t-4 border-slate-900">
              <span className="font-black text-xl uppercase">Total a Pagar:</span>
              <span className="font-mono font-black text-2xl text-emerald-600">{total} Bs.</span>
           </div>
        </div>
      )}

      {/* 7. BOTÓN Y PUBLICIDAD REAL */}
      <div className="space-y-6">
         <Button className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-2xl uppercase border-b-8 border-slate-700 active:scale-95 flex items-center gap-3">
           <Send /> ENVIAR JUGADA
         </Button>
         
         {activeAgency?.ad_image && (
           <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src={activeAgency.ad_image} className="w-full h-auto object-cover" alt="Publicidad Real" />
           </div>
         )}
      </div>
    </div>
  );
}
