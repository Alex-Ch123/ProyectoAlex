import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, closeCircle, warning, informationCircle, 
  alarm, close, play, checkmark 
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NotificationService, AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification-container" *ngIf="notifications.length > 0">
      <div 
        class="notification-item" 
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        [ngClass]="'notification-' + notification.type"
        [@slideInOut]>
        
        <div class="notification-content">
          <div class="notification-header">
            <ion-icon [name]="notification.icon || 'information-circle'"></ion-icon>
            <span class="notification-title">{{notification.title}}</span>
            <ion-button 
              fill="clear" 
              size="small" 
              (click)="dismiss(notification.id)"
              class="dismiss-button">
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </div>
          
          <p class="notification-message">{{notification.message}}</p>
          
          <div class="notification-actions" *ngIf="notification.action">
            <ion-button 
              size="small" 
              [color]="getActionColor(notification.type)"
              (click)="executeAction(notification)">
              {{notification.action.label}}
            </ion-button>
          </div>
        </div>
        
        <div 
          class="notification-progress" 
          *ngIf="notification.duration && notification.duration > 0"
          [style.animation-duration.ms]="notification.duration">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
      
      @media (max-width: 768px) {
        right: 8px;
        left: 8px;
        max-width: none;
      }
    }

    .notification-item {
      margin-bottom: 12px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      pointer-events: auto;
      position: relative;
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%);
      color: white;
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.95) 0%, rgba(211, 47, 47, 0.95) 100%);
      color: white;
    }

    .notification-warning {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%);
      color: #333;
    }

    .notification-info {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.95) 0%, rgba(30, 136, 229, 0.95) 100%);
      color: white;
    }

    .notification-routine {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
      color: white;
    }

    .notification-content {
      padding: 16px;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      ion-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .notification-title {
        flex: 1;
        font-weight: 700;
        font-size: 16px;
        line-height: 1.2;
      }

      .dismiss-button {
        --color: currentColor;
        --padding-start: 4px;
        --padding-end: 4px;
        min-width: 32px;
        height: 32px;
      }
    }

    .notification-message {
      margin: 0 0 12px 36px;
      font-size: 14px;
      line-height: 1.4;
      opacity: 0.9;
    }

    .notification-actions {
      margin: 12px 0 0 36px;

      ion-button {
        --border-radius: 8px;
        --padding-start: 16px;
        --padding-end: 16px;
        height: 36px;
        font-weight: 600;
        font-size: 14px;
      }
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: rgba(255,255,255,0.3);
      animation: progressBar linear;
      transform-origin: left center;
    }

    @keyframes progressBar {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    /* Colores específicos para botones */
    .notification-success ion-button {
      --background: rgba(255,255,255,0.2);
      --color: white;
      
      &:hover {
        --background: rgba(255,255,255,0.3);
      }
    }

    .notification-error ion-button {
      --background: rgba(255,255,255,0.2);
      --color: white;
      
      &:hover {
        --background: rgba(255,255,255,0.3);
      }
    }

    .notification-warning ion-button {
      --background: rgba(0,0,0,0.1);
      --color: #333;
      
      &:hover {
        --background: rgba(0,0,0,0.2);
      }
    }

    .notification-info ion-button {
      --background: rgba(255,255,255,0.2);
      --color: white;
      
      &:hover {
        --background: rgba(255,255,255,0.3);
      }
    }

    .notification-routine ion-button {
      --background: rgba(255,255,255,0.2);
      --color: white;
      
      &:hover {
        --background: rgba(255,255,255,0.3);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .notification-container {
        top: 70px;
      }

      .notification-item {
        margin-bottom: 8px;
        border-radius: 12px;
      }

      .notification-content {
        padding: 12px;
      }

      .notification-header {
        gap: 8px;

        .notification-title {
          font-size: 15px;
        }

        ion-icon {
          font-size: 20px;
        }
      }

      .notification-message {
        margin-left: 28px;
        font-size: 13px;
      }

      .notification-actions {
        margin-left: 28px;
        margin-top: 8px;

        ion-button {
          height: 32px;
          font-size: 13px;
        }
      }
    }

    /* Animation for removal */
    .notification-item.removing {
      animation: slideOutRight 0.3s ease-in forwards;
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    /* Hover effects */
    .notification-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .notification-item {
        border-width: 2px;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .notification-item {
        animation: none;
      }
      
      .notification-progress {
        animation: none;
      }
      
      .notification-item:hover {
        transform: none;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {
    addIcons({ 
      checkmarkCircle, closeCircle, warning, informationCircle, 
      alarm, close, play, checkmark 
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    // Limpiar notificaciones antiguas cada 5 minutos
    setInterval(() => {
      this.notificationService.cleanupOldNotifications();
    }, 5 * 60 * 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  dismiss(id: string) {
    // Agregar clase de animación de salida
    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      element.classList.add('removing');
      setTimeout(() => {
        this.notificationService.dismissNotification(id);
      }, 300);
    } else {
      this.notificationService.dismissNotification(id);
    }
  }

  executeAction(notification: AppNotification) {
    if (notification.action) {
      notification.action.handler();
      this.dismiss(notification.id);
    }
  }

  getActionColor(type: AppNotification['type']): string {
    const colorMap = {
      success: 'light',
      error: 'light',
      warning: 'dark',
      info: 'light',
      routine: 'light'
    };
    return colorMap[type] || 'primary';
  }

  trackByNotification(index: number, notification: AppNotification): string {
    return notification.id;
  }
}