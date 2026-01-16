import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { verifyAdminCode } from "@/lib/accessControl";
import { toast } from "sonner";

interface AdminCodeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function AdminCodeModal({ open, onClose, onSuccess, title = "Acceso Administrador" }: AdminCodeModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    
    // Pequeño delay para UX
    await new Promise(r => setTimeout(r, 300));
    
    if (verifyAdminCode(code)) {
      toast.success("Acceso autorizado");
      setCode("");
      onSuccess();
    } else {
      toast.error("Código incorrecto");
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Código de Administrador
            </label>
            <Input
              type="password"
              placeholder="Ingresa el código..."
              className="h-12 text-lg font-bold tracking-widest uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={loading || !code}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
