import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { book, moonOutline, bedOutline, leaf } from 'ionicons/icons';

@Component({
  selector: 'app-activity-sounds',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Sonidos por Actividad</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="activities-grid">
        <ion-card class="activity-card" *ngFor="let activity of activities">
          <ion-card-content>
            <ion-icon [name]="activity.icon"></ion-icon>
            <h2>{{activity.title}}</h2>
            <p>{{activity.description}}</p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      padding: 16px;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
        padding: 24px;
      }
    }

    .activity-card {
      border-radius: 16px;
      transition: transform 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
      }

      ion-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      ion-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--ion-color-primary);
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 8px 0 0;
        color: var(--ion-color-medium);
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent
  ]
})
export class ActivitySoundsPage {
  activities = [
    { icon: 'book', title: 'Estudio', description: 'Mejora tu concentración' },
    { icon: 'moon-outline', title: 'Meditación', description: 'Encuentra la paz interior' },
    { icon: 'bed-outline', title: 'Dormir', description: 'Descansa profundamente' },
    { icon: 'leaf', title: 'Relajación', description: 'Reduce el estrés' }
  ];

  constructor() {
    addIcons({ book, moonOutline, bedOutline, leaf });
  }
}
