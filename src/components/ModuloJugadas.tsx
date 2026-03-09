import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Wallet, Landmark, Info, ReceiptText } from "lucide-react";
import { toast } from "sonner";

// --- DICCIONARIOS OFICIALES ---
const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA',
};

const ANIMALS_GUACHARO: Record<string, string> = {
  ...ANIMALS_STANDARD,
  '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO',
};

const ANIMALS_GUACHARITO: Record<string, string> = {
  ...ANIMALS_GUACHARO,
  '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO',
};

const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣"
};

// --- DEFINICIÓN DE HORARIOS EXACTOS ---
const HORAS_PUNTO = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", 
  "06:00 PM", "07:00 PM"
];

const HORAS_MEDIA = [
  "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", 
  "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", 
  "06:30 PM", "07:30 PM"
];

export function ModuloJugadas() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [currentJugadas, setCurrentJugadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos usuario
  const [userPM, setUserPM] = useState(() => localStorage.getItem('u_pm_tlf') || "");
  const [userCedula, setUserCedula] = useState(() => localStorage.getItem('u_pm_cedula') || "");
  const [userBanco, setUserBanco] = useState(() => localStorage.getItem('u_pm_banco') || "");

  // Formulario
  const [lot, setLot] = useState("");
  const [num, setNum] = useState("");
  const [mon, setMon] = useState("");
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: ag } = await supabase.from('agencias').select('*').eq('activa', true);
        if (ag) setAgencias(ag);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    init();
  }, []);

  // Lógica de horarios según la lotería elegida
  const horarios = useMemo(() => {
    if (lot === "Guacharito" || lot === "Lotto Rey") return HORAS_MEDIA;
    return HORAS_PUNTO;
  }, [lot]);

  const agregarJugada = () => {
    if (!lot || !num || !mon || selectedHours.length === 0) return toast.error("Datos incompletos");
    let n = num.trim();
    if (n !== "0" && n !== "00") n = n.padStart(2, '0');

    // Diccionario Inteligente
    let dic = ANIMALS_STANDARD;
    if (lot === "Guacharito") dic = ANIMALS_GUACHARITO;
    else if (lot === "Guácharo Activo") dic = ANIMALS_GUACHARO;

    const animal = dic[n] || "ANIMAL";
    const emoji = ANIMAL_EMOJIS[n] || "🎟️";

    setCurrentJugadas([...currentJugadas, { 
      loteria: lot, numero: n, animal, emoji, monto: parseFloat(mon), horas: [...selectedHours] 
    }]);
    setNum(""); setMon(""); setSelectedHours([]);
    toast.success("Añadido al ticket");
  };

  const msgUrl = useMemo(() => {
    if (!selectedAgencia || currentJugadas.length === 0 || !userPM) return "#";
    let tlf = selectedAgencia.whatsapp?.toString().replace(/\D/g, '') || "";
    if (tlf.startsWith('0')) tlf = '58' + tlf.substring(1);
    if (tlf.length === 10) tlf = '58' + tlf;

    let msg = `*SOLICITUD DE JUGADA*\n--------------------------\n`;
    msg += `*DATOS DE COBRO:*\nBANCO: ${userBanco}\nPM: ${userPM}\nCI: ${userCedula}\n--------------------------\n\n`;
    
    currentJugadas.forEach(j => {
      msg += `*${j.loteria.toUpperCase()}*\n`;
      msg += `Animal: ${j.numero} - ${j.animal} ${j.emoji}\n`;
      msg += `Sorteos: ${j.horas.join(", ")}\n`;
      msg += `Monto: ${j.monto} Bs\n----------\n`;
    });
    
    const total = currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0);
    msg += `\n*TOTAL A PAGAR: ${total.toFixed(2)} Bs*`;
    
    return `https://wa.me/${tlf}?text=${encodeURIComponent(msg)}`;
  }, [selectedAgencia, currentJugadas, userBanco, userPM, userCedula]);

  if (loading) return <div className="p-20 text-center font-black bg-white text-slate-900">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 bg-slate-100 min-h-screen text-slate-900">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* PANEL IZQUIERDO */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 rounded-[2rem] shadow-xl space-y-3">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">1. Datos para recibir Premios</p>
            <Input value={userBanco} onChange={e => {setUserBanco(e.target.value); localStorage.setItem('u_pm_banco', e.target.value)}} placeholder="Tu Banco" className="bg-slate-800 border-none text-white font-bold" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={userPM} onChange={e => {setUserPM(e.target.value); localStorage.setItem('u_pm_tlf', e.target.value)}} placeholder="Tlf Pago Móvil" className="bg-slate-800 border-none text-white font-bold" />
              <Input value={userCedula} onChange={e => {setUserCedula(e.target.value); localStorage.setItem('u_pm_cedula', e.target.value)}} placeholder="Tu Cédula" className="bg-slate-800 border-none text-white font-bold" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-500 italic">2. Elige tu Agencia</p>
            <div className="flex flex-wrap gap-2">
              {agencias.map(ag => (
                <button key={ag.id} onClick={() => setSelectedAgencia(ag)} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${selectedAgencia?.id === ag.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600'}`}>{ag.nombre}</button>
              ))}
            </div>
            {selectedAgencia && (
              <div className="p-5 bg-white border-2 border-emerald-500 rounded-[2rem] shadow-lg animate-in zoom-in-95">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-2"><Landmark size={14}/> Datos de Pago Agencia:</p>
                <div className="space-y-1 text-slate-900 font-black uppercase italic text-xs">
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedAgencia.banco_nombre || 'BANCO NO REGISTRADO'}</p>
                  <div className="flex gap-2">
                    <p className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">Tlf: {selectedAgencia.banco_telefono || '---'}</p>
                    <p className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">CI: {selectedAgencia.banco_cedula || '---'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="p-6 space-y-4 border-none shadow-2xl rounded-[2.5rem] bg-white">
            <Select value={lot} onValueChange={v => {setLot(v); setSelectedHours([])}}>
              <SelectTrigger className="font-black bg-slate-100 border-none text-slate-900 uppercase h-12 shadow-inner"><SelectValue placeholder="Elegir Lotería" /></SelectTrigger>
              <SelectContent className="font-bold">
                <SelectItem value="Lotto Activo">Lotto Activo (08-07)</SelectItem>
                <SelectItem value="La Granjita">La Granjita (08-07)</SelectItem>
                <SelectItem value="Guacharito">Guacharito (08:30-07:30)</SelectItem>
                <SelectItem value="Lotto Rey">Lotto Rey (08:30-07:30)</SelectItem>
                <SelectItem value="Guácharo Activo">Guácharo Activo (08-07)</SelectItem>
                <SelectItem value="Selva Plus">Selva Plus (08-07)</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black ml-2 uppercase opacity-40 text-slate-900">Número</label>
                <Input placeholder="00-99" value={num} onChange={e => setNum(e.target.value)} className="h-14 font-black text-center text-4xl bg-slate-100 border-none text-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black ml-2 uppercase opacity-40 text-slate-900">Monto Bs</label>
                <Input placeholder="Bs" type="number" value={mon} onChange={e => setMon(e.target.value)} className="h-14 font-black text-center text-4xl bg-slate-100 border-none text-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {horarios.map(t => (
                <button 
                  key={t} 
                  onClick={() => setSelectedHours(prev => prev.includes(t) ? prev.filter(h => h !== t) : [...prev, t])} 
                  className={`h-11 text-[10px] font-black rounded-xl border-2 transition-all ${selectedHours.includes(t) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-200 border-slate-300 text-slate-900'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button onClick={agregarJugada} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl active:scale-95 transition-all"><Plus className="mr-2"/> Añadir al Ticket</Button>
          </Card>
        </div>

        {/* TICKET DERECHA */}
        <div className="bg-white p-6 md:p-8 font-mono shadow-2xl rounded-sm border-t-[20px] border-emerald-600 min-h-[600px] flex flex-col text-slate-900">
          <div className="text-center border-b-2 border-dashed border-slate-200 pb-5 mb-8">
            <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-800 italic">{selectedAgencia?.nombre || "NUEVA JUGADA"}</h3>
            <p className="text-[10px] font-black opacity-30 italic">Animalytics Pro Ticket</p>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[450px]">
            {currentJugadas.map((j, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 flex justify-between items-start animate-in fade-in slide-in-from-right-4">
                <div className="text-left">
                  <p className="font-black uppercase text-emerald-600 text-[11px] tracking-widest">{j.loteria}</p>
                  <p className="font-black text-xl text-slate-900">#{j.numero} - {j.animal} {j.emoji}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{j.horas.join(" | ")}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="font-black text-lg text-slate-900">{(j.monto * j.horas.length).toFixed(2)} Bs</span>
                  <button onClick={() => setCurrentJugadas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
            {currentJugadas.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-10 space-y-4">
                <ReceiptText size={80}/>
                <p className="font-black uppercase text-xl">Ticket Vacío</p>
              </div>
            )}
          </div>
          <div className="mt-8 border-t-4 border-double border-slate-900 pt-6 flex justify-between font-black text-4xl italic text-slate-900 tracking-tighter">
            <span>TOTAL:</span>
            <span className="underline decoration-emerald-500 decoration-4">{currentJugadas.reduce((a, c) => a + (c.monto * c.horas.length), 0).toFixed(2)} Bs</span>
          </div>
          <a 
            href={msgUrl} 
            onClick={() => localStorage.setItem('u_pm_tlf', userPM)}
            target="_blank" 
            rel="noopener noreferrer" 
            className={`w-full h-24 bg-[#25D366] text-white mt-10 rounded-[2rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all ${msgUrl === "#" ? 'opacity-20 pointer-events-none' : ''}`}
          >
            <Send size={30} /> ENVIAR TICKET
          </a>
          {currentJugadas.length > 0 && (
            <button onClick={() => setCurrentJugadas([])} className="mt-6 text-[11px] uppercase font-black text-red-500/30 hover:text-red-500 mx-auto">❌ Limpiar Todo</button>
          )}
        </div>
      </div>
    </div>
  );
}
