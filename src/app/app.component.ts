import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  template: 
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
      <app-notification></app-notification>
    </ion-app>
  ,
  standalone: true,
  imports: [
    CommonModule,
    IonApp, 
    IonRouterOutlet,
    NotificationComponent
  ]
})
export class AppComponent {
  constructor() {}
}