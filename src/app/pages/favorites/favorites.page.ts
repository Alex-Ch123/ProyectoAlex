import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, playCircle } from 'ionicons/icons';

@Component({
  selector: 'app-favorites',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Favorites</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-icon name="heart" slot="start"></ion-icon>
          <ion-label>
            <h2>Study Mix 1</h2>
            <p>Brown noise + 432 Hz</p>
          </ion-label>
          <ion-icon name="play-circle" slot="end"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon
  ]
})
export class FavoritesPage {
  constructor() {
    addIcons({ heart, heartOutline, playCircle });
  }
}
