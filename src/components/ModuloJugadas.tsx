import { useState, useEffect } from 'react';
import { getAnimalImageUrl, getCodesForLottery, getAnimalName } from '../lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { getDrawTimesForLottery } from '../lib/constants';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Clock, Wallet, Send, UserCircle, Landmark } from "lucide-react";
import { toast } from "sonner";

export function ModuloJugadas() {
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const [agencias, setAgencias] = useState<any[]>([]);
  const [activeAgency, setActiveAgency] = useState<any>(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [betAmount, setBetAmount] = useState("10");
  const [cart, setCart] = useState<{code: string, amount: string}[]>([]);

  // 🛡️ ESTADOS PARA LOS DATOS DEL USUARIO (PARA COBRAR PREMIO)
  const [userPhone, setUserPhone] = useState("");
  const [userID, setUserID] = useState("");
  const [userBank, setUserBank] = useState("");

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

  // 🛡️ GENERADOR DE MENSAJE WHATSAPP MAESTRO
  const handleSendJugada = () => {
    if (!activeAgency) return toast.error("Seleccione una agencia");
    if (cart.length === 0) return toast.error("Seleccione al menos un animal");
    if (!selectedHour) return toast.error("Seleccione la hora del sorteo");
    if (!userPhone || !userID || !userBank) return toast.error("Complete sus datos de cobro");

    const jugadaStr = cart.map(i => `✅ ${i.code} - ${getAnimalName(i.code)} (${i.amount} Bs.)`).join('%0A');
    const mensaje = `*ANIMALYTICS PRO - TICKET DE JUGADA*%0A%0A` +
      `*AGENCIA:* ${activeAgency.name}%0A` +
      `*LOTERÍA:* ${selectedLottery.toUpperCase()}%0A` +
      `*SORTEO:* ${selectedHour}%0A` +
      `----------------------------%0A` +
      `${jugadaStr}%0A` +
      `----------------------------%0A` +
      `*TOTAL A PAGAR:* ${total} Bs.%0A%0A` +
      `*--- MIS DATOS DE COBRO ---*%0A` +
      `*BANCO:* ${userBank.toUpperCase()}%0A` +
      `*PAGO MÓVIL:* ${userPhone}%0A` +
      `*CÉDULA:* ${userID}%0A%0A` +
      `_Enviado desde Animalytics Pro v4.0_`;

    window.open(`https://wa.me/${activeAgency.phone}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="space-y-10 pb-40 px-2 animate-in fade-in duration-500">
      
      {/* 1. SELECTOR DE AGENCIA */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
         {agencias.map(ag => (
           <button key={ag.id} onClick={() => setActiveAgency(ag)} className={`px-6 py-2 rounded-full font-black uppercase text-xs shrink-0 transition-all ${activeAgency?.id === ag.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
             {ag.name}
           </button>
         ))}
      </div>

      {/* 2. DATOS DE PAGO DE LA AGENCIA */}
      <div className="space-y-3">
         <div className="bg-emerald-500 p-4 rounded-2xl border-b-4 border-emerald-700 flex justify-between items-center shadow-lg">
            <span className="font-black text-slate-900 uppercase text-xs">Pagar a Banco:</span>
            <span className="font-black text-white uppercase text-sm">{activeAgency?.bank || "---"}</span>
         </div>
         <div className="bg-emerald-500 p-4 rounded-2xl border-b-4 border-emerald-700 flex justify-between items-center shadow-lg">
            <span className="font-black text-slate-900 uppercase text-xs">Pago Móvil Agencia:</span>
            <span className="font-black text-white uppercase text-sm">{activeAgency?.phone || "---"}</span>
         </div>
      </div>

      {/* 🛡️ 3. BLOQUE NUEVO: DATOS DEL USUARIO (PARA COBRAR PREMIO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-6">
         <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <UserCircle className="text-pink-500" />
            <h3 className="font-black text-lg uppercase italic text-slate-900">Mis Datos de Cobro (Si Gano)</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Mi Banco</label>
               <Input value={userBank} onChange={(e) => setUserBank(e.target.value)} className="h-12 border-2 border-slate-900 rounded-xl font-black uppercase" placeholder="Ej: BANESCO" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Mi Pago Móvil</label>
               <Input value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="h-12 border-2 border-slate-900 rounded-xl font-black" placeholder="04xx-xxxxxxx" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Mi Cédula</label>
               <Input value={userID} onChange={(e) => setUserID(e.target.value)} className="h-12 border-2 border-slate-900 rounded-xl font-black" placeholder="V-xxxxxxx" />
            </div>
         </div>
      </div>

      {/* 4. CONFIGURACIÓN DE JUGADA */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
            <label className="text-emerald-400 font-black uppercase text-[10px] flex items-center gap-2 tracking-widest"><Clock size={14}/> Elija Sorteo</label>
            <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="w-full h-14 rounded-xl border-4 border-emerald-500 bg-white font-black px-4 uppercase text-slate-900">
               <option value="">Seleccionar Hora</option>
               {drawTimes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
         </div>
         <div className="space-y-2">
            <label className="text-emerald-400 font-black uppercase text-[10px] flex items-center gap-2 tracking-widest"><Wallet size={14}/> Monto por Animal (Bs.)</label>
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="h-14 border-4 border-emerald-500 font-black text-2xl text-center rounded-xl bg-white text-slate-900" />
         </div>
      </div>

      {/* 5. SELECTOR DE LOTERÍAS */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl flex justify-center flex-wrap gap-4">
         {['granjita', 'lotto_activo', 'guacharo', 'guacharito', 'selva_plus', 'lotto_rey'].map(lot => (
           <button key={lot} onClick={() => {setSelectedLottery(lot); setCart([]);}} className={`p-1 rounded-full border-4 transition-all bg-black ${selectedLottery === lot ? 'border-emerald-500 scale-110' : 'border-slate-800 opacity-40'}`}>
              <img src={getLotteryLogo(lot)} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-contain bg-white" />
           </button>
         ))}
      </div>

      {/* 6. GRILLA DE ANIMALES GIGANTES */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-8 shadow-2xl">
         <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {animalCodes.map(code => (
              <div key={code} onClick={() => toggleAnimal(code)} className={`relative flex flex-col items-center p-2 rounded-3xl border-4 transition-all cursor-pointer ${cart.find(i => i.code === code) ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-lg' : 'border-slate-50 bg-white opacity-90'}`}>
                <img src={getAnimalImageUrl(code)} className="w-20 h-20 md:w-32 md:h-32 object-contain" />
              </div>
            ))}
         </div>
      </div>

      {/* 7. TICKET VISUAL CON DATOS DE USUARIO */}
      {cart.length > 0 && (
        <div className="bg-[#FFFCEB] border-4 border-slate-900 rounded-[2rem] p-6 shadow-2xl space-y-4 animate-in zoom-in border-dashed">
           <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-slate-900 font-black uppercase italic"><Ticket /> Resumen del Ticket</div>
           <div className="grid grid-cols-2 text-[10px] font-bold text-slate-500 uppercase gap-2">
              <p>Lotería: <span className="text-slate-900">{selectedLottery.replace('_',' ')}</span></p>
              <p className="text-right">Sorteo: <span className="text-slate-900">{selectedHour || "S/H"}</span></p>
              <p className="col-span-2 border-t pt-2">Beneficiario: <span className="text-slate-900">{userID}</span></p>
              <p className="col-span-2">Pago a: <span className="text-slate-900">{userBank} | {userPhone}</span></p>
           </div>
           <div className="space-y-1 pt-4">
              {cart.map(item => (
                <div key={item.code} className="flex justify-between items-center border-b border-dotted border-slate-300">
                   <span className="font-black text-xs text-slate-700 uppercase">{item.code} {getAnimalName(item.code)}</span>
                   <span className="font-mono font-black text-emerald-600">{item.amount} Bs.</span>
                </div>
              ))}
           </div>
           <div className="flex justify-between items-center pt-2 border-t-4 border-slate-900">
              <span className="font-black text-xl uppercase">Total:</span>
              <span className="font-mono font-black text-2xl text-emerald-600">{total} Bs.</span>
           </div>
        </div>
      )}

      {/* 8. BOTÓN Y PUBLICIDAD */}
      <div className="space-y-6">
         <Button onClick={handleSendJugada} className="w-full h-24 bg-slate-900 text-white rounded-[2rem] font-black text-3xl border-b-8 border-slate-700 active:scale-95 flex items-center justify-center gap-3">
           <Send /> ENVIAR TICKET
         </Button>
         
         {activeAgency?.ad_image && (
           <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src={activeAgency.ad_image} className="w-full h-auto object-cover" alt="Banner" />
           </div>
         )}
      </div>
    </div>
  );
}
