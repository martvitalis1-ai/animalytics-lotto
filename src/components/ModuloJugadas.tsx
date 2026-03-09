import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Wallet, Landmark, Clock, ReceiptText, Plus, Info } from "lucide-react";
import { toast } from "sonner";

// --- DICCIONARIOS OFICIALES (BLINDADOS) ---
const ANIMALS_STANDARD = { '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA' };
const ANIMALS_GUACHARO = { ...ANIMALS_STANDARD, '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO' };
const ANIMALS_GUACHARITO = { ...ANIMALS_GUACHARO, '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO' };
const ANIMAL_EMOJIS: any = { "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣" };

const LOTERIAS = [
  { id: "Lotto Activo", img: "https://i.ibb.co/60H6Vf8/lotto.png" },
  { id: "La Granjita", img: "https://i.ibb.co/VgnfKyk/granjita.png" },
  { id: "Guácharo Activo", img: "https://i.ibb.co/YyYf7Hw/guacharo.png" },
  { id: "Guacharito", img: "https://i.ibb.co/vXy05p0/guacharito.png" },
  { id: "Lotto Rey", img: "https://i.ibb.co/p37pQG4/lotto-rey.png" },
  { id: "Selva Plus", img: "https://i.ibb.co/N2LhF6q/selva-plus.png" },
];

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

  // Estados de usuario
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

  const horasAMostrar = useMemo(() => {
    return (selectedLot === "Guacharito" || selectedLot === "Lotto Rey") ? HORAS_MEDIA : HORAS_PUNTO;
  }, [selectedLot]);

  const agregarJugada = () => {
    if (!selectedLot || !selectedNum || !monto || selectedHours.length === 0) return toast.error("Datos incompletos");
    
    const dic: any = animalitosAMostrar;
    const nueva = {
      loteria: selectedLot,
      numero: selectedNum,
      animal: dic[selectedNum] || "Animal",
      emoji: ANIMAL_EMOJIS[selectedNum] || "🎟️",
      monto: parseFloat(monto),
      horas: [...selectedHours]
    };

    setCurrentJugadas([...currentJugadas, nueva]);
    setSelectedNum(null);
    toast.success("Añadido");
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1); else if (!tlf.startsWith('58')) tlf = '58' + tlf;

    let msg = `*SOLICITUD DE JUGADA*\n--------------------------\n`;
    msg += `*DATOS:* ${userBanco} / ${userPM} / ${userCedula}\n--------------------------\n\n`;
    currentJugadas.forEach(j => {
      msg += `*${j.loteria.toUpperCase()}*\n*${j.numero} - ${j.animal}* ${j.emoji}\nSorteos: ${j.horas.join(", ")}\nMonto: ${j.monto} Bs\n----------\n`;
    });
    const total = currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0);
    msg += `\n*TOTAL A PAGAR: ${total.toFixed(2)} Bs*`;
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white text-slate-900">SINCRONIZANDO BÚNKER...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 bg-slate-50 min-h-screen text-slate-900 pb-24">
      
      {/* 1. SELECCIÓN DE LOTERÍA (ICONOS) */}
      <div className="p-4 bg-white border-b overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {LOTERIAS.map(lot => (
            <button 
              key={lot.id} 
              onClick={() => { setSelectedLot(lot.id); setSelectedHours([]); setSelectedNum(null); }}
              className={`flex flex-col items-center gap-1 transition-all ${selectedLot === lot.id ? 'scale-105 opacity-100' : 'opacity-40 grayscale'}`}
            >
              <div className={`w-14 h-14 rounded-full border-4 ${selectedLot === lot.id ? 'border-emerald-500 shadow-md' : 'border-slate-100'} overflow-hidden bg-slate-50`}>
                <img src={lot.img} alt={lot.id} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-black uppercase">{lot.id.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 p-4">
        
        <div className="lg:col-span-2 space-y-4">
          
          {/* GRILLA DE ANIMALITOS (VISUAL) */}
          <Card className="p-4 bg-white rounded-[2rem] shadow-xl border-none">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2">Selecciona Animalito:</p>
            <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
              {Object.keys(animalitosAMostrar).map(n => (
                <button 
                  key={n}
                  onClick={() => setSelectedNum(n)}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all ${selectedNum === n ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105' : 'border-slate-50 bg-slate-50 text-slate-600'}`}
                >
                  <span className="text-xl mb-1">{ANIMAL_EMOJIS[n] || '🎟️'}</span>
                  <span className="text-[10px] font-black">{n}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* HORARIOS */}
          <Card className="p-4 bg-white rounded-[2rem] shadow-xl border-none">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2">Selecciona Sorteos:</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {horasAMostrar.map(h => (
                <button 
                  key={h}
                  onClick={() => setSelectedHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])}
                  className={`h-11 rounded-xl text-[10px] font-black border-2 transition-all ${selectedHours.includes(h) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-transparent text-slate-400'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          
          {/* MONTO Y ACCIÓN */}
          <Card className="p-6 bg-white rounded-[2rem] shadow-2xl border-none space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Monto por Sorteo (Bs)</label>
              <Input 
                type="number" 
                value={monto} 
                onChange={e => setMonto(e.target.value)} 
                className="h-14 text-center text-4xl font-black bg-slate-100 border-none rounded-2xl text-slate-900" 
              />
            </div>
            
            {/* DATOS PAGO AGENCIA SELECCIONADA */}
            {selectedAgencia && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500/20 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-emerald-600 uppercase">🏦 Pago Agencia: <span className="text-slate-900">{selectedAgencia.nombre}</span></p>
                <p className="text-[10px] font-bold text-slate-700 uppercase italic">
                  {selectedAgencia.banco_nombre} | {selectedAgencia.banco_telefono}
                </p>
              </div>
            )}

            <Button onClick={agregarJugada} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl active:scale-95">
              <Plus size={20} className="mr-2" /> Añadir al Ticket
            </Button>
          </Card>

          {/* TICKET VISUAL */}
          <div className="bg-white p-8 font-mono shadow-2xl rounded-sm border-t-[14px] border-emerald-600 min-h-[400px] flex flex-col text-[11px] text-slate-900 relative">
            <h4 className="text-center font-black uppercase border-b-2 border-dashed mb-6 pb-2 text-sm italic">Ticket Virtual</h4>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
              {currentJugadas.map((j, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <p className="font-black text-emerald-600 uppercase text-[9px]">{j.loteria}</p>
                    <p className="font-black text-sm">#{j.numero} - {j.animal} {j.emoji}</p>
                    <p className="text-[9px] opacity-40 font-bold">{j.horas.join(", ")}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-black">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                    <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-1 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              {currentJugadas.length === 0 && <div className="h-full flex flex-col items-center justify-center py-20 opacity-10 space-y-2"><ReceiptText size={48}/><p className="font-black uppercase text-xs">Vacio</p></div>}
            </div>
            
            <div className="mt-6 pt-6 border-t-2 border-dashed flex justify-between font-black text-xl italic tracking-tighter">
              <span>TOTAL:</span>
              <span className="text-emerald-700 underline decoration-double">{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
            </div>

            <a 
              href={msgUrl} 
              onClick={() => { localStorage.setItem('u_pm_banco', userBanco); localStorage.setItem('u_pm_tlf', userPM); localStorage.setItem('u_pm_cedula', userCedula); }}
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full h-20 bg-[#25D366] text-white mt-8 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${msgUrl === "#" ? 'opacity-20 pointer-events-none' : ''}`}
            >
              <Send size={26} /> ENVIAR JUGADA
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER PERSISTENTE DE DATOS */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 p-4 border-t border-slate-800 flex gap-2 z-50">
          <Input value={userBanco} onChange={e => setUserBanco(e.target.value)} placeholder="Tu Banco" className="bg-slate-800 border-none text-white font-bold h-11 text-xs" />
          <Input value={userPM} onChange={e => setUserPM(e.target.value)} placeholder="Tlf Pago Móvil" className="bg-slate-800 border-none text-white font-bold h-11 text-xs" />
          <Input value={userCedula} onChange={e => setUserCedula(e.target.value)} placeholder="Tu Cédula" className="bg-slate-800 border-none text-white font-bold h-11 text-xs" />
      </div>

    </div>
  );
}
