import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Check, Ban, Users } from "lucide-react";
import { toast } from "sonner";

export function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setUsers(data || []);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    if (!newCode.trim()) {
      toast.error("Ingresa un código");
      return;
    }
    
    setLoading(true);
    
    const { error } = await supabase.from('access_codes').insert({
      code: newCode.toUpperCase(),
      alias: newAlias || 'Usuario',
      role: 'user',
      is_active: true
    });
    
    if (error) {
      if (error.code === '23505') {
        toast.error("Este código ya existe");
      } else {
        toast.error("Error al crear");
      }
    } else {
      toast.success("Usuario creado");
      setNewCode('');
      setNewAlias('');
      loadUsers();
    }
    
    setLoading(false);
  };

  const toggleActive = async (code: string, currentStatus: boolean) => {
    if (code === 'GANADOR85') {
      toast.error("No puedes desactivar al administrador");
      return;
    }
    
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: !currentStatus })
      .eq('code', code);
    
    if (!error) {
      toast.success(currentStatus ? "Usuario bloqueado" : "Usuario activado");
      loadUsers();
    }
  };

  const deleteUser = async (code: string) => {
    if (code === 'GANADOR85') {
      toast.error("No puedes eliminar al administrador");
      return;
    }
    
    if (!confirm("¿Eliminar este usuario?")) return;
    
    const { error } = await supabase.from('access_codes').delete().eq('code', code);
    
    if (!error) {
      toast.success("Usuario eliminado");
      loadUsers();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Gestión de Usuarios
        </CardTitle>
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
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {users.map((u) => (
            <div 
              key={u.code} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                u.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-primary' : 'bg-destructive'}`} />
                <div>
                  <p className="font-mono font-bold text-sm">{u.code}</p>
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
                  disabled={u.code === 'GANADOR85'}
                >
                  {u.is_active ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteUser(u.code)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={u.code === 'GANADOR85'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
