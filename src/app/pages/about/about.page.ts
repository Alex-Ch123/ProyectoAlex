import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
         IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  template: `
    <ion-header class="header-moderno">
      <ion-toolbar color="light">
        <ion-title>Acerca de</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="contenido-moderno" fullscreen>
      <ion-card class="card-moderno">
        <ion-card-content>
          <h2>Sobre Sound Therapy</h2>
          <p>
            Esta aplicación está diseñada para ayudarte a comprender y beneficiarte de la terapia de sonido, ya sea para relajación, concentración o alivio del tinnitus.
          </p>
          <h3>Base científica</h3>
          <p>
            Basada en investigaciones en psicoacústica y terapia de sonido.
          </p>
          <h3>Contacto</h3>
          <p>
            Para soporte o sugerencias, escríbenos a: <a href="mailto:soporte&#64;soundtherapy.app">soporte&#64;soundtherapy.app</a>
          </p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .header-moderno {
      --background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .contenido-moderno {
      --background: #f6f8fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card-moderno {
      width: 100%;
      max-width: 420px;
      margin: 32px auto;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
      padding: 24px 18px;
      background: #fff;
      transition: box-shadow 0.3s;
    }
    .card-moderno:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }
    h2, h3 {
      margin-top: 0;
      color: #1a1a1a;
      font-weight: 600;
    }
    p {
      color: #444;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    a {
      color: #0077ff;
      text-decoration: underline;
    }
  `],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent
  ]
})
export class AboutPage {}
