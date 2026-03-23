import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Trash2, Wallet, CheckCircle2, Star, Lock, RefreshCw, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
const LOTERIAS = [
  { id: "lotto_activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "la_granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "guacharo", label: "GUÁCHARO", img: `${IMG_BASE}logo-guacharito.png` }, 
  { id: "guacharito", label: "GUACHARITO", img: `${IMG_BASE}logo-guacharo.png` },
  { id: "lotto_rey", label: "LOTTO REY", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "selva_plus", label: "SELVA PLUS", img: `${IMG_BASE}logo-selva-plus.png` },
];

export function ModuloJugadas({ forcedAgency }: { forcedAgency?: any }) {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("lotto_activo"); 
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);
  const [userPM, setUserPM] = useState(localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(localStorage.getItem('u_pm_banco') || "");

  useEffect(() => {
    const init = async () => {
      try {
        if (forcedAgency) setSelectedAgencia(forcedAgency);
        else {
          const { data } = await supabase.from('agencias').select('*').eq('activa', true);
          if (data) setAgencias(data);
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    init();
  }, [forcedAgency]);

  const filteredNumbers = useMemo(() => getCodesForLottery(selectedLot), [selectedLot]);

  const horas = useMemo(() => {
    return ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
  }, []);

  const agregar = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Faltan datos");
    setCurrentJugadas([...currentJugadas, { loteria: selectedLot, numero: selectedNum, monto: parseFloat(monto), horas: [...selectedHours] }]);
    setSelectedNum(null);
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '');
    tlf = tlf.startsWith('58') ? tlf : '58' + tlf.replace(/^0/, '');
    let msg = `SOLICITUD DE JUGADA\nDATOS DE COBRO:\n🏦 BANCO: ${userBanco}\n📞 TLF: ${userPM}\n🆔 CI: ${userCedula}\n\n`;
    currentJugadas.forEach(j => { msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero}\nHoras: ${j.horas.join(", ")}\nBs ${j.monto}\n---\n`; });
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse">CARGANDO MÓDULO...</div>;

  return (
    <div className="w-full bg-white min-h-screen text-slate-900 pb-40 flex flex-col items-center">
      {/* 1. SELECCIÓN AGENCIA */}
      {!forcedAgency && (
        <div className="w-full bg-slate-900 p-6 text-white rounded-b-[3rem] mb-10 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest italic">SELECCIONE AGENCIA</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {agencias.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-6 py-3 rounded-2xl font-black text-xs border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {ag.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] w-full grid lg:grid-cols-[1fr_400px] gap-8 px-4">
        <div className="space-y-8">
          {/* DATOS PAGO */}
          <Card className="p-8 bg-emerald-600 text-white rounded-[3rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase italic text-center mb-6">DATOS DE COBRO PAGO MÓVIL</h2>
            <div className="grid gap-3">
              <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
              <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Teléfono" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
              <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
            </div>
          </Card>

          {/* SELECTOR LOTERIA */}
          <Card className="p-6 bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => setSelectedLot(lot.id)} className={`flex flex-col items-center gap-2 transition-all ${selectedLot === lot.id ? 'scale-110' : 'opacity-30'}`}>
                  <img src={lot.img} className="w-16 h-16 object-contain" alt={lot.label} />
                  <span className="text-[8px] font-black uppercase text-center">{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          // Reemplace la sección de Card de animales en ModuloJugadas.tsx con esto:

<Card className="p-4 md:p-10 bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl">
  <div className="flex justify-between items-center mb-8 px-4">
     <h3 className="font-black uppercase italic text-xl">Seleccione su Jugada</h3>
     <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full font-black text-[10px]">3D VIEWER ACTIVE</span>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-8">
    {filteredNumbers.map(n => (
      <button 
        key={n} 
        onClick={() => setSelectedNum(n)} 
        className={`flex flex-col items-center justify-center p-4 rounded-[3rem] border-4 transition-all aspect-square ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-2xl z-20' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
      >
        <img 
          src={getAnimalImageUrl(n)} 
          className="w-full h-full object-contain drop-shadow-xl" 
          alt={n} 
        />
        <span className="font-black text-2xl mt-2 italic text-slate-900">#{n}</span>
      </button>
    ))}
  </div>
</Card>

          {/* SELECTOR HORAS */}
          <Card className="p-6 bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {horas.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`py-3 rounded-xl text-[10px] font-black border-2 ${selectedHours.includes(h) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* TICKET RESUMEN */}
        <div className="space-y-6">
          <Card className="p-8 bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-center font-black uppercase text-lg border-b-2 pb-4 mb-6">Resumen Ticket</h4>
            <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
              {currentJugadas.map((j, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">{j.loteria}</p>
                    <p className="font-black">#{j.numero} - {j.horas.length} Sorteos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-4 border-double border-slate-900 flex justify-between items-center">
              <span className="font-black uppercase text-xs opacity-50">Total:</span>
              <span className="font-black text-3xl italic underline decoration-emerald-500 underline-offset-8">
                {currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs
              </span>
            </div>
            <Button onClick={() => { if (!userPM || !userBanco) return toast.error("¡Faltan datos de pago!"); window.open(msgUrl, '_blank'); }} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black text-xl shadow-xl mt-8 flex gap-3">
              <Send size={24} /> ENVIAR JUGADA
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
