// src/app/pages/activity-sounds/activity-sounds.page.ts
import { Component, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, 
         IonCardContent, IonButton, IonChip, IonLabel, IonGrid, IonRow, 
         IonCol, IonText, IonProgressBar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { book, moonOutline, bedOutline, leaf, play, stop, pause, 
         volumeHigh, time, musicalNotes } from 'ionicons/icons';
import { AudioService } from '../../services/audio.service';
import { AlertController } from '@ionic/angular';

interface ActivitySound {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  soundConfig: {
    type: 'file' | 'frequency' | 'mixed';
    file?: string;
    frequency?: number;
    waveform?: 'sine' | 'square' | 'triangle' | 'sawtooth';
    duration: number;
    volume: number;
  };
  benefits: string[];
  isPlaying?: boolean;
}

@Component({
  selector: 'app-activity-sounds',
  template: `
    <ion-header class="modern-header">
      <ion-toolbar>
        <ion-title>
          <div class="title-container">
            <ion-icon name="musical-notes" class="title-icon"></ion-icon>
            <span class="title-text">Sonidos por Actividad</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="activity-content">
      
      <!-- Current Playing Status -->
      <div class="current-status" *ngIf="currentlyPlaying">
        <ion-card class="status-card">
          <ion-card-content>
            <div class="status-content">
              <div class="status-info">
                <div class="status-icon">
                  <ion-icon [name]="currentlyPlaying.icon" [style.color]="currentlyPlaying.color"></ion-icon>
                </div>
                <div class="status-text">
                  <h4>{{currentlyPlaying.title}} en reproducción</h4>
                  <p>{{getRemainingTime()}} restantes</p>
                </div>
              </div>
              <ion-button fill="clear" color="danger" (click)="stopCurrentActivity()">
                <ion-icon name="stop" slot="start"></ion-icon>
                Detener
              </ion-button>
            </div>
            <ion-progress-bar [value]="getProgress()" color="primary"></ion-progress-bar>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Activities Grid -->
      <div class="activities-container">
        <div class="section-header">
          <h2>Elige tu experiencia sonora</h2>
          <p>Cada actividad está optimizada con sonidos y frecuencias específicas</p>
        </div>

        <ion-grid class="activities-grid">
          <ion-row>
            <ion-col size="12" size-md="6" *ngFor="let activity of activities">
              <ion-card 
                class="activity-card" 
                [class.playing]="activity.isPlaying"
                [style.background]="activity.gradient"
                (click)="toggleActivity(activity)">
                
                <ion-card-content>
                  
                  <!-- Card Header -->
                  <div class="card-header">
                    <div class="activity-icon">
                      <ion-icon [name]="activity.icon" [style.color]="activity.color"></ion-icon>
                    </div>
                    <div class="play-status" *ngIf="activity.isPlaying">
                      <ion-icon name="play" color="success"></ion-icon>
                    </div>
                  </div>

                  <!-- Activity Info -->
                  <div class="activity-info">
                    <h3>{{activity.title}}</h3>
                    <p class="description">{{activity.description}}</p>
                    
                    <!-- Sound Configuration -->
                    <div class="sound-config">
                      <ion-chip [color]="activity.color" size="small">
                        <ion-icon name="volume-high" slot="start"></ion-icon>
                        <ion-label>{{getSoundTypeLabel(activity)}}</ion-label>
                      </ion-chip>
                      <ion-chip color="medium" size="small">
                        <ion-icon name="time" slot="start"></ion-icon>
                        <ion-label>{{activity.soundConfig.duration}} min</ion-label>
                      </ion-chip>
                    </div>

                    <!-- Benefits -->
                    <div class="benefits">
                      <h4>Beneficios:</h4>
                      <ul>
                        <li *ngFor="let benefit of activity.benefits">{{benefit}}</li>
                      </ul>
                    </div>

                    <!-- Action Button -->
                    <ion-button 
                      expand="block" 
                      [fill]="activity.isPlaying ? 'solid' : 'outline'"
                      [color]="activity.isPlaying ? 'danger' : activity.color"
                      class="action-button">
                      <ion-icon [name]="activity.isPlaying ? 'stop' : 'play'" slot="start"></ion-icon>
                      {{activity.isPlaying ? 'Detener' : 'Reproducir'}}
                    </ion-button>

                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Quick Tips Section -->
        <ion-card class="tips-card">
          <ion-card-content>
            <div class="tips-header">
              <ion-icon name="leaf" color="success"></ion-icon>
              <h3>Consejos para mejor experiencia</h3>
            </div>
            <div class="tips-content">
              <div class="tip-item">
                <strong>🎧 Usa auriculares:</strong> Para una experiencia más inmersiva y efectiva.
              </div>
              <div class="tip-item">
                <strong>🔊 Volumen moderado:</strong> Los sonidos están optimizados para ser suaves y relajantes.
              </div>
              <div class="tip-item">
                <strong>⏰ Sesiones regulares:</strong> Usa los sonidos consistentemente para mejores resultados.
              </div>
              <div class="tip-item">
                <strong>🧘 Ambiente tranquilo:</strong> Encuentra un lugar cómodo y sin distracciones.
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .modern-header {
      ion-toolbar {
        --background: linear-gradient(135deg, var(--app-secondary) 0%, var(--app-secondary-light) 100%);
        --color: white;
        height: 64px;
        box-shadow: 0 4px 20px rgba(159, 122, 234, 0.3);
      }
    }

    .title-container {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }

    .title-icon {
      font-size: 24px;
    }

    .activity-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 0;
    }

    .current-status {
      padding: 20px 20px 0;
    }

    .status-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid var(--app-success);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
    }

    .status-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .status-text h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: var(--app-text);
    }

    .status-text p {
      margin: 0;
      color: var(--app-text-medium);
      font-size: 14px;
    }

    .activities-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .section-header h2 {
      margin: 0 0 12px 0;
      color: var(--app-primary);
      font-weight: 700;
      font-size: 28px;
    }

    .section-header p {
      margin: 0;
      color: var(--app-text-medium);
      font-size: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .activities-grid {
      margin: 0 -8px;
    }

    .activity-card {
      height: 100%;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      overflow: hidden;
      position: relative;
    }

    .activity-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1;
    }

    .activity-card ion-card-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .activity-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.15);
    }

    .activity-card.playing {
      border-color: var(--app-success);
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
    }

    .activity-card.playing::before {
      background: rgba(236, 253, 245, 0.95);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .play-status {
      background: var(--app-success);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    .activity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }

    .activity-info h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: var(--app-text);
    }

    .description {
      margin: 0;
      color: var(--app-text-medium);
      font-size: 16px;
      line-height: 1.5;
    }

    .sound-config {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .benefits {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .benefits h4 {
      margin: 0 0 12px 0;
      font-weight: 600;
      color: var(--app-text);
      font-size: 16px;
    }

    .benefits ul {
      margin: 0;
      padding-left: 16px;
    }

    .benefits li {
      color: var(--app-text-medium);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .action-button {
      --border-radius: 16px;
      height: 48px;
      font-weight: 600;
      margin-top: auto;
    }

    .tips-card {
      margin-top: 32px;
      border-radius: 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid rgba(3, 105, 161, 0.2);
    }

    .tips-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .tips-header h3 {
      margin: 0;
      color: var(--app-primary);
      font-weight: 600;
    }

    .tips-content {
      display: grid;
      gap: 12px;
    }

    .tip-item {
      background: white;
      border-radius: 12px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.5;
      color: var(--app-text);
      border: 1px solid rgba(3, 105, 161, 0.1);
    }

    .tip-item strong {
      color: var(--app-primary);
    }

    @media (max-width: 768px) {
      .activities-container {
        padding: 16px;
      }

      .section-header h2 {
        font-size: 24px;
      }

      .activity-icon {
        width: 56px;
        height: 56px;
        font-size: 28px;
      }

      .activity-info h3 {
        font-size: 20px;
      }

      .tips-content {
        gap: 8px;
      }

      .tip-item {
        padding: 12px;
        font-size: 13px;
      }

      .status-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard,
    IonCardContent, IonButton, IonChip, IonLabel, IonGrid, IonRow,
    IonCol, IonText, IonProgressBar
  ]
})
export class ActivitySoundsPage implements OnDestroy {
  currentlyPlaying: ActivitySound | null = null;
  private playStartTime: number = 0;

  activities: ActivitySound[] = [
    {
      id: 'study',
      title: 'Estudio',
      description: 'Mejora tu concentración y enfoque mental',
      icon: 'book',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      soundConfig: {
        type: 'file',
        file: 'pink',
        duration: 25,
        volume: 25 // Volumen bajo para concentración
      },
      benefits: [
        'Mejora la concentración y memoria',
        'Reduce distracciones del entorno',
        'Aumenta la productividad mental',
        'Facilita el estado de flujo'
      ]
    },
    {
      id: 'meditation',
      title: 'Meditación',
      description: 'Encuentra la paz interior y tranquilidad',
      icon: 'moon-outline',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      soundConfig: {
        type: 'file',
        file: 'nature',
        duration: 20,
        volume: 20 // Muy suave para meditación
      },
      benefits: [
        'Reduce el estrés y la ansiedad',
        'Mejora la claridad mental',
        'Facilita la relajación profunda',
        'Conecta con el momento presente'
      ]
    },
    {
      id: 'sleep',
      title: 'Dormir',
      description: 'Descansa profundamente y repara tu cuerpo',
      icon: 'bed-outline',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
      soundConfig: {
        type: 'file',
        file: 'white',
        duration: 60, // Más tiempo para dormir
        volume: 15 // Muy bajo para no despertar
      },
      benefits: [
        'Facilita el sueño profundo',
        'Bloquea ruidos molestos',
        'Mejora la calidad del descanso',
        'Regula los ciclos de sueño'
      ]
    },
    {
      id: 'relaxation',
      title: 'Relajación',
      description: 'Reduce el estrés y encuentra equilibrio',
      icon: 'leaf',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      soundConfig: {
        type: 'file',
        file: 'pink',
        duration: 15,
        volume: 30 // Moderado para relajación activa
      },
      benefits: [
        'Libera tensiones acumuladas',
        'Equilibra el sistema nervioso',
        'Mejora el estado de ánimo',
        'Restaura la energía mental'
      ]
    }
  ];

  constructor(
    private audioService: AudioService,
    private alertController: AlertController
  ) {
    addIcons({ 
      book, moonOutline, bedOutline, leaf, play, stop, pause, 
      volumeHigh, time, musicalNotes 
    });
  }

  async toggleActivity(activity: ActivitySound) {
    if (activity.isPlaying) {
      this.stopActivity(activity);
    } else {
      await this.startActivity(activity);
    }
  }

  async startActivity(activity: ActivitySound) {
    // Verificar si hay otro sonido reproduciéndose
    if (this.audioService.getIsPlaying()) {
      const shouldReplace = await this.showReplaceAlert();
      if (!shouldReplace) return;
    }

    try {
      // Detener cualquier actividad actual
      this.stopAllActivities();

      // Configurar y reproducir el sonido
      const config = activity.soundConfig;
      
      if (config.type === 'file' && config.file) {
        await this.audioService.playSoundFile(
          config.file as 'nature' | 'pink' | 'white',
          config.duration,
          config.volume,
          true // Force override
        );
      } else if (config.type === 'frequency' && config.frequency) {
        await this.audioService.playFrequency(
          config.frequency,
          config.duration,
          config.volume,
          config.waveform || 'sine',
          true
        );
      }

      // Marcar como reproduciéndose
      activity.isPlaying = true;
      this.currentlyPlaying = activity;
      this.playStartTime = Date.now();

      // Programar detención automática
      setTimeout(() => {
        this.stopActivity(activity);
      }, config.duration * 60 * 1000);

    } catch (error) {
      console.error('Error starting activity sound:', error);
      this.showErrorAlert('No se pudo reproducir el sonido. Verifica los archivos de audio.');
    }
  }

  stopActivity(activity: ActivitySound) {
    this.audioService.stopSound();
    activity.isPlaying = false;
    
    if (this.currentlyPlaying?.id === activity.id) {
      this.currentlyPlaying = null;
      this.playStartTime = 0;
    }
  }

  stopCurrentActivity() {
    if (this.currentlyPlaying) {
      this.stopActivity(this.currentlyPlaying);
    }
  }

  private stopAllActivities() {
    this.activities.forEach(activity => {
      activity.isPlaying = false;
    });
    this.currentlyPlaying = null;
    this.playStartTime = 0;
  }

  getSoundTypeLabel(activity: ActivitySound): string {
    const config = activity.soundConfig;
    const labels: { [key: string]: string } = {
      'nature': 'Naturaleza',
      'pink': 'Ruido Rosa',
      'white': 'Ruido Blanco'
    };
    
    if (config.type === 'file' && config.file) {
      return labels[config.file] || config.file;
    } else if (config.type === 'frequency') {
      return `${config.frequency} Hz`;
    }
    return 'Sonido Especial';
  }

  getRemainingTime(): string {
    if (!this.currentlyPlaying) return '';
    
    const elapsed = (Date.now() - this.playStartTime) / 1000 / 60; // minutos
    const remaining = Math.max(0, this.currentlyPlaying.soundConfig.duration - elapsed);
    
    if (remaining < 1) {
      return 'Menos de 1 minuto';
    }
    return `${Math.round(remaining)} minuto${remaining !== 1 ? 's' : ''}`;
  }

  getProgress(): number {
    if (!this.currentlyPlaying) return 0;
    
    const elapsed = (Date.now() - this.playStartTime) / 1000 / 60;
    const total = this.currentlyPlaying.soundConfig.duration;
    return Math.min(1, elapsed / total);
  }

  private async showReplaceAlert(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Sonido en reproducción',
        message: '¿Deseas detener el sonido actual y reproducir esta actividad?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Sí, cambiar',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  ngOnDestroy() {
    this.stopAllActivities();
  }
}