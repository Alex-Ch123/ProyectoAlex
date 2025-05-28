import { Component, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, 
         IonItem, IonLabel, IonButton, IonCard, IonCardContent,
         IonSegment, IonSegmentButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { play, stop, pulse } from 'ionicons/icons';
import { AudioService, WaveformType } from '../../services/audio.service';
import { WaveformVisualizerComponent } from '../../components/waveform-visualizer/waveform-visualizer.component';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-manual-frequencies',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="pulse"></ion-icon>
          Generador de Frecuencias
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Current Playing Warning -->
      <div class="current-playing-warning" *ngIf="audioService.getIsPlaying() && !isCurrentlyPlayingFrequency">
        <ion-card class="warning-card">
          <ion-card-content>
            <div class="playing-info">
              <div class="playing-text">
                <h4>🎵 Reproduciendo: {{audioService.getCurrentSoundInfo()}}</h4>
                <p>Detén el sonido actual para usar el generador de frecuencias</p>
              </div>
              <ion-button fill="clear" color="danger" (click)="stopCurrentSound()">
                <ion-icon name="stop"></ion-icon>
                Detener
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-card class="frequency-card">
        <ion-card-content>
          <!-- Frequency Control -->
          <ion-item lines="none" class="control-item">
            <ion-label>
              <h3>Frecuencia</h3>
              <p>{{frequency}} Hz</p>
            </ion-label>
            <ion-range 
              [(ngModel)]="frequency"
              [min]="20" 
              [max]="20000" 
              [pin]="true" 
              [snaps]="false"
              class="frequency-range"
              color="primary">
            </ion-range>
          </ion-item>

          <!-- Duration Control -->
          <ion-item lines="none" class="control-item">
            <ion-label>
              <h3>Duración</h3>
              <p>{{duration}} minuto{{duration !== 1 ? 's' : ''}}</p>
            </ion-label>
            <ion-range 
              [(ngModel)]="duration"
              [min]="1" 
              [max]="60" 
              [pin]="true"
              color="secondary">
            </ion-range>
          </ion-item>

          <!-- Volume Control -->
          <ion-item lines="none" class="control-item">
            <ion-label>
              <h3>Volumen</h3>
              <p>{{volume}}%</p>
            </ion-label>
            <ion-range 
              [(ngModel)]="volume"
              [min]="0" 
              [max]="100" 
              [pin]="true"
              color="tertiary">
            </ion-range>
          </ion-item>

          <!-- Waveform Type Control -->
          <div class="timbre-section">
            <ion-text>
              <h3>Timbre</h3>
            </ion-text>
            <div class="waveform-buttons">
              <ion-button 
                *ngFor="let type of waveformTypes"
                [fill]="selectedWaveform === type.value ? 'solid' : 'outline'"
                [color]="selectedWaveform === type.value ? 'primary' : 'medium'"
                size="small"
                class="waveform-btn"
                (click)="selectWaveform(type.value)">
                {{type.label}}
              </ion-button>
            </div>
          </div>

          <!-- Waveform Visualizer -->
          <app-waveform-visualizer
            [frequency]="frequency"
            [waveformType]="selectedWaveform"
            [isPlaying]="isCurrentlyPlayingFrequency">
          </app-waveform-visualizer>

          <!-- Control Buttons -->
          <div class="control-buttons">
            <ion-button
              expand="block"
              [color]="isCurrentlyPlayingFrequency ? 'danger' : 'primary'"
              class="play-button"
              (click)="togglePlayback()">
              <ion-icon [name]="isCurrentlyPlayingFrequency ? 'stop' : 'play'" slot="start"></ion-icon>
              {{isCurrentlyPlayingFrequency ? 'Detener' : 'Reproducir Frecuencia'}}
            </ion-button>
          </div>

          <!-- Sound Info -->
          <div class="sound-info" *ngIf="isCurrentlyPlayingFrequency">
            <ion-text color="primary">
              <p><strong>Reproduciendo:</strong> {{frequency}} Hz - {{selectedWaveformLabel}} - {{volume}}% volumen</p>
              <p><strong>Duración:</strong> {{duration}} minuto(s)</p>
            </ion-text>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-toolbar {
      --background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      --color: #ffffff;
    }

    ion-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .current-playing-warning {
      margin-bottom: 20px;
    }

    .warning-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border-radius: 16px;
      border: 2px solid #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }

    .playing-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .playing-text h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #92400e;
      font-size: 16px;
    }

    .playing-text p {
      margin: 0;
      color: #b45309;
      font-size: 14px;
    }

    .frequency-card {
      max-width: 800px;
      margin: 16px auto;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
      
      @media (max-width: 768px) {
        margin: 16px;
        border-radius: 16px;
      }
    }

    .control-item {
      --padding-start: 0;
      --padding-end: 0;
      margin-bottom: 24px;
      
      ion-label h3 {
        color: #1a1a2e;
        font-weight: 600;
        margin: 0 0 4px 0;
        font-size: 18px;
      }
      
      ion-label p {
        color: #666;
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .frequency-range {
      --bar-height: 8px;
      --bar-border-radius: 4px;
      --knob-size: 28px;
      --bar-background: #e9ecef;
      --bar-background-active: linear-gradient(135deg, #0077ff, #00bfff);
    }

    .timbre-section {
      margin: 32px 0 24px 0;
      
      h3 {
        color: #1a1a2e;
        font-weight: 600;
        margin: 0 0 16px 0;
        font-size: 18px;
      }
    }

    .waveform-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .waveform-btn {
      --border-radius: 12px;
      height: 44px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .control-buttons {
      margin: 32px 0 16px 0;
    }

    .play-button {
      height: 56px;
      font-size: 18px;
      font-weight: 600;
      --border-radius: 16px;
      --box-shadow: 0 4px 20px rgba(0,119,255,0.3);
    }

    .sound-info {
      background: rgba(0,119,255,0.05);
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
      border: 1px solid rgba(0,119,255,0.1);
      
      p {
        margin: 4px 0;
        font-size: 14px;
      }
    }

    @media (max-width: 600px) {
      .waveform-buttons {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      
      .waveform-btn {
        font-size: 12px;
        height: 40px;
      }

      .playing-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
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
    IonIcon, IonText,
    WaveformVisualizerComponent
  ]
})
export class ManualFrequenciesPage implements OnDestroy {
  frequency: number = 440;
  duration: number = 5;
  volume: number = 50;
  selectedWaveform: WaveformType = 'sine';
  isCurrentlyPlayingFrequency: boolean = false;

  waveformTypes = [
    { value: 'sine' as WaveformType, label: 'Senoidal' },
    { value: 'square' as WaveformType, label: 'Cuadrada' },
    { value: 'triangle' as WaveformType, label: 'Triangular' },
    { value: 'sawtooth' as WaveformType, label: 'Diente de Sierra' }
  ];

  constructor(
    public audioService: AudioService,
    private alertController: AlertController
  ) {
    addIcons({ play, stop, pulse });
  }

  get selectedWaveformLabel(): string {
    return this.waveformTypes.find(type => type.value === this.selectedWaveform)?.label || 'Senoidal';
  }

  selectWaveform(waveform: WaveformType) {
    this.selectedWaveform = waveform;
    
    // If currently playing frequency, restart with new waveform
    if (this.isCurrentlyPlayingFrequency) {
      this.stopPlayback();
      setTimeout(() => this.startPlayback(), 100);
    }
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
        false // Don't force, show conflict if needed
      );
      this.isCurrentlyPlayingFrequency = true;
      
      // Set timeout to update UI when sound stops
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
            // Force stop and retry with force
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
        true // Force override
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

  ngOnDestroy() {
    if (this.isCurrentlyPlayingFrequency) {
      this.stopPlayback();
    }
  }
}