import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, ReceiptText, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// --- CONFIGURACIÓN DE LOGOS GITHUB (RUTA EXACTA) ---
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
const ANIMAL_EMOJIS: any = { "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣" };

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
    toast.success("¡Jugada añadida!");
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1); else if (!tlf.startsWith('58')) tlf = '58' + tlf;
    let msg = `SOLICITUD DE JUGADA\n--------------------------\nDATOS: ${userBanco} / ${userPM} / ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => {
      msg += `${j.loteria.toUpperCase()}\nAnimal: ${j.numero} - ${j.animal}\nSorteos: ${j.horas.join(", ")}\nBs ${j.monto} x sorteo\n----------\n`;
    });
    msg += `\nTOTAL A PAGAR: ${currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white text-slate-900">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen text-slate-900 pb-40">
      
      {/* 1. SELECCIÓN DE AGENCIA */}
      <div className="p-4 bg-[#0F172A] text-white shadow-xl rounded-b-[2rem]">
        <p className="text-[9px] font-black uppercase text-emerald-400 mb-3 text-center tracking-[0.3em]">PASO 1: SELECCIONA TU AGENCIA</p>
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center no-scrollbar">
          {agencias.map(ag => (
            <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[11px] transition-all border-2 ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {selectedAgencia?.id === ag.id && <CheckCircle2 size={16} />} {ag.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SELECCIÓN DE LOTERÍA - CORREGIDO */}
      <div className="mt-4 px-4">
        <div className="bg-white p-4 rounded-[2rem] shadow-sm overflow-x-auto flex justify-center no-scrollbar border border-slate-100">
          <div className="flex gap-6 min-w-max px-4">
            {LOTERIAS.map(lot => (
              <button key={lot.id} onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }} className={`flex flex-col items-center gap-2 transition-all ${selectedLot === lot.id ? 'scale-110 opacity-100' : 'opacity-60'}`}>
                <div className={`w-16 h-16 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-lg' : 'border-slate-800'} overflow-hidden bg-black p-1 flex items-center justify-center`}>
                  <img src={lot.img} alt={lot.id} className="w-full h-full object-contain" style={{ filter: 'none' }} crossOrigin="anonymous" onError={(e: any) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/126/126501.png"; }} />
                </div>
                <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">
                   {lot.id === "Lotto Activo" ? "LOTTO ACTIVO" : lot.id.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 p-4 text-center">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-white rounded-[2rem] shadow-xl border-none">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {Object.keys(animalitosAMostrar).map(n => (
                <button key={n} onClick={() => setSelectedNum(n)} className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all h-20 ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'bg-[#F1F5F9] border-transparent text-slate-600'}`}>
                  <span className="text-xl leading-none mb-1">{ANIMAL_EMOJIS[n] || '🎟️'}</span>
                  <span className="text-[12px] font-black text-slate-900 leading-none">{n}</span>
                  <span className="text-[7px] font-bold uppercase truncate w-full text-center mt-1 text-slate-500">{(animalitosAMostrar as any)[n]}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-white rounded-[2rem] shadow-xl border-none">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {horasAMostrar.map(h => (
                <button key={h} onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])} className={`h-12 rounded-xl text-[10px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#F1F5F9] border-transparent text-slate-500'}`}>{h}</button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-8 bg-white rounded-[2.5rem] shadow-2xl border-none space-y-4 text-center">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-40 italic">Monto por Sorteo (Bs)</label>
              <Input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="h-16 text-center text-5xl font-black bg-slate-50 border-none rounded-2xl text-slate-900" />
            </div>
            {selectedAgencia && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500/10 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 uppercase">🏦 AGENCIA: {selectedAgencia.nombre}</p>
                <p className="text-[12px] font-black text-slate-800 uppercase italic mt-1 leading-none">{selectedAgencia.banco_nombre}</p>
              </div>
            )}
            <Button onClick={agregarJugada} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl active:scale-95">
              <Plus size={24} className="mr-2" /> AÑADIR JUGADA
            </Button>
          </Card>

          {/* TICKET VISUAL */}
          <div className="bg-white p-6 font-mono shadow-2xl rounded-[2.5rem] border-t-[14px] border-emerald-600 flex flex-col text-slate-900">
            <h4 className="text-center font-black uppercase text-sm italic border-b pb-2 mb-4">Ticket Virtual</h4>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] no-scrollbar">
              {currentJugadas.map((j, i) => (
                <div key={i} className="border-b pb-2 flex justify-between items-start text-left">
                  <div>
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{j.loteria}</p>
                    <p className="font-black text-sm">#{j.numero} - {j.animal}</p>
                    <p className="text-[8px] text-slate-400 font-bold">{j.horas.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-dashed flex justify-between font-black text-xl italic underline decoration-emerald-500">
              <span>TOTAL:</span>
              <span>{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
            </div>

            {/* BOTÓN ENVIAR - CLON DEL DE ARRIBA */}
            <a 
              href={msgUrl} 
              onClick={() => { localStorage.setItem('u_pm_banco', userBanco); localStorage.setItem('u_pm_tlf', userPM); localStorage.setItem('u_pm_cedula', userCedula); registrarVenta(); }}
              target="_blank" rel="noopener noreferrer"
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center text-center gap-3 mt-6 transition-all active:scale-95"
            >
              <Send size={24} /> ENVIAR A AGENCIA
            </a>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-5 border-t-4 border-emerald-500 flex gap-3 z-[100] shadow-[0_-15px_30px_rgba(0,0,0,0.4)]">
          <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Banco" className="bg-slate-800 border-none text-white font-black h-12 text-xs placeholder:text-slate-500" />
          <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf PM" className="bg-slate-800 border-none text-white font-black h-12 text-xs placeholder:text-slate-500" />
          <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Cédula" className="bg-slate-800 border-none text-white font-black h-12 text-xs placeholder:text-slate-500" />
      </div>
    </div>
  );
}
