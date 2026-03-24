import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Trash2, Wallet, CheckCircle2, Lock, RefreshCw, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';

const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
const LOTERIAS = [
  { id: "la_granjita", label: "LA GRANJITA", img: `${IMG_BASE}logo-granjita.png` },
  { id: "lotto_activo", label: "LOTTO ACTIVO", img: `${IMG_BASE}logo-lotto-activo.png` },
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

  // 🛡️ CARGA DE CÓDIGOS (0, 00, 01...)
  const filteredNumbers = useMemo(() => getCodesForLottery(selectedLot), [selectedLot]);

  const horas = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];

  const agregar = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Faltan datos");
    const lotLabel = LOTERIAS.find(l => l.id === selectedLot)?.label || selectedLot;
    setCurrentJugadas([...currentJugadas, { 
        loteria: lotLabel, 
        numero: selectedNum, 
        monto: parseFloat(monto), 
        horas: [...selectedHours] 
    }]);
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Sincronizando Búnker...</div>;

  return (
    <div className="w-full bg-white min-h-screen text-slate-900 pb-40 flex flex-col items-center">
      
      {!forcedAgency && (
        <div className="w-full bg-slate-900 p-6 text-white rounded-b-[3rem] mb-10 flex flex-col items-center shadow-xl">
          <p className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest italic text-center">PASO 1: SELECCIONA TU AGENCIA</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {agencias.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-6 py-3 rounded-2xl font-black text-xs border-2 transition-all ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white scale-105 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {ag.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] w-full grid lg:grid-cols-[1fr_400px] gap-8 px-4">
        <div className="space-y-10">
          
          <Card className="p-8 bg-emerald-600 text-white rounded-[3.5rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase italic text-center mb-6">DATOS DE COBRO PAGO MÓVIL</h2>
            <div className="grid gap-3">
              <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
              <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Teléfono" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
              <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Cédula" className="bg-white/20 border-none text-white h-12 rounded-xl font-black text-center placeholder:text-white/50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LOTERIAS.map(lot => (
                <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedNum(null); }} className={`flex flex-col items-center gap-2 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-xl' : 'border-slate-100'} p-1 overflow-hidden bg-white flex items-center justify-center`}>
                    <img src={lot.img} alt={lot.id} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-center">{lot.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* 🛡️ REJILLA DE SELECCIÓN: ANIMALES GIGANTES Y SIN TEXTO (FOTO 7) */}
          <Card className="p-4 md:p-10 bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-10 px-4">
               <h3 className="font-black uppercase italic text-2xl text-slate-800">Seleccione su Jugada</h3>
               <div className="bg-emerald-500 text-white px-4 py-1 rounded-full font-black text-[10px] animate-pulse">
                  SISTEMA 3D ACTIVO
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
              {filteredNumbers.map(n => (
                <button 
                  key={n} 
                  onClick={() => setSelectedNum(n)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-[3.5rem] border-4 transition-all aspect-square relative group ${
                    selectedNum === n 
                    ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-2xl z-20' 
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <img 
                    src={getAnimalImageUrl(n)} 
                    className="w-full h-full object-contain transition-transform group-hover:rotate-6" 
                    alt={n} 
                  />
                  {selectedNum === n && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-2 border-white shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-white border-4 border-slate-900 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {horas.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`py-3 rounded-xl text-[10px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-200'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl sticky top-24">
            <h4 className="text-center font-black uppercase text-xl border-b-4 border-slate-50 pb-6 mb-8 italic">RESUMEN TICKET</h4>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar mb-10">
              {currentJugadas.map((j, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 relative">
                  <img src={getAnimalImageUrl(j.numero)} className="w-14 h-14 object-contain" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">{j.loteria}</p>
                    <p className="font-black text-sm">Animal: {j.numero} • {j.horas.length} Sorteos</p>
                    <p className="font-black text-lg">Bs {j.monto.toFixed(2)}</p>
                  </div>
                  <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:scale-125 transition-all"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-1 items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                 <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">Monto por Sorteo</span>
                 <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="bg-transparent border-none text-5xl font-black text-center h-auto p-0 focus:ring-0 shadow-none" />
              </div>

              <div className="flex justify-between items-center px-4">
                <span className="font-black text-sm uppercase opacity-40">Total:</span>
                <span className="font-black text-3xl italic text-slate-900 underline decoration-emerald-500 decoration-8 underline-offset-8">
                  {currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs
                </span>
              </div>

              <Button onClick={agregar} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg uppercase shadow-xl mb-4">
                <Plus size={24} className="mr-2" /> Añadir Jugada
              </Button>

              <Button onClick={() => { if (!userPM || !userBanco) return toast.error("¡Faltan datos de pago!"); window.open(msgUrl, '_blank'); }} className={`w-full h-24 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[3rem] font-black text-2xl shadow-xl active:scale-95 ${currentJugadas.length === 0 ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                <Send size={28} className="mr-3" /> ENVIAR JUGADA
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
