import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
         IonCardHeader, IonCardTitle, IonCardContent, IonButton, 
         IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tinnitus-therapy',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Tinnitus Therapy</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>What is Tinnitus?</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Tinnitus is the perception of noise or ringing in the ears.
        </ion-card-content>
      </ion-card>

      <ion-list>
        <ion-item>
          <ion-label>White Noise</ion-label>
          <ion-button slot="end">Play</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Pink Noise</ion-label>
          <ion-button slot="end">Play</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Brown Noise</ion-label>
          <ion-button slot="end">Play</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton,
    IonList, IonItem, IonLabel
  ]
})
export class TinnitusTherapyPage {
  constructor() {}
}
