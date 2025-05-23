// Tipos para la Web Notification API
declare global {
  interface Window {
    Notification: typeof Notification;
  }
}

// Extender la interfaz de Notification si es necesario
interface NotificationOptions {
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  badge?: string;
  body?: string;
  tag?: string;
  icon?: string;
  image?: string;
  data?: any;
  vibrate?: number[];
  renotify?: boolean;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  silent?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export {};