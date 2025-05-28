//hola 2
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
         IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { musicalNotes, moon, pulse } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Terapia de Sonido</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="welcome-container">
        <ion-card class="welcome-card animate-in">
          <ion-card-header>
            <ion-card-title>Bienvenido a tu Terapia de Sonido</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Descubre el poder curativo del sonido y mejora tu bienestar
          </ion-card-content>
        </ion-card>

        <div class="features-grid">
          <ion-card class="feature-card animate-in" *ngFor="let feature of features">
            <ion-card-content>
              <ion-icon [name]="feature.icon"></ion-icon>
              <h3>{{feature.title}}</h3>
              <p>{{feature.description}}</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
    }

    .welcome-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
      color: white;
      
      ion-card-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
      }
    }

    .feature-card {
      height: 100%;
      
      ion-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      ion-icon {
        font-size: 42px;
        margin-bottom: 16px;
        color: var(--ion-color-primary);
      }
    }

    .animate-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon
  ]
})
export class HomePage {
  constructor() {
    addIcons({ musicalNotes, moon, pulse });
  }
  features = [
    {
      icon: 'musical-notes',
      title: 'Sonidos Matutinos',
      description: 'Comienza tu día con energía'
    },
    {
      icon: 'moon',
      title: 'Relajación Nocturna',
      description: 'Mejora tu descanso'
    },
    {
      icon: 'pulse',
      title: 'Frecuencias Terapéuticas',
      description: 'Beneficios específicos para tu bienestar'
    }
  ];
}
