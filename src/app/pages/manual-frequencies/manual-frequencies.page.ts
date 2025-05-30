// src/app/pages/manual-frequencies/manual-frequencies.page.ts
import { Component, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, 
         IonItem, IonLabel, IonButton, IonCard, IonCardContent,
         IonSegment, IonSegmentButton, IonIcon, IonText, IonGrid,
         IonRow, IonCol, IonChip, IonToast } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { play, stop, pulse, musicalNotes, volumeHigh, time, heart, heartOutline } from 'ionicons/icons';
import { AudioService, WaveformType } from '../../services/audio.service';
import { FavoritesService } from '../../services/favorites.service';
import { WaveformVisualizerComponent } from '../../components/waveform-visualizer/waveform-visualizer.component';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-manual-frequencies',
  template: `
    <ion-header class="modern-header">
      <ion-toolbar>
        <ion-title>
          <div class="title-container">
            <ion-icon name="pulse" class="title-icon"></ion-icon>
            <span class="title-text">Generador de Frecuencias</span>
            <!-- Favorites Heart Icon -->
            <ion-button 
              fill="clear" 
              size="small" 
              class="favorite-btn"
              (click)="toggleFavorite()"
              [color]="isFavorited ? 'danger' : 'medium'">
              <ion-icon [name]="isFavorited ? 'heart' : 'heart-outline'" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="frequency-content">
      <!-- Current Playing Warning -->
      <div class="current-playing-warning" *ngIf="audioService.getIsPlaying() && !isCurrentlyPlayingFrequency">
        <ion-card class="warning-card">
          <ion-card-content>
            <div class="warning-content">
              <div class="warning-info">
                <div class="warning-icon">🎵</div>
                <div class="warning-text">
                  <h4>Reproduciendo: {{audioService.getCurrentSoundInfo()}}</h4>
                  <p>Detén el sonido actual para usar el generador</p>
                </div>
              </div>
              <ion-button fill="clear" color="danger" (click)="stopCurrentSound()" class="stop-btn">
                <ion-icon name="stop" slot="start"></ion-icon>
                Detener
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Main Control Card -->
      <div class="main-container">
        <ion-card class="frequency-card">
          <ion-card-content>
            
            <!-- Header Section -->
            <div class="card-header">
              <div class="header-info">
                <h2>Terapia de Frecuencias</h2>
                <p>Crea tu experiencia sonora personalizada</p>
              </div>
              <div class="frequency-display">
                <span class="freq-number">{{frequency}}</span>
                <span class="freq-unit">Hz</span>
              </div>
            </div>

            <!-- Controls Grid -->
            <ion-grid class="controls-grid">
              
              <!-- Frequency Control -->
              <ion-row>
                <ion-col size="12">
                  <div class="control-section">
                    <div class="control-header">
                      <ion-icon name="pulse"></ion-icon>
                      <h3>Frecuencia</h3>
                      <ion-chip color="primary" size="small">
                        <ion-label>{{getFrequencyNote(frequency)}}</ion-label>
                      </ion-chip>
                    </div>
                    <ion-range 
                      [(ngModel)]="frequency"
                      [min]="20" 
                      [max]="20000" 
                      [pin]="true" 
                      [snaps]="false"
                      class="frequency-range"
                      color="primary"
                      (ionInput)="onConfigurationChange()">
                    </ion-range>
                    <div class="range-labels">
                      <span>20 Hz</span>
                      <span>20,000 Hz</span>
                    </div>
                  </div>
                </ion-col>
              </ion-row>

              <!-- Duration and Volume -->
              <ion-row>
                <ion-col size="12" size-md="6">
                  <div class="control-section">
                    <div class="control-header">
                      <ion-icon name="time"></ion-icon>
                      <h3>Duración</h3>
                      <ion-chip color="secondary" size="small">
                        <ion-label>{{duration}} min</ion-label>
                      </ion-chip>
                    </div>
                    <ion-range 
                      [(ngModel)]="duration"
                      [min]="1" 
                      [max]="60" 
                      [pin]="true"
                      color="secondary"
                      (ionInput)="onConfigurationChange()">
                    </ion-range>
                    <div class="range-labels">
                      <span>1 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="control-section">
                    <div class="control-header">
                      <ion-icon name="volume-high"></ion-icon>
                      <h3>Volumen</h3>
                      <ion-chip color="tertiary" size="small">
                        <ion-label>{{volume}}%</ion-label>
                      </ion-chip>
                    </div>
                    <ion-range 
                      [(ngModel)]="volume"
                      [min]="10" 
                      [max]="100" 
                      [pin]="true"
                      color="tertiary"
                      (ionInput)="onConfigurationChange()">
                    </ion-range>
                    <div class="range-labels">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </ion-col>
              </ion-row>

            </ion-grid>

            <!-- Waveform Selection -->
            <div class="waveform-section">
              <div class="section-header">
                <ion-icon name="musical-notes"></ion-icon>
                <h3>Forma de Onda</h3>
              </div>
              <div class="waveform-grid">
                <ion-button 
                  *ngFor="let type of waveformTypes"
                  [fill]="selectedWaveform === type.value ? 'solid' : 'outline'"
                  [color]="selectedWaveform === type.value ? 'primary' : 'medium'"
                  class="waveform-btn"
                  (click)="selectWaveform(type.value)">
                  <div class="waveform-content">
                    <span class="waveform-symbol">{{type.symbol}}</span>
                    <span class="waveform-name">{{type.label}}</span>
                  </div>
                </ion-button>
              </div>
            </div>

            <!-- Waveform Visualizer -->
            <div class="visualizer-section">
              <app-waveform-visualizer
                [frequency]="frequency"
                [waveformType]="selectedWaveform"
                [isPlaying]="isCurrentlyPlayingFrequency">
              </app-waveform-visualizer>
            </div>

            <!-- Main Control Button -->
            <div class="main-controls">
              <ion-button
                expand="block"
                [color]="isCurrentlyPlayingFrequency ? 'danger' : 'primary'"
                class="main-control-btn"
                (click)="togglePlayback()">
                <ion-icon [name]="isCurrentlyPlayingFrequency ? 'stop' : 'play'" slot="start"></ion-icon>
                <span>{{isCurrentlyPlayingFrequency ? 'Detener Frecuencia' : 'Reproducir Frecuencia'}}</span>
              </ion-button>
            </div>

            <!-- Current Status -->
            <div class="status-info" *ngIf="isCurrentlyPlayingFrequency">
              <div class="status-content">
                <div class="status-item">
                  <ion-icon name="pulse" color="success"></ion-icon>
                  <span>{{frequency}} Hz - {{selectedWaveformLabel}}</span>
                </div>
                <div class="status-item">
                  <ion-icon name="volume-high" color="success"></ion-icon>
                  <span>{{volume}}% volumen</span>
                </div>
                <div class="status-item">
                  <ion-icon name="time" color="success"></ion-icon>
                  <span>{{duration}} minuto(s)</span>
                </div>
              </div>
            </div>

          </ion-card-content>
        </ion-card>

        <!-- Quick Presets -->
        <ion-card class="presets-card">
          <ion-card-content>
            <div class="presets-header">
              <h3>Frecuencias Populares</h3>
              <p>Configuraciones comunes para terapia de sonido</p>
            </div>
            <div class="presets-grid">
              <div class="preset-item" *ngFor="let preset of frequencyPresets" (click)="applyPreset(preset)">
                <div class="preset-info">
                  <span class="preset-freq">{{preset.frequency}} Hz</span>
                  <span class="preset-name">{{preset.name}}</span>
                </div>
                <div class="preset-benefit">{{preset.benefit}}</div>
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
        --background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
        --color: white;
        height: 64px;
        box-shadow: 0 4px 20px rgba(107, 70, 193, 0.3);
      }
    }

    .title-container {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      width: 100%;
      justify-content: space-between;
    }

    .title-text {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 24px;
    }

    .favorite-btn {
      --color: white;
      min-width: 44px;
      min-height: 44px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .favorite-btn[color="danger"] {
      --color: #ff4757;
      animation: heartBeat 0.6s ease-in-out;
    }

    @keyframes heartBeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.3); }
      28% { transform: scale(1); }
      42% { transform: scale(1.3); }
      70% { transform: scale(1); }
    }

    .frequency-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 0;
    }

    .current-playing-warning {
      padding: 20px 20px 0;
    }

    .warning-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border-radius: 16px;
      border: 2px solid var(--app-warning);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
    }

    .warning-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .warning-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .warning-icon {
      font-size: 24px;
    }

    .warning-text h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #92400e;
      font-size: 16px;
    }

    .warning-text p {
      margin: 0;
      color: #b45309;
      font-size: 14px;
    }

    .main-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .frequency-card {
      border-radius: 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
      border: 1px solid rgba(107, 70, 193, 0.1);
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid rgba(107, 70, 193, 0.1);
    }

    .header-info h2 {
      margin: 0 0 8px 0;
      color: var(--app-primary);
      font-weight: 700;
      font-size: 24px;
    }

    .header-info p {
      margin: 0;
      color: var(--app-text-medium);
      font-size: 16px;
    }

    .frequency-display {
      background: linear-gradient(135deg, var(--app-primary), var(--app-primary-light));
      color: white;
      padding: 16px 24px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(107, 70, 193, 0.3);
    }

    .freq-number {
      font-size: 32px;
      font-weight: 700;
      display: block;
    }

    .freq-unit {
      font-size: 14px;
      opacity: 0.9;
    }

    .controls-grid {
      margin: 0 -8px;
    }

    .control-section {
      background: rgba(107, 70, 193, 0.05);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(107, 70, 193, 0.1);
    }

    .control-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .control-header ion-icon {
      font-size: 20px;
      color: var(--app-primary);
    }

    .control-header h3 {
      margin: 0;
      font-weight: 600;
      color: var(--app-text);
      flex: 1;
    }

    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--app-text-medium);
      margin-top: 8px;
    }

    .waveform-section {
      margin: 32px 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .section-header ion-icon {
      font-size: 24px;
      color: var(--app-primary);
    }

    .section-header h3 {
      margin: 0;
      font-weight: 600;
      color: var(--app-text);
    }

    .waveform-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .waveform-btn {
      height: 64px;
      --border-radius: 16px;
      --border-width: 2px;
      font-weight: 600;
    }

    .waveform-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .waveform-symbol {
      font-size: 18px;
    }

    .waveform-name {
      font-size: 12px;
    }

    .visualizer-section {
      margin: 32px 0;
    }

    .main-controls {
      margin: 32px 0 24px;
    }

    .main-control-btn {
      height: 64px;
      font-size: 18px;
      font-weight: 700;
      --border-radius: 20px;
      --box-shadow: 0 6px 30px rgba(107, 70, 193, 0.4);
    }

    .status-info {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-content {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--app-text);
    }

    .presets-card {
      border-radius: 20px;
      background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .presets-header h3 {
      margin: 0 0 8px 0;
      color: var(--app-primary);
      font-weight: 600;
    }

    .presets-header p {
      margin: 0 0 20px 0;
      color: var(--app-text-medium);
      font-size: 14px;
    }

    .presets-grid {
      display: grid;
      gap: 12px;
    }

    .preset-item {
      background: white;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid rgba(107, 70, 193, 0.1);
    }

    .preset-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(107, 70, 193, 0.2);
      border-color: var(--app-primary);
    }

    .preset-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .preset-freq {
      font-weight: 700;
      color: var(--app-primary);
      font-size: 16px;
    }

    .preset-name {
      font-weight: 600;
      color: var(--app-text);
    }

    .preset-benefit {
      font-size: 14px;
      color: var(--app-text-medium);
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 16px;
      }

      .card-header {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .frequency-display {
        order: -1;
      }

      .waveform-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .status-content {
        flex-direction: column;
        text-align: center;
      }

      .warning-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .title-container {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonRange, IonItem, IonLabel, IonButton, IonCard, 
    IonCardContent, IonSegment, IonSegmentButton, 
    IonIcon, IonText, IonGrid, IonRow, IonCol, IonChip,
    IonToast, WaveformVisualizerComponent
  ]
})
export class ManualFrequenciesPage implements OnDestroy {
  frequency: number = 440;
  duration: number = 5;
  volume: number = 30;
  selectedWaveform: WaveformType = 'sine';
  isCurrentlyPlayingFrequency: boolean = false;
  isFavorited: boolean = false;

  waveformTypes = [
    { value: 'sine' as WaveformType, label: 'Senoidal', symbol: '∿' },
    { value: 'square' as WaveformType, label: 'Cuadrada', symbol: '⊓' },
    { value: 'triangle' as WaveformType, label: 'Triangular', symbol: '△' },
    { value: 'sawtooth' as WaveformType, label: 'Sierra', symbol: '⩙' }
  ];

  frequencyPresets = [
    { frequency: 174, name: 'Dolor', benefit: 'Alivio del dolor físico' },
    { frequency: 285, name: 'Sanación', benefit: 'Regeneración de tejidos' },
    { frequency: 396, name: 'Liberación', benefit: 'Libera miedo y culpa' },
    { frequency: 417, name: 'Cambio', benefit: 'Facilita el cambio' },
    { frequency: 432, name: 'Armonía', benefit: 'Frecuencia natural' },
    { frequency: 528, name: 'Amor', benefit: 'Transformación y ADN' },
    { frequency: 639, name: 'Conexión', benefit: 'Relaciones armoniosas' },
    { frequency: 741, name: 'Expresión', benefit: 'Expresión y creatividad' },
    { frequency: 852, name: 'Intuición', benefit: 'Despertar espiritual' },
    { frequency: 963, name: 'Corona', benefit: 'Conexión divina' }
  ];

  constructor(
    public audioService: AudioService,
    private favoritesService: FavoritesService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ play, stop, pulse, musicalNotes, volumeHigh, time, heart, heartOutline });
    this.updateFavoriteStatus();
  }

  get selectedWaveformLabel(): string {
    return this.waveformTypes.find(type => type.value === this.selectedWaveform)?.label || 'Senoidal';
  }

  getFrequencyNote(freq: number): string {
    if (freq < 100) return 'Sub Bass';
    if (freq < 250) return 'Bass';
    if (freq < 500) return 'Low Mid';
    if (freq < 2000) return 'Mid Range';
    if (freq < 4000) return 'High Mid';
    if (freq < 8000) return 'Presence';
    return 'Brilliance';
  }

  selectWaveform(waveform: WaveformType) {
    this.selectedWaveform = waveform;
    this.updateFavoriteStatus();
    
    if (this.isCurrentlyPlayingFrequency) {
      this.stopPlayback();
      setTimeout(() => this.startPlayback(), 100);
    }
  }

  onConfigurationChange() {
    this.updateFavoriteStatus();
  }

  updateFavoriteStatus() {
    this.isFavorited = this.favoritesService.isFavorite(
      this.frequency, 
      this.selectedWaveform, 
      this.duration, 
      this.volume
    );
  }

  async toggleFavorite() {
    if (this.isFavorited) {
      // Remove from favorites
      const favorite = this.favoritesService.getFavoriteByConfig(
        this.frequency, this.selectedWaveform, this.duration, this.volume
      );
      
      if (favorite) {
        const success = this.favoritesService.removeFavorite(favorite.id);
        if (success) {
          this.isFavorited = false;
          await this.showToast('Eliminado de favoritos', 'danger');
        }
      }
    } else {
      // Add to favorites
      try {
        const favorite = this.favoritesService.addFavorite(
          this.frequency, this.selectedWaveform, this.duration, this.volume
        );
        this.isFavorited = true;
        await this.showToast(`${this.frequency} Hz guardado en favoritos ❤️`, 'success');
      } catch (error) {
        console.error('Error adding to favorites:', error);
        await this.showToast('Error al guardar en favoritos', 'danger');
      }
    }
  }

  applyPreset(preset: any) {
    this.frequency = preset.frequency;
    this.volume = 25;
    this.duration = 10;
    this.selectedWaveform = 'sine';
    this.updateFavoriteStatus();
  }

  async togglePlayback() {
    if (this.isCurrentlyPlayingFrequency) {
      this.stopPlayback();
    } else {
      await this.startPlayback();
    }
  }

  stopCurrentSound() {
    this.audioService.stopSound();
    this.isCurrentlyPlayingFrequency = false;
  }

  private async startPlayback() {
    try {
      await this.audioService.playFrequency(
        this.frequency,
        this.duration,
        this.volume,
        this.selectedWaveform,
        false
      );
      this.isCurrentlyPlayingFrequency = true;
      
      setTimeout(() => {
        if (!this.audioService.getIsPlaying()) {
          this.isCurrentlyPlayingFrequency = false;
        }
      }, this.duration * 60 * 1000);
      
    } catch (error) {
      console.error('Error playing frequency:', error);
      this.showSoundConflictAlert(error as Error);
    }
  }

  private stopPlayback() {
    this.audioService.stopSound();
    this.isCurrentlyPlayingFrequency = false;
  }

  private async showSoundConflictAlert(error: Error) {
    const alert = await this.alertController.create({
      header: 'Sonido en Uso',
      message: error.message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Detener y Reproducir',
          handler: () => {
            this.forceStartPlayback();
          }
        }
      ]
    });
    await alert.present();
  }

  private async forceStartPlayback() {
    try {
      await this.audioService.playFrequency(
        this.frequency,
        this.duration,
        this.volume,
        this.selectedWaveform,
        true
      );
      this.isCurrentlyPlayingFrequency = true;
      
      setTimeout(() => {
        if (!this.audioService.getIsPlaying()) {
          this.isCurrentlyPlayingFrequency = false;
        }
      }, this.duration * 60 * 1000);
      
    } catch (error) {
      console.error('Error force playing frequency:', error);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.isCurrentlyPlayingFrequency) {
      this.stopPlayback();
    }
  }
}