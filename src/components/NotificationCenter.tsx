import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  BellRing,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";

type Notification = {
  id: string;
  type: 'result' | 'prediction' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    // Canal para resultados
    const resultsChannel = supabase
      .channel('notifications-results')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lottery_results' },
        (payload) => {
          const result = payload.new;
          const lottery = LOTTERIES.find(l => l.id === result.lottery_type);
          const animal = ANIMAL_MAPPING[result.result_number];
          
          const notification: Notification = {
            id: `result-${Date.now()}`,
            type: 'result',
            title: `🎰 Nuevo Resultado - ${lottery?.name || result.lottery_type}`,
            message: `${result.draw_time}: ${result.result_number.padStart(2, '0')}${animal ? ` - ${animal}` : ''}`,
            data: result,
            timestamp: new Date(),
            read: false
          };
          
          addNotification(notification);
          
          // Toast visual
          toast.success(notification.title, {
            description: notification.message,
            icon: <CheckCircle className="w-4 h-4 text-green-500" />
          });
        }
      )
      .subscribe();

    // Canal para predicciones de Ricardo
    const ricardoChannel = supabase
      .channel('notifications-ricardo')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dato_ricardo_predictions' },
        (payload) => {
          const pred = payload.new;
          const lottery = LOTTERIES.find(l => l.id === pred.lottery_type);
          
          const notification: Notification = {
            id: `ricardo-${Date.now()}`,
            type: 'prediction',
            title: `✨ Nuevo Pronóstico de Ricardo`,
            message: `${lottery?.name} - ${pred.draw_time}: ${pred.predicted_numbers?.join(', ')}`,
            data: pred,
            timestamp: new Date(),
            read: false
          };
          
          addNotification(notification);
          
          toast.info(notification.title, {
            description: notification.message,
            icon: <Sparkles className="w-4 h-4 text-amber-500" />
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resultsChannel);
      supabase.removeChannel(ricardoChannel);
    };
  }, []);

  // Actualizar estado de no leídos
  useEffect(() => {
    setHasUnread(notifications.some(n => !n.read));
  }, [notifications]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Mantener últimas 50
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative"
      >
        {hasUnread ? (
          <BellRing className="w-5 h-5 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-[70vh] bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                Marcar leídas
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">
                Limpiar
              </Button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === 'result' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : notif.type === 'prediction'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {notif.type === 'result' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : notif.type === 'prediction' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => removeNotification(notif.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
