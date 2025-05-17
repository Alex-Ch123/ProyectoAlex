import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, 
         IonItem, IonLabel, IonButton, IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-manual-frequencies',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Generador de Frecuencias</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="frequency-card">
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>Frecuencia (Hz)</ion-label>
            <ion-range [min]="20" [max]="20000" [pin]="true" class="frequency-range"></ion-range>
          </ion-item>

          <ion-item lines="none">
            <ion-label>Duración (minutos)</ion-label>
            <ion-range [min]="1" [max]="60" [pin]="true"></ion-range>
          </ion-item>

          <ion-item lines="none">
            <ion-label>Volumen</ion-label>
            <ion-range [min]="0" [max]="100" [pin]="true"></ion-range>
          </ion-item>

          <ion-button expand="block" class="play-button">
            Reproducir Frecuencia
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .frequency-card {
      max-width: 600px;
      margin: 16px auto;
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      
      @media (max-width: 768px) {
        margin: 16px;
        border-radius: 16px;
      }
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 16px;
    }

    .frequency-range {
      --bar-height: 8px;
      --bar-border-radius: 4px;
      --knob-size: 24px;
    }

    .play-button {
      margin-top: 24px;
      height: 48px;
      font-size: 16px;
      --border-radius: 12px;
    }
  `],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonRange, IonItem, IonLabel, IonButton, IonCard, IonCardContent
  ]
})
export class ManualFrequenciesPage {
  constructor() {}
}
