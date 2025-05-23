import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'routine';
  duration?: number; // milliseconds, null for persistent
  action?: {
    label: string;
    handler: () => void;
  };
  icon?: string;
  timestamp: Date;
  dismissed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: AppNotification[] = [];
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private hasPermission = false;

  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.checkNotificationPermission();
  }

  private async checkNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.hasPermission = true;
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }
    return false;
  }

  showNotification(
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    duration: number = 5000,
    action?: AppNotification['action']
  ): string {
    const notification: AppNotification = {
      id: this.generateId(),
      title,
      message,
      type,
      duration,
      action,
      icon: this.getTypeIcon(type),
      timestamp: new Date(),
      dismissed: false
    };

    this.notifications.unshift(notification);
    this.notificationsSubject.next([...this.notifications]);

    // Auto dismiss if duration is set
    if (duration && duration > 0) {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, duration);
    }

    // Show browser notification if permission granted
    if (this.hasPermission && (type === 'routine' || type === 'success')) {
      this.showBrowserNotification(notification);
    }

    return notification.id;
  }

  private showBrowserNotification(notification: AppNotification): void {
    if (!this.hasPermission) return;

    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/assets/icon/favicon.png',
      tag: notification.id,
      badge: '/assets/icon/favicon.png',
      
    });

    browserNotif.onclick = () => {
      window.focus();
      if (notification.action) {
        notification.action.handler();
      }
      browserNotif.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      browserNotif.close();
    }, 10000);
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }

  dismissAll(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
  }

  getActiveNotifications(): AppNotification[] {
    return this.notifications.filter(n => !n.dismissed);
  }

  // Métodos específicos para diferentes tipos de notificaciones
  showRoutineAlert(routineName: string, onStart?: () => void, onSkip?: () => void): string {
    return this.showNotification(
      '🔔 Rutina Programada',
      `Es hora de tu rutina: ${routineName}`,
      'routine',
      0, // Persistente hasta que el usuario actúe
      {
        label: 'Iniciar',
        handler: () => {
          if (onStart) onStart();
          this.showSuccess('Rutina iniciada', `${routineName} en reproducción`);
        }
      }
    );
  }

  showSessionComplete(frequency: number, duration: number): string {
    return this.showNotification(
      '✅ Sesión Completada',
      `Frecuencia ${frequency}Hz por ${Math.round(duration)} minutos`,
      'success',
      7000,
      {
        label: 'Registrar bienestar',
        handler: () => {
          // Esto podría abrir el modal del diario
          console.log('Abrir modal de bienestar');
        }
      }
    );
  }

  showStreakAchievement(streak: number): string {
    return this.showNotification(
      '🔥 ¡Racha Alcanzada!',
      `Has completado ${streak} días consecutivos`,
      'success',
      8000
    );
  }

  showGoalProgress(progress: number): string {
    if (progress >= 100) {
      return this.showNotification(
        '🎯 ¡Meta Semanal Completada!',
        'Has alcanzado tu objetivo de tiempo de relajación',
        'success',
        10000
      );
    } else if (progress >= 75) {
      return this.showNotification(
        '📈 Casi lo logras',
        `${Math.round(progress)}% de tu meta semanal completada`,
        'info',
        6000
      );
    }
    return '';
  }

  showWellnessReminder(): string {
    return this.showNotification(
      '💭 Recordatorio de Bienestar',
      '¿Cómo te sientes hoy? Registra tu estado en el diario',
      'info',
      0,
      {
        label: 'Registrar',
        handler: () => {
          // Abrir modal del diario
          console.log('Abrir diario de bienestar');
        }
      }
    );
  }

  // Métodos de conveniencia
  showSuccess(title: string, message: string, duration: number = 5000): string {
    return this.showNotification(title, message, 'success', duration);
  }

  showError(title: string, message: string, duration: number = 8000): string {
    return this.showNotification(title, message, 'error', duration);
  }

  showInfo(title: string, message: string, duration: number = 5000): string {
    return this.showNotification(title, message, 'info', duration);
  }

  showWarning(title: string, message: string, duration: number = 6000): string {
    return this.showNotification(title, message, 'warning', duration);
  }

  private getTypeIcon(type: AppNotification['type']): string {
    const iconMap = {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'warning',
      info: 'information-circle',
      routine: 'alarm'
    };
    return iconMap[type] || 'information-circle';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Programar notificaciones futuras (para rutinas)
  scheduleNotification(
    title: string, 
    message: string, 
    scheduledTime: Date,
    type: AppNotification['type'] = 'routine'
  ): void {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(title, message, type, 0);
      }, delay);
    }
  }

  // Mostrar notificación de sonido no disponible
  showAudioError(error: string): string {
    return this.showNotification(
      '🔊 Error de Audio',
      error || 'No se pudo reproducir el sonido. Verifica tus permisos de audio.',
      'error',
      8000,
      {
        label: 'Reintentar',
        handler: () => {
          window.location.reload();
        }
      }
    );
  }

  // Limpiar notificaciones antiguas (llamar periódicamente)
  cleanupOldNotifications(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.notifications = this.notifications.filter(
      n => n.timestamp > oneHourAgo || !n.dismissed
    );
    this.notificationsSubject.next([...this.notifications]);
  }
}