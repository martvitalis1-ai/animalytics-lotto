import { LOTTERIES } from "@/lib/constants";
// CORREGIDO: Los logos estaban intercambiados
import logoGuacharito from "@/assets/logo-guacharo.png"; // El archivo guacharo.png es para Guacharito
import logoGuacharo from "@/assets/logo-guacharito.png"; // El archivo guacharito.png es para Guacharo
import logoLottoActivo from "@/assets/logo-lotto-activo.png";
import logoSelvaPlus from "@/assets/logo-selva-plus.png";
import logoGranjita from "@/assets/logo-granjita.png";
import logoLottoRey from "@/assets/logo-lotto-rey.png";

const LOTTERY_LOGOS: Record<string, string> = {
  guacharo: logoGuacharo,
  guacharito: logoGuacharito,
  lotto_activo: logoLottoActivo,
  selva_plus: logoSelvaPlus,
  granjita: logoGranjita,
  lotto_rey: logoLottoRey,
};

interface LotterySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function LotterySelector({ selected, onSelect }: LotterySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {LOTTERIES.map((lottery) => (
        <button
          key={lottery.id}
          onClick={() => onSelect(lottery.id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-all shrink-0
            ${selected === lottery.id 
              ? 'bg-primary text-primary-foreground border-primary shadow-md' 
              : 'bg-card hover:bg-muted border-border'
            }
          `}
        >
          <img 
            src={LOTTERY_LOGOS[lottery.id]} 
            alt={lottery.name}
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-sm whitespace-nowrap">
            {lottery.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export function getLotteryLogo(lotteryId: string): string {
  return LOTTERY_LOGOS[lotteryId] || logoLottoActivo;
}