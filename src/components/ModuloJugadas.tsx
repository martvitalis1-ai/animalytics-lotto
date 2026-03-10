import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, ReceiptText, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// --- CONFIGURACIÓN DE LOGOS GITHUB ---
const IMG_BASE = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";

const LOTERIAS = [
  { id: "Lotto Activo", img: `${IMG_BASE}logo-lotto-activo.png` },
  { id: "La Granjita", img: `${IMG_BASE}logo-granjita.png` },
  { id: "Guácharo Activo", img: `${IMG_BASE}logo-guacharo.png` },
  { id: "Guacharito", img: `${IMG_BASE}logo-guacharito.png` },
  { id: "Lotto Rey", img: `${IMG_BASE}logo-lotto-rey.png` },
  { id: "Selva Plus", img: `${IMG_BASE}logo-selva-plus.png` },
];

// --- DICCIONARIOS OFICIALES ---
const ANIMALS_STANDARD: any = { '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA' };
const ANIMALS_GUACHARO: any = { ...ANIMALS_STANDARD, '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO' };
const ANIMALS_GUACHARITO: any = { ...ANIMALS_GUACHARO, '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };

const HORAS_PUNTO = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
const HORAS_MEDIA = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"];

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("Lotto Activo");
  const [selectedNum, setSelectedNum] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [monto, setMonto] = useState("10");
  const [loading, setLoading] = useState(true);

  const [userPM, setUserPM] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userBanco, setUserBanco] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
        setUserPM(localStorage.getItem('u_pm_tlf') || "");
        setUserCedula(localStorage.getItem('u_pm_cedula') || "");
        setUserBanco(localStorage.getItem('u_pm_banco') || "");
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    init();
  }, []);

  const animalitosAMostrar = useMemo(() => {
    if (selectedLot === "Guacharito") return ANIMALS_GUACHARITO;
    if (selectedLot === "Guácharo Activo") return ANIMALS_GUACHARO;
    return ANIMALS_STANDARD;
  }, [selectedLot]);

  const horasAMostrar = useMemo(() => (selectedLot === "Guacharito" || selectedLot === "Lotto Rey") ? HORAS_MEDIA : HORAS_PUNTO, [selectedLot]);

  const agregarJugada = () => {
    if (!selectedNum || !monto || selectedHours.length === 0) return toast.error("Faltan datos");
    const dic: any = animalitosAMostrar;
    setCurrentJugadas([...currentJugadas, {
      loteria: selectedLot, numero: selectedNum, animal: dic[selectedNum], monto: parseFloat(monto), horas: [...selectedHours]
    }]);
    setSelectedNum(null);
    toast.success("Añadido");
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1); else if (!tlf.startsWith('58')) tlf = '58' + tlf;
    
    // --- MENSAJE PLANO PARA EVITAR RECORTES ---
    let msg = `SOLICITUD DE JUGADA\n--------------------------\n`;
    msg += `DATOS: ${userBanco} / ${userPM} / ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => {
      msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nSorteos: ${j.horas.join(", ")}\nBs ${j.monto} x sorteo\n----------\n`;
    });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs`;
    
    return `https://api.whatsapp.com/send?phone=${tlf}&text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-7xl mx-auto p-2 bg-slate-50 min-h-screen text-slate-900 pb-32">
      
      {/* 1. SELECCIÓN DE AGENCIA */}
      <div className="p-6 bg-slate-950 text-white shadow-2xl rounded-b-[2.5rem] mb-6">
        <p className="text-[10px] font-black uppercase text-emerald-400 mb-4 text-center tracking-widest italic">PASO 1: SELECCIONA TU AGENCIA</p>
        <div className="flex gap-4 overflow-x-auto pb-2 justify-center no-scrollbar">
          {agencias.map(ag => (
            <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[13px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 shadow-lg scale-105' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              {selectedAgencia?.id === ag.id && <CheckCircle2 size={18} />} {ag.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SELECTOR DE LOTERÍA (LOGOS) */}
      <div className="p-4 bg-white shadow-sm mb-6 rounded-[2rem] mx-4 flex justify-center no-scrollbar">
        <div className="flex gap-8 min-w-max px-6 items-center">
          {LOTERIAS.map(lot => (
            <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-2 transition-all ${selectedLot === lot.id ? 'scale-110' : 'opacity-30 grayscale'}`}>
              <div className={`w-20 h-20 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-2xl' : 'border-slate-100'} overflow-hidden bg-slate-50 flex items-center justify-center`}>
                <img src={lot.img} alt={lot.id} className="w-full h-full object-contain p-1" crossOrigin="anonymous" onError={(e: any) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/126/126501.png"; }} />
              </div>
              <span className="text-[11px] font-black uppercase text-slate-700">{lot.id.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white rounded-[2.5rem] shadow-xl border-none">
            <div className="grid grid-cols-5 md:grid-cols-8 gap-3">
              {Object.keys(animalitosAMostrar).map(n => (
                <button key={n} onClick={() => setSelectedNum(n)} className={`flex flex-col items-center p-3 rounded-[1.5rem] border-2 transition-all ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-inner scale-105' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                  <span className="text-[14px] font-black text-slate-900">{n}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-[2.5rem] shadow-xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {horasAMostrar.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-14 rounded-2xl text-[12px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-100 border-transparent text-slate-500'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-8 bg-white rounded-[3rem] shadow-2xl border-none space-y-6 text-center">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase opacity-40 italic">Monto (Bs)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-20 text-center text-6xl font-black bg-slate-100 border-none rounded-[2rem] text-slate-900 shadow-inner" />
            </div>
            {selectedAgencia && (
              <div className="p-5 bg-emerald-50 border-2 border-emerald-500/20 rounded-[1.5rem]">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">🏦 PAGO A: {selectedAgencia.nombre}</p>
                <p className="text-[13px] font-black text-slate-800 uppercase italic">{selectedAgencia.banco_nombre} | {selectedAgencia.banco_telefono}</p>
              </div>
            )}
            <Button onClick={agregarJugada} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2rem] text-xl shadow-xl active:scale-95 transition-all">
              <Plus size={28} className="mr-2" /> AÑADIR JUGADA
            </Button>
          </Card>

          <div className="bg-white p-8 font-mono shadow-2xl rounded-[3rem] border-t-[20px] border-emerald-600 min-h-[500px] flex flex-col text-slate-900">
            <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6">
               <h4 className="font-black uppercase text-xl italic tracking-tighter">Ticket Virtual</h4>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-1">
              {currentJugadas.map((j, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <p className="font-black text-emerald-600 uppercase text-[10px]">{j.loteria}</p>
                    <p className="font-black text-lg italic">{j.numero} - {j.animal}</p>
                    <p className="text-[11px] opacity-40 font-bold uppercase">{j.horas.join(", ")}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-black text-md">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-2 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t-4 border-double border-slate-900 flex justify-between font-black text-4xl italic tracking-tighter decoration-emerald-500 underline decoration-4 mb-10">
              <span>TOTAL:</span>
              <span>{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
            </div>

            {/* BOTÓN ENVIAR: AHORA SÍ IDÉNTICO AL DE ARRIBA */}
            <a 
              href={msgUrl} 
              onClick={() => { localStorage.setItem('u_pm_banco', userBanco); localStorage.setItem('u_pm_tlf', userPM); localStorage.setItem('u_pm_cedula', userCedula); }}
              target="_blank" rel="noopener noreferrer"
              className={`w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center text-center gap-4 transition-all hover:scale-[1.02] active:scale-95 ${msgUrl === "#" ? 'opacity-20 pointer-events-none grayscale' : ''}`}
            >
              <Send size={28} /> ENVIAR A AGENCIA
            </a>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 p-5 border-t-4 border-emerald-500 flex gap-3 z-[100] shadow-[0_-15px_30px_rgba(0,0,0,0.4)]">
          <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Banco" className="bg-slate-800 border-none text-white font-black h-14 text-sm rounded-2xl" />
          <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-slate-800 border-none text-white font-black h-14 text-sm rounded-2xl" />
          <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Cédula" className="bg-slate-800 border-none text-white font-black h-14 text-sm rounded-2xl" />
      </div>
    </div>
  );
}
