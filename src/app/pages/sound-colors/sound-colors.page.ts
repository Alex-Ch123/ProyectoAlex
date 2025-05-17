import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
         IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sound-colors',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Sound Colors</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>White Noise</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Equal intensity across all frequencies. Good for masking other sounds.
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Pink Noise</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Balanced frequency distribution. Ideal for relaxation and sleep.
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Brown Noise</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Deep, low-frequency sound. Perfect for deep focus and meditation.
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class SoundColorsPage {
  constructor() {}
}
