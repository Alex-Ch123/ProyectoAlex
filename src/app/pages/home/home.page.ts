import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
         IonCardTitle, IonCardContent, IonIcon, IonButton, IonFab, IonFabButton,
         IonGrid, IonRow, IonCol, IonText, IonChip, IonItem, IonLabel, IonList,
         IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { musicalNotes, moon, pulse, add, time, sunny, leaf, notifications, 
         trash, play, stop, toggleOutline, close } from 'ionicons/icons';
import { AudioService } from '../../services/audio.service';
import { RoutineService, ScheduledRoutine } from '../../services/routine.service';
import { RoutineModalComponent } from '../../components/routine-modal/routine-modal.component';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  template: `
    <ion-header class="modern-header">
      <ion-toolbar>
        <ion-title>
          <span class="title-gradient">Terapia de Sonido</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-text">
          <h1>Bienvenido a tu espacio de bienestar</h1>
          <p>Descubre el poder curativo del sonido y mejora tu calidad de vida</p>
        </div>
        <div class="time-greeting">
          <ion-chip [color]="getTimeBasedColor()" class="time-chip">
            <ion-icon [name]="getTimeBasedIcon()"></ion-icon>
            <ion-label>{{getTimeGreeting()}}</ion-label>
          </ion-chip>
        </div>
      </div>

      <!-- Current Playing Warning -->
      <div class="current-playing-warning" *ngIf="audioService.getIsPlaying()">
        <ion-card class="warning-card">
          <ion-card-content>
            <div class="playing-info">
              <div class="playing-text">
                <h4>🎵 Reproduciendo: {{audioService.getCurrentSoundInfo()}}</h4>
                <p>Solo un sonido puede reproducirse a la vez</p>
              </div>
              <ion-button fill="clear" color="danger" (click)="stopCurrentSound()">
                <ion-icon name="stop"></ion-icon>
                Detener
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Quick Actions Grid -->
      <ion-grid class="actions-grid">
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card class="action-card morning-card" (click)="playMorningSound()">
              <ion-card-content>
                <div class="card-icon morning-icon">
                  <ion-icon name="sunny"></ion-icon>
                </div>
                <h3>Sonidos Matutinos</h3>
                <p>Comienza tu día con energía y vitalidad</p>
                <div class="sound-info">
                  <ion-chip color="warning" size="small">
                    <ion-label>Sonidos de Naturaleza</ion-label>
                  </ion-chip>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card class="action-card night-card" (click)="playNightSound()">
              <ion-card-content>
                <div class="card-icon night-icon">
                  <ion-icon name="moon"></ion-icon>
                </div>
                <h3>Relajación Nocturna</h3>
                <p>Prepárate para un descanso profundo y reparador</p>
                <div class="sound-info">
                  <ion-chip color="secondary" size="small">
                    <ion-label>Ruido Rosa</ion-label>
                  </ion-chip>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12">
            <ion-card class="action-card therapy-card" (click)="openFrequencyTherapy()">
              <ion-card-content>
                <div class="card-icon therapy-icon">
                  <ion-icon name="pulse"></ion-icon>
                </div>
                <h3>Frecuencias Terapéuticas</h3>
                <p>Beneficios específicos para tu bienestar físico y mental</p>
                <div class="sound-info">
                  <ion-chip color="tertiary" size="small">
                    <ion-label>Generador de Frecuencias</ion-label>
                  </ion-chip>
                  <ion-chip color="success" size="small">
                    <ion-label>Ruido Blanco</ion-label>
                  </ion-chip>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Scheduled Routines Section -->
      <div class="routines-section">
        <div class="section-header">
          <h2>
            <ion-icon name="time"></ion-icon>
            Rutinas Programadas
          </h2>
          <ion-button fill="clear" size="small" (click)="openRoutineModal()">
            <ion-icon name="add" slot="start"></ion-icon>
            Nueva Rutina
          </ion-button>
        </div>

        <div class="routines-container" *ngIf="scheduledRoutines.length > 0; else noRoutines">
          <ion-item-sliding *ngFor="let routine of scheduledRoutines">
            <ion-card class="routine-card">
              <ion-card-content>
                <div class="routine-header">
                  <h4>{{routine.name}}</h4>
                  <div class="header-actions">
                    <ion-chip [color]="routine.isActive ? 'success' : 'medium'" size="small">
                      {{routine.isActive ? 'Activa' : 'Inactiva'}}
                    </ion-chip>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      class="delete-button"
                      (click)="confirmDeleteRoutine(routine)">
                      <ion-icon name="close" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </div>
                <div class="routine-details">
                  <ion-text color="medium">
                    <p>
                      <ion-icon name="time"></ion-icon>
                      {{routine.time}} - {{routine.days.join(', ')}}
                    </p>
                    <p>
                      <ion-icon name="musical-notes"></ion-icon>
                      {{getSoundTypeDisplayName(routine.soundType)}} - {{routine.duration}} min
                    </p>
                  </ion-text>
                </div>
                <div class="routine-actions">
                  <ion-button 
                    fill="clear" 
                    size="small" 
                    (click)="toggleRoutine(routine.id)"
                    [color]="routine.isActive ? 'medium' : 'success'">
                    <ion-icon [name]="routine.isActive ? 'stop' : 'play'" slot="start"></ion-icon>
                    {{routine.isActive ? 'Pausar' : 'Activar'}}
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small" 
                    color="primary"
                    (click)="testRoutine(routine)">
                    <ion-icon name="play" slot="start"></ion-icon>
                    Probar
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Sliding actions -->
            <ion-item-options side="end">
              <ion-item-option color="danger" (click)="confirmDeleteRoutine(routine)">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-item-option>
              <ion-item-option color="primary" (click)="toggleRoutine(routine.id)">
                <ion-icon name="toggle-outline" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </div>

        <ng-template #noRoutines>
          <div class="empty-state">
            <ion-icon name="notifications" class="empty-icon"></ion-icon>
            <h3>Sin rutinas programadas</h3>
            <p>Crea tu primera rutina para automatizar tu terapia de sonido</p>
            <ion-button fill="outline" (click)="openRoutineModal()">
              <ion-icon name="add" slot="start"></ion-icon>
              Crear Primera Rutina
            </ion-button>
          </div>
        </ng-template>
      </div>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" (click)="openRoutineModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .modern-header ion-toolbar {
      --background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
      --color: white;
      height: 60px;
    }

    .title-gradient {
      background: linear-gradient(45deg, #ffffff, #f0f8ff);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 20px;
    }

    .home-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .welcome-section {
      padding: 24px 20px;
      text-align: center;
      background: linear-gradient(135deg, var(--ion-color-primary-tint) 0%, var(--ion-color-secondary-tint) 100%);
      margin-bottom: 20px;
      border-radius: 0 0 24px 24px;
    }

    .welcome-text h1 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .welcome-text p {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin: 0 0 16px 0;
    }

    .time-chip {
      --background: rgba(255,255,255,0.2);
      --color: white;
      backdrop-filter: blur(10px);
    }

    .current-playing-warning {
      padding: 0 20px 16px;
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

    .actions-grid {
      padding: 0 16px;
    }

    .action-card {
      height: 100%;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      overflow: hidden;
      position: relative;
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--card-accent), var(--card-accent-light));
    }

    .morning-card {
      --card-accent: #f59e0b;
      --card-accent-light: #fbbf24;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    .night-card {
      --card-accent: #6366f1;
      --card-accent-light: #8b5cf6;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    }

    .therapy-card {
      --card-accent: #059669;
      --card-accent-light: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
    }

    .morning-icon {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      color: white;
    }

    .night-icon {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }

    .therapy-icon {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
    }

    .action-card h3 {
      text-align: center;
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .action-card p {
      text-align: center;
      margin: 0 0 16px 0;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    }

    .sound-info {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .routines-section {
      padding: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .routines-container {
      display: grid;
      gap: 12px;
    }

    .routine-card {
      border-radius: 16px;
      border-left: 4px solid var(--ion-color-primary);
      margin: 0;
    }

    .routine-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .routine-header h4 {
      margin: 0;
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .delete-button {
      --color: #ef4444;
      --color-hover: #dc2626;
      min-width: 32px;
      min-height: 32px;
    }

    .routine-details ion-text p {
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .routine-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 64px;
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }

    ion-item-sliding {
      --background: transparent;
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .section-header h2 {
        text-align: center;
      }

      .welcome-text h1 {
        font-size: 20px;
      }

      .card-icon {
        width: 50px;
        height: 50px;
        font-size: 24px;
      }

      .routine-actions {
        flex-direction: column;
        gap: 4px;
      }

      .routine-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .header-actions {
        align-self: flex-end;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonIcon, IonButton, IonFab, IonFabButton,
    IonGrid, IonRow, IonCol, IonText, IonChip, IonItem, IonLabel, IonList,
    IonItemSliding, IonItemOptions, IonItemOption
  ]
})
export class HomePage implements OnInit {
  scheduledRoutines: ScheduledRoutine[] = [];

  constructor(
    public audioService: AudioService,
    private routineService: RoutineService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    addIcons({ 
      musicalNotes, moon, pulse, add, time, sunny, leaf, notifications, 
      trash, play, stop, toggleOutline, close 
    });
  }

  ngOnInit() {
    this.loadScheduledRoutines();
  }

  getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getTimeBasedIcon(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'sunny';
    if (hour < 18) return 'leaf';
    return 'moon';
  }

  getTimeBasedColor(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'warning';
    if (hour < 18) return 'success';
    return 'secondary';
  }

  async playMorningSound() {
    try {
      await this.audioService.playSoundFile('nature', 10, 80, false);
    } catch (error) {
      console.error('Error playing morning sound:', error);
      this.showSoundConflictAlert(error as Error);
    }
  }

  async playNightSound() {
    try {
      await this.audioService.playSoundFile('pink', 15, 60, false);
    } catch (error) {
      console.error('Error playing night sound:', error);
      this.showSoundConflictAlert(error as Error);
    }
  }

  openFrequencyTherapy() {
    // Navigate to manual frequencies page
    window.location.href = '/tabs/manual-frequencies';
  }

  stopCurrentSound() {
    this.audioService.stopSound();
  }

  async openRoutineModal() {
    const modal = await this.modalController.create({
      component: RoutineModalComponent,
      presentingElement: undefined
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadScheduledRoutines();
      }
    });

    await modal.present();
  }

  async confirmDeleteRoutine(routine: ScheduledRoutine) {
    const alert = await this.alertController.create({
      header: 'Eliminar Rutina',
      message: `¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteRoutine(routine.id);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteRoutine(routineId: string) {
    const success = this.routineService.deleteRoutine(routineId);
    if (success) {
      this.loadScheduledRoutines();
      this.showSuccessAlert('Rutina eliminada correctamente');
    } else {
      this.showErrorAlert('No se pudo eliminar la rutina');
    }
  }

  toggleRoutine(routineId: string) {
    const success = this.routineService.toggleRoutine(routineId);
    if (success) {
      this.loadScheduledRoutines();
    }
  }

  async testRoutine(routine: ScheduledRoutine) {
    try {
      // Test for 30 seconds
      await this.audioService.playRoutineSound(
        routine.soundType,
        routine.frequency,
        0.5, // 30 seconds
        routine.volume,
        false // Don't force, show conflict if needed
      );
    } catch (error) {
      console.error('Error testing routine:', error);
      this.showSoundConflictAlert(error as Error);
    }
  }

  getSoundTypeDisplayName(soundType: string): string {
    const displayNames: { [key: string]: string } = {
      'morning': 'Sonidos Matutinos',
      'nature': 'Sonidos de Naturaleza',
      'night': 'Relajación Nocturna',
      'frequency': 'Frecuencia Específica',
      'white-noise': 'Ruido Blanco',
      'pink-noise': 'Ruido Rosa',
      'brown-noise': 'Ruido Marrón'
    };
    return displayNames[soundType] || soundType;
  }

  private loadScheduledRoutines() {
    this.scheduledRoutines = this.routineService.getScheduledRoutines();
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
            // Force stop and retry
            this.audioService.stopSound();
          }
        }
      ]
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}