import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Check, Ban, Users, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  createAccessCode, 
  getAllAccessCodes, 
  toggleAccessCodeStatus, 
  deleteAccessCode,
  ADMIN_CODE 
} from "@/lib/accessControl";

// No protected codes - admin has full control
const PROTECTED_CODES: string[] = [];

export function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    setRefreshing(true);
    const { codes, error } = await getAllAccessCodes();
    
    if (!error) {
      setUsers(codes);
    } else {
      toast.error(`Error cargando usuarios: ${error}`);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isProtectedCode = (code: string): boolean => {
    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    return PROTECTED_CODES.some(pc => normalizedCode === pc.replace(/\s+/g, ''));
  };

  const createUser = async () => {
    const cleanCode = newCode.trim().toUpperCase();
    
    if (!cleanCode) {
      toast.error("Ingresa un código");
      return;
    }
    
    if (cleanCode.length < 4) {
      toast.error("El código debe tener al menos 4 caracteres");
      return;
    }

    // Check if trying to create a protected code
    if (isProtectedCode(cleanCode)) {
      toast.error("Este código está reservado para administradores");
      return;
    }

    // Check if code already exists
    const existingCode = users.find(u => 
      u.code.trim().toUpperCase().replace(/\s+/g, '') === cleanCode.replace(/\s+/g, '')
    );
    
    if (existingCode) {
      toast.error("Este código ya existe");
      return;
    }
    
    setLoading(true);
    
    const { success, error } = await createAccessCode(
      cleanCode,
      newAlias || 'Usuario',
      'user'
    );
    
    if (!success) {
      toast.error(error || "Error al crear el código");
    } else {
      toast.success("✅ Código creado exitosamente");
      setNewCode('');
      setNewAlias('');
      loadUsers();
    }
    
    setLoading(false);
  };

  const toggleActive = async (code: string, currentStatus: boolean) => {
    if (isProtectedCode(code)) {
      toast.error("No puedes modificar códigos de administrador");
      return;
    }
    
    const { success, error } = await toggleAccessCodeStatus(code, !currentStatus);
    
    if (success) {
      toast.success(currentStatus ? "Usuario bloqueado" : "Usuario activado");
      loadUsers();
    } else {
      toast.error(error || "Error al actualizar");
    }
  };

  const deleteUser = async (code: string) => {
    if (isProtectedCode(code)) {
      toast.error("No puedes eliminar códigos de administrador");
      return;
    }
    
    if (!confirm("¿Eliminar este usuario?")) return;
    
    const { success, error } = await deleteAccessCode(code);
    
    if (success) {
      toast.success("Usuario eliminado");
      loadUsers();
    } else {
      toast.error(error || "Error al eliminar");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gestión de Usuarios
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadUsers}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {users.length} código(s) registrado(s) • {users.filter(u => u.is_active).length} activo(s)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Código"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            className="flex-1 font-mono uppercase bg-background"
          />
          <Input
            placeholder="Alias (opcional)"
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            className="flex-1 bg-background"
          />
          <Button 
            onClick={createUser} 
            disabled={loading}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {users.map((u) => {
            const isProtected = isProtectedCode(u.code);
            
            return (
              <div 
                key={u.code} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  u.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                } ${isProtected ? 'border-amber-500/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    isProtected ? 'bg-amber-500' : u.is_active ? 'bg-primary' : 'bg-destructive'
                  }`} />
                  <div>
                    <p className="font-mono font-bold text-sm flex items-center gap-1">
                      {u.code}
                      {isProtected && <span className="text-amber-500 text-xs">👑</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.alias} · {u.role === 'admin' ? '👑 Admin' : 'Usuario'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleActive(u.code, u.is_active)}
                    className={`h-8 w-8 ${u.is_active ? 'text-primary' : 'text-destructive'}`}
                    disabled={isProtected}
                    title={isProtected ? 'Código protegido' : (u.is_active ? 'Desactivar' : 'Activar')}
                  >
                    {u.is_active ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteUser(u.code)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={isProtected}
                    title={isProtected ? 'Código protegido' : 'Eliminar'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {users.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No hay códigos registrados
            </p>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          👑 Control total de códigos de acceso
        </p>
      </CardContent>
    </Card>
  );
}
