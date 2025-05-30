import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonLabel, IonIcon, IonButton,
         IonCard, IonCardContent, IonGrid, IonRow, IonCol,
         IonChip, IonText, IonItemSliding, IonItemOptions, 
         IonItemOption, IonProgressBar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { heart, heartOutline, playCircle, stopCircle, close, 
         trash, musicalNotes, pulse, volumeHigh, time,
         pauseCircle, play, stop } from 'ionicons/icons';
import { FavoritesService, FavoriteFrequency } from '../../services/favorites.service';
import { AudioService } from '../../services/audio.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  template: `
    <ion-header class="modern-header">
      <ion-toolbar>
        <ion-title>
          <div class="title-container">
            <ion-icon name="heart" class="title-icon"></ion-icon>
            <span class="title-text">Favoritos</span>
            <ion-chip color="primary" size="small" *ngIf="favorites.length > 0">
              <ion-label>{{favorites.length}}</ion-label>
            </ion-chip>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="favorites-content">

      <!-- Currently Playing Status -->
      <div class="current-status" *ngIf="currentlyPlaying">
        <ion-card class="status-card">
          <ion-card-content>
            <div class="status-content">
              <div class="status-info">
                <div class="status-icon">
                  <ion-icon name="pulse" [style.color]="'#10b981'"></ion-icon>
                </div>
                <div class="status-text">
                  <h4>{{currentlyPlaying.name}}</h4>
                  <p>{{getRemainingTime()}} restantes</p>
                </div>
              </div>
              <ion-button fill="clear" color="danger" (click)="stopCurrent()">
                <ion-icon name="stop" slot="start"></ion-icon>
                Detener
              </ion-button>
            </div>
            <ion-progress-bar [value]="getProgress()" color="success"></ion-progress-bar>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Favorites List -->
      <div class="favorites-container" *ngIf="favorites.length > 0; else emptyState">
        <div class="section-header">
          <h2>Tus frecuencias guardadas</h2>
          <p>Toca cualquier frecuencia para reproducirla instantáneamente</p>
        </div>

        <div class="favorites-grid">
          <ion-item-sliding *ngFor="let favorite of favorites; trackBy: trackByFavorite">
            <ion-card 
              class="favorite-card" 
              [class.playing]="favorite.isPlaying"
              (click)="toggleFavoritePlayback(favorite)">
              
              <ion-card-content>
                
                <!-- Card Header -->
                <div class="card-header">
                  <div class="frequency-display">
                    <span class="freq-number">{{favorite.frequency}}</span>
                    <span class="freq-unit">Hz</span>
                  </div>
                  <div class="play-status">
                    <ion-icon 
                      [name]="favorite.isPlaying ? 'stop-circle' : 'play-circle'" 
                      [color]="favorite.isPlaying ? 'danger' : 'primary'"
                      class="play-icon">
                    </ion-icon>
                  </div>
                </div>

                <!-- Favorite Info -->
                <div class="favorite-info">
                  <h3>{{favorite.name}}</h3>
                  
                  <!-- Configuration Details -->
                  <div class="config-details">
                    <ion-chip color="secondary" size="small">
                      <ion-icon name="musical-notes" slot="start"></ion-icon>
                      <ion-label>{{getWaveformLabel(favorite.waveform)}}</ion-label>
                    </ion-chip>
                    <ion-chip color="tertiary" size="small">
                      <ion-icon name="time" slot="start"></ion-icon>
                      <ion-label>{{favorite.duration}} min</ion-label>
                    </ion-chip>
                    <ion-chip color="medium" size="small">
                      <ion-icon name="volume-high" slot="start"></ion-icon>
                      <ion-label>{{favorite.volume}}%</ion-label>
                    </ion-chip>
                  </div>

                  <!-- Created Date -->
                  <div class="creation-date">
                    <ion-text color="medium">
                      <small>Guardado: {{formatDate(favorite.createdAt)}}</small>
                    </ion-text>
                  </div>

                  <!-- Quick Action Button -->
                  <ion-button 
                    expand="block" 
                    [fill]="favorite.isPlaying ? 'solid' : 'outline'"
                    [color]="favorite.isPlaying ? 'danger' : 'primary'"
                    class="action-button"
                    (click)="$event.stopPropagation(); toggleFavoritePlayback(favorite)">
                    <ion-icon [name]="favorite.isPlaying ? 'stop' : 'play'" slot="start"></ion-icon>
                    {{favorite.isPlaying ? 'Detener' : 'Reproducir'}}
                  </ion-button>

                </div>
              </ion-card-content>
            </ion-card>

            <!-- Sliding Delete Option -->
            <ion-item-options side="end">
              <ion-item-option color="danger" (click)="confirmDeleteFavorite(favorite)">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </div>

        <!-- Quick Clear All Button -->
        <div class="clear-section" *ngIf="favorites.length > 3">
          <ion-button 
            fill="outline" 
            color="medium" 
            expand="block"
            (click)="confirmClearAllFavorites()">
            <ion-icon name="trash" slot="start"></ion-icon>
            Limpiar todos los favoritos
          </ion-button>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">
            <ion-icon name="heart-outline"></ion-icon>
          </div>
          <h3>Sin favoritos guardados</h3>
          <p>Ve a la sección de <strong>Frecuencias</strong> y presiona el ❤️ para guardar tus configuraciones favoritas</p>
          <ion-button 
            fill="outline" 
            color="primary"
            routerLink="/tabs/manual-frequencies">
            <ion-icon name="pulse" slot="start"></ion-icon>
            Ir a Frecuencias
          </ion-button>
        </div>
      </ng-template>

    </ion-content>
  `,
  styles: [`
    .modern-header {
      ion-toolbar {
        --background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
        --color: white;
        height: 64px;
        box-shadow: 0 4px 20px rgba(233, 30, 99, 0.3);
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
      color: #ff4757;
      animation: heartBeat 2s infinite;
    }

    @keyframes heartBeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.1); }
      28% { transform: scale(1); }
      42% { transform: scale(1.1); }
      70% { transform: scale(1); }
    }

    .favorites-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 0;
    }

    .current-status {
      padding: 20px 20px 0;
    }

    .status-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #10b981;
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

    .favorites-container {
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

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .favorite-card {
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
      position: relative;
      overflow: hidden;
    }

    .favorite-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #e91e63, #f06292);
      opacity: 0.7;
    }

    .favorite-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      border-color: #e91e63;
    }

    .favorite-card.playing {
      border-color: #10b981;
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
    }

    .favorite-card.playing::before {
      background: linear-gradient(90deg, #10b981, #22c55e);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .frequency-display {
      background: linear-gradient(135deg, #e91e63, #f06292);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(233, 30, 99, 0.3);
    }

    .freq-number {
      font-size: 24px;
      font-weight: 700;
      display: block;
      line-height: 1;
    }

    .freq-unit {
      font-size: 12px;
      opacity: 0.9;
    }

    .play-status {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .play-icon {
      font-size: 36px;
      transition: all 0.3s;
    }

    .favorite-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .favorite-info h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--app-text);
      text-align: center;
    }

    .config-details {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .creation-date {
      text-align: center;
    }

    .action-button {
      --border-radius: 16px;
      height: 44px;
      font-weight: 600;
      margin-top: auto;
    }

    .clear-section {
      margin-top: 32px;
      padding: 20px;
      background: rgba(239, 68, 68, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 120px;
      color: #e91e63;
      margin-bottom: 24px;
      opacity: 0.3;
    }

    .empty-state h3 {
      margin: 0 0 16px 0;
      color: var(--app-text);
      font-weight: 600;
      font-size: 24px;
    }

    .empty-state p {
      margin: 0 0 32px 0;
      color: var(--app-text-medium);
      font-size: 16px;
      line-height: 1.6;
      max-width: 400px;
    }

    ion-item-sliding {
      --background: transparent;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .favorites-container {
        padding: 16px;
      }

      .favorites-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .section-header h2 {
        font-size: 24px;
      }

      .config-details {
        justify-content: flex-start;
      }

      .card-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .status-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .empty-icon {
        font-size: 80px;
      }

      .empty-state h3 {
        font-size: 20px;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonIcon, IonButton,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol,
    IonChip, IonText, IonItemSliding, IonItemOptions,
    IonItemOption, IonProgressBar
  ]
})
export class FavoritesPage implements OnInit, OnDestroy {
  favorites: FavoriteFrequency[] = [];
  currentlyPlaying: FavoriteFrequency | null = null;
  private playStartTime: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private favoritesService: FavoritesService,
    private audioService: AudioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      heart, heartOutline, playCircle, stopCircle, close, 
      trash, musicalNotes, pulse, volumeHigh, time,
      pauseCircle, play, stop 
    });
  }

  ngOnInit() {
    // Subscribe to favorites changes
    this.subscription.add(
      this.favoritesService.favorites$.subscribe(favorites => {
        this.favorites = favorites;
        this.currentlyPlaying = favorites.find(f => f.isPlaying) || null;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAllFavorites();
  }

  trackByFavorite(index: number, favorite: FavoriteFrequency): string {
    return favorite.id;
  }

  async toggleFavoritePlayback(favorite: FavoriteFrequency) {
    if (favorite.isPlaying) {
      this.stopFavorite(favorite);
    } else {
      await this.playFavorite(favorite);
    }
  }

  async playFavorite(favorite: FavoriteFrequency) {
    try {
      // Stop any currently playing sound
      this.audioService.stopSound();
      this.stopAllFavorites();

      // Play the favorite frequency
      await this.audioService.playFrequency(
        favorite.frequency,
        favorite.duration,
        favorite.volume,
        favorite.waveform,
        true // Force override
      );

      // Update playing status
      this.favoritesService.updateFavoritePlayingStatus(favorite.id, true);
      this.currentlyPlaying = favorite;
      this.playStartTime = Date.now();

      // Schedule automatic stop
      setTimeout(() => {
        this.stopFavorite(favorite);
      }, favorite.duration * 60 * 1000);

      // Show success toast
      await this.showToast(`Reproduciendo ${favorite.frequency} Hz`, 'success');

    } catch (error) {
      console.error('Error playing favorite:', error);
      await this.showToast('Error al reproducir el favorito', 'danger');
    }
  }

  stopFavorite(favorite: FavoriteFrequency) {
    this.audioService.stopSound();
    this.favoritesService.updateFavoritePlayingStatus(favorite.id, false);
    
    if (this.currentlyPlaying?.id === favorite.id) {
      this.currentlyPlaying = null;
      this.playStartTime = 0;
    }
  }

  stopCurrent() {
    if (this.currentlyPlaying) {
      this.stopFavorite(this.currentlyPlaying);
    }
  }

  private stopAllFavorites() {
    this.audioService.stopSound();
    this.favoritesService.stopAllFavorites();
    this.currentlyPlaying = null;
    this.playStartTime = 0;
  }

  async confirmDeleteFavorite(favorite: FavoriteFrequency) {
    const alert = await this.alertController.create({
      header: 'Eliminar Favorito',
      message: `¿Estás seguro de que quieres eliminar "${favorite.name}" de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteFavorite(favorite);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteFavorite(favorite: FavoriteFrequency) {
    // Stop if currently playing
    if (favorite.isPlaying) {
      this.stopFavorite(favorite);
    }

    const success = this.favoritesService.removeFavorite(favorite.id);
    if (success) {
      await this.showToast('Favorito eliminado', 'success');
    } else {
      await this.showToast('Error al eliminar favorito', 'danger');
    }
  }

  async confirmClearAllFavorites() {
    const alert = await this.alertController.create({
      header: 'Limpiar Favoritos',
      message: `¿Estás seguro de que quieres eliminar TODOS los favoritos? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          role: 'destructive',
          handler: () => {
            this.clearAllFavorites();
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllFavorites() {
    // Stop any playing sound
    this.stopAllFavorites();

    // Remove all favorites
    const favoritesToDelete = [...this.favorites];
    for (const favorite of favoritesToDelete) {
      this.favoritesService.removeFavorite(favorite.id);
    }

    await this.showToast('Todos los favoritos eliminados', 'success');
  }

  getWaveformLabel(waveform: string): string {
    const labels: { [key: string]: string } = {
      'sine': 'Senoidal',
      'square': 'Cuadrada',
      'triangle': 'Triangular',
      'sawtooth': 'Sierra'
    };
    return labels[waveform] || waveform;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    }
  }

  getRemainingTime(): string {
    if (!this.currentlyPlaying) return '';
    
    const elapsed = (Date.now() - this.playStartTime) / 1000 / 60; // minutos
    const remaining = Math.max(0, this.currentlyPlaying.duration - elapsed);
    
    if (remaining < 1) {
      return 'Menos de 1 minuto';
    }
    return `${Math.round(remaining)} minuto${remaining !== 1 ? 's' : ''}`;
  }

  getProgress(): number {
    if (!this.currentlyPlaying) return 0;
    
    const elapsed = (Date.now() - this.playStartTime) / 1000 / 60;
    const total = this.currentlyPlaying.duration;
    return Math.min(1, elapsed / total);
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
}