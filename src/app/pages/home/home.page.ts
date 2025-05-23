import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
         IonCardTitle, IonCardContent, IonIcon, IonButton, IonProgressBar,
         IonChip, IonLabel, IonText, IonGrid, IonRow, IonCol, IonBadge,
         IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption,
         IonCheckbox, IonItem, IonList, IonItemSliding, IonItemOptions,
         IonItemOption, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  musicalNotes, moon, pulse, statsChart, calendar, heart, 
  add, time, notifications, star, trendingUp, flame, leaf,
  checkmark, close, create, trash, play, pause, alarm,
  sunny, cafe, moon as moonIcon, bed, person, settings,
  analytics, today, chatbubble, happy, sad, thermometer,
  flash, water, bookmark, refresh
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { StatisticsService, UserStats } from '../../services/statistics.service';
import { WellnessDiaryService, DiaryEntry, MoodStats } from '../../services/wellness-diary.service';
import { ScheduledRoutinesService, ScheduledRoutine, RoutineTemplate } from '../../services/scheduled-routines.service';

@Component({
  selector: 'app-home',
  template: `
    <ion-header class="modern-header">
      <ion-toolbar color="primary">
        <ion-title class="header-title">
          <ion-icon name="pulse"></ion-icon>
          Terapia de Sonido
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content" fullscreen>
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-card">
          <h1 class="hero-title">Bienvenido a tu Bienestar</h1>
          <p class="hero-subtitle">Descubre el poder curativo del sonido y mejora tu bienestar diario</p>
          <div class="quick-stats">
            <div class="stat-item">
              <ion-icon name="flame"></ion-icon>
              <span>{{stats.currentStreak}} días</span>
              <small>Racha actual</small>
            </div>
            <div class="stat-item">
              <ion-icon name="time"></ion-icon>
              <span>{{stats.totalMinutes}}min</span>
              <small>Total</small>
            </div>
            <div class="stat-item">
              <ion-icon name="happy"></ion-icon>
              <span>{{moodStats.averageMood.toFixed(1)}}</span>
              <small>Estado promedio</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        
        <!-- Rutinas Programadas -->
        <ion-card class="routine-card feature-card">
          <ion-card-header>
            <div class="card-header-flex">
              <div>
                <ion-icon name="alarm" color="primary"></ion-icon>
                <ion-card-title>Rutinas Programadas</ion-card-title>
              </div>
              <ion-button fill="clear" size="small" (click)="openRoutineModal()">
                <ion-icon name="add"></ion-icon>
              </ion-button>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="routine-summary">
              <div class="routine-stats">
                <span class="stat-number">{{routineStats.active}}</span>
                <span class="stat-label">activas de {{routineStats.total}}</span>
              </div>
              <ion-progress-bar 
                [value]="routineStats.total > 0 ? routineStats.active / routineStats.total : 0"
                color="primary">
              </ion-progress-bar>
            </div>
            <div class="upcoming-routines" *ngIf="upcomingRoutines.length > 0">
              <h4>Próximas rutinas:</h4>
              <div class="routine-item" *ngFor="let routine of upcomingRoutines.slice(0, 2)">
                <div class="routine-info">
                  <strong>{{routine.name}}</strong>
                  <small>{{routine.time}} - {{getDaysText(routine.daysOfWeek)}}</small>
                </div>
                <ion-chip [color]="routine.isActive ? 'primary' : 'medium'" size="small">
                  {{routine.category}}
                </ion-chip>
              </div>
            </div>
            <ion-button expand="block" fill="outline" size="small" (click)="openRoutineModal()">
              Gestionar Rutinas
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Estadísticas Personales -->
        <ion-card class="stats-card feature-card">
          <ion-card-header>
            <div class="card-header-flex">
              <div>
                <ion-icon name="analytics" color="secondary"></ion-icon>
                <ion-card-title>Estadísticas</ion-card-title>
              </div>
              <ion-badge color="secondary">{{stats.totalSessions}}</ion-badge>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="progress-section">
              <div class="progress-header">
                <span>Meta Semanal</span>
                <span>{{Math.round(stats.weeklyProgress)}}%</span>
              </div>
              <ion-progress-bar 
                [value]="stats.weeklyProgress / 100"
                color="secondary">
              </ion-progress-bar>
            </div>
            
            <div class="stats-grid">
              <div class="stat-box">
                <ion-icon name="trending-up"></ion-icon>
                <div>
                  <strong>{{stats.mostUsedFrequency}}Hz</strong>
                  <small>Frecuencia favorita</small>
                </div>
              </div>
              <div class="stat-box">
                <ion-icon name="pulse"></ion-icon>
                <div>
                  <strong>{{stats.averageSessionLength}}min</strong>
                  <small>Promedio sesión</small>
                </div>
              </div>
            </div>

            <div class="trend-indicator" [ngClass]="moodStats.moodTrend">
              <ion-icon [name]="getTrendIcon(moodStats.moodTrend)"></ion-icon>
              <span>Estado de ánimo {{getTrendText(moodStats.moodTrend)}}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Diario de Bienestar -->
        <ion-card class="diary-card feature-card">
          <ion-card-header>
            <div class="card-header-flex">
              <div>
                <ion-icon name="heart" color="tertiary"></ion-icon>
                <ion-card-title>Diario de Bienestar</ion-card-title>
              </div>
              <ion-button fill="clear" size="small" (click)="openDiaryModal()">
                <ion-icon name="add"></ion-icon>
              </ion-button>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="mood-summary">
              <div class="mood-indicator">
                <ion-icon [name]="getMoodIcon(todayEntry?.mood || 'okay')" 
                         [color]="getMoodColor(todayEntry?.mood || 'okay')"></ion-icon>
                <span>{{getMoodText(todayEntry?.mood || 'okay')}}</span>
              </div>
              <div class="energy-bars">
                <div class="energy-bar">
                  <small>Energía</small>
                  <div class="bar-container">
                    <div class="bar-fill" [style.width.%]="(todayEntry?.energy || 5) * 10"></div>
                  </div>
                </div>
                <div class="energy-bar">
                  <small>Estrés</small>
                  <div class="bar-container">
                    <div class="bar-fill stress" [style.width.%]="(todayEntry?.stress || 5) * 10"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="insights-section" *ngIf="insights.length > 0">
              <h4>Insights:</h4>
              <div class="insight-item" *ngFor="let insight of insights.slice(0, 2)">
                {{insight}}
              </div>
            </div>

            <ion-button expand="block" fill="outline" size="small" (click)="openDiaryModal()">
              {{todayEntry ? 'Actualizar' : 'Registrar'}} Hoy
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Sonidos Recomendados por Hora -->
        <ion-card class="recommendations-card full-width">
          <ion-card-header>
            <ion-icon name="sunny" color="warning"></ion-icon>
            <ion-card-title>Sonidos Recomendados</ion-card-title>
            <p class="time-based-subtitle">Basado en la hora actual: {{currentTimeCategory}}</p>
          </ion-card-header>
          <ion-card-content>
            <div class="recommendation-tabs">
              <ion-segment [(ngModel)]="selectedTimeCategory" (ionChange)="onTimeCategoryChange()">
                <ion-segment-button value="morning">
                  <ion-icon name="sunny"></ion-icon>
                  <ion-label>Mañana</ion-label>
                </ion-segment-button>
                <ion-segment-button value="afternoon">
                  <ion-icon name="cafe"></ion-icon>
                  <ion-label>Tarde</ion-label>
                </ion-segment-button>
                <ion-segment-button value="evening">
                  <ion-icon name="moon"></ion-icon>
                  <ion-label>Noche</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>

            <div class="sound-recommendations">
              <div class="sound-card" *ngFor="let sound of getRecommendations(selectedTimeCategory)">
                <div class="sound-info">
                  <ion-icon [name]="sound.icon" [color]="sound.color"></ion-icon>
                  <div>
                    <h4>{{sound.name}}</h4>
                    <p>{{sound.description}}</p>
                    <small>{{sound.frequency}}Hz - {{sound.duration}}min</small>
                  </div>
                </div>
                <ion-button fill="clear" (click)="playRecommendedSound(sound)">
                  <ion-icon name="play"></ion-icon>
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <ion-button expand="block" color="primary" class="cta-button" routerLink="/tabs/manual-frequencies">
          <ion-icon name="pulse" slot="start"></ion-icon>
          Generar Frecuencia
        </ion-button>
      </div>

    </ion-content>

    <!-- Modal para Rutinas -->
    <ion-modal #routineModal [isOpen]="showRoutineModal">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Rutinas Programadas</ion-title>
            <ion-button fill="clear" slot="end" (click)="closeRoutineModal()">
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <div class="modal-section">
            <h3>Plantillas Rápidas</h3>
            <div class="template-grid">
              <div class="template-card" *ngFor="let template of routineTemplates">
                <div class="template-info">
                  <h4>{{template.name}}</h4>
                  <p>{{template.description}}</p>
                  <small>{{template.time}} - {{template.duration}}min</small>
                </div>
                <ion-button size="small" (click)="createFromTemplate(template)">
                  Crear
                </ion-button>
              </div>
            </div>
          </div>

          <div class="modal-section">
            <h3>Mis Rutinas</h3>
            <div class="routine-list" *ngIf="allRoutines.length > 0; else noRoutines">
              <div class="routine-item-detailed" *ngFor="let routine of allRoutines">
                <div class="routine-header">
                  <h4>{{routine.name}}</h4>
                  <div class="routine-controls">
                    <ion-button fill="clear" size="small" (click)="toggleRoutine(routine.id)">
                      <ion-icon [name]="routine.isActive ? 'pause' : 'play'"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" color="danger" size="small" (click)="deleteRoutine(routine.id)">
                      <ion-icon name="trash"></ion-icon>
                    </ion-button>
                  </div>
                </div>
                <p>{{routine.description}}</p>
                <div class="routine-details">
                  <span class="detail-chip">{{routine.time}}</span>
                  <span class="detail-chip">{{routine.frequency}}Hz</span>
                  <span class="detail-chip">{{routine.duration}}min</span>
                  <span class="detail-chip" [class.active]="routine.isActive">
                    {{routine.isActive ? 'Activa' : 'Inactiva'}}
                  </span>
                </div>
                <div class="days-indicator">
                  <span *ngFor="let day of routine.daysOfWeek" class="day-chip">
                    {{getDayName(day)}}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noRoutines>
              <div class="empty-state">
                <ion-icon name="alarm"></ion-icon>
                <p>No tienes rutinas programadas aún</p>
                <p>Crea una usando las plantillas de arriba</p>
              </div>
            </ng-template>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <!-- Modal para Diario -->
    <ion-modal #diaryModal [isOpen]="showDiaryModal">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Diario de Bienestar</ion-title>
            <ion-button fill="clear" slot="end" (click)="closeDiaryModal()">
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <form (ngSubmit)="saveDiaryEntry()">
            <div class="form-section">
              <h3>¿Cómo te sientes hoy?</h3>
              <div class="mood-selector">
                <button type="button" 
                        class="mood-button" 
                        *ngFor="let mood of moodOptions"
                        [class.selected]="diaryForm.mood === mood.value"
                        (click)="selectMood(mood.value)">
                  <ion-icon [name]="mood.icon" [color]="mood.color"></ion-icon>
                  <span>{{mood.label}}</span>
                </button>
              </div>
            </div>

            <div class="form-section">
              <ion-item>
                <ion-label>Nivel de Energía (1-10)</ion-label>
                <ion-input type="number" [(ngModel)]="diaryForm.energy" min="1" max="10" name="energy"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Nivel de Estrés (1-10)</ion-label>
                <ion-input type="number" [(ngModel)]="diaryForm.stress" min="1" max="10" name="stress"></ion-input>
              </ion-item>
            </div>

            <div class="form-section">
              <ion-item>
                <ion-textarea 
                  [(ngModel)]="diaryForm.notes" 
                  placeholder="¿Cómo fue tu día? ¿Qué sonidos usaste?"
                  rows="4"
                  name="notes">
                </ion-textarea>
              </ion-item>
            </div>

            <div class="form-section">
              <h4>Etiquetas</h4>
              <div class="tags-selector">
                <ion-chip 
                  *ngFor="let tag of predefinedTags"
                  [color]="diaryForm.tags.includes(tag) ? 'primary' : 'medium'"
                  (click)="toggleTag(tag)">
                  {{tag}}
                </ion-chip>
              </div>
            </div>

            <div class="form-actions">
              <ion-button expand="block" type="submit" [disabled]="!diaryForm.mood">
                Guardar Entrada
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    /* Header moderno */
    .modern-header {
      --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: white;
    }

    /* Contenido principal */
    .home-content {
      --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* Hero Section */
    .hero-section {
      padding: 24px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 24px;
    }

    .hero-card {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 8px 0;
      background: linear-gradient(45deg, #ffffff, #e3f2fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .quick-stats {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      ion-icon {
        font-size: 24px;
        color: #ffd54f;
      }

      span {
        font-size: 18px;
        font-weight: 700;
      }

      small {
        font-size: 12px;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    /* Dashboard Grid */
    .dashboard-grid {
      padding: 0 16px 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    /* Feature Cards */
    .feature-card {
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      > div {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      ion-icon {
        font-size: 24px;
      }

      ion-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
      }
    }

    /* Routine Card Specific */
    .routine-summary {
      margin-bottom: 16px;
    }

    .routine-stats {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .stat-number {
        font-size: 24px;
        font-weight: 800;
        color: #667eea;
      }

      .stat-label {
        color: #666;
        font-size: 14px;
      }
    }

    .routine-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .routine-info {
        flex: 1;

        strong {
          display: block;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        small {
          color: #666;
          font-size: 12px;
        }
      }
    }

    /* Stats Card */
    .progress-section {
      margin-bottom: 20px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12px;

      ion-icon {
        font-size: 20px;
        color: #667eea;
      }

      strong {
        display: block;
        font-size: 16px;
        color: #2c3e50;
      }

      small {
        font-size: 12px;
        color: #666;
      }
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;

      &.improving {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      &.stable {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }

      &.declining {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
    }

    /* Diary Card */
    .mood-summary {
      margin-bottom: 20px;
    }

    .mood-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;

      ion-icon {
        font-size: 32px;
      }
    }

    .energy-bars {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .energy-bar {
      display: flex;
      align-items: center;
      gap: 12px;

      small {
        width: 60px;
        font-size: 12px;
        font-weight: 600;
        color: #666;
      }

      .bar-container {
        flex: 1;
        height: 6px;
        background: #eee;
        border-radius: 3px;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 3px;
          transition: width 0.3s ease;

          &.stress {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          }
        }
      }
    }

    .insights-section {
      margin: 16px 0;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 8px 0;
      }

      .insight-item {
        background: rgba(102, 126, 234, 0.05);
        padding: 8px 12px;
        border-radius: 8px;
        margin-bottom: 6px;
        font-size: 13px;
        color: #2c3e50;
        border-left: 3px solid #667eea;
      }
    }

    /* Recommendations */
    .time-based-subtitle {
      color: #666;
      font-size: 14px;
      margin: 4px 0 0 0;
      font-weight: 500;
    }

    .recommendation-tabs {
      margin-bottom: 20px;

      ion-segment {
        --background: rgba(102, 126, 234, 0.1);
        border-radius: 12px;
      }

      ion-segment-button {
        --color: #667eea;
        --color-checked: white;
        --background-checked: #667eea;
        --border-radius: 8px;
        margin: 4px;
      }
    }

    .sound-recommendations {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sound-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: rgba(255,255,255,0.7);
      border-radius: 16px;
      border: 1px solid rgba(102, 126, 234, 0.1);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255,255,255,0.9);
        transform: translateX(4px);
      }

      .sound-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;

        ion-icon {
          font-size: 28px;
        }

        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 700;
          color: #2c3e50;
        }

        p {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #666;
        }

        small {
          font-size: 12px;
          color: #999;
          font-weight: 500;
        }
      }
    }

    /* Quick Actions */
    .quick-actions {
      padding: 24px 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-button {
      height: 56px;
      font-size: 18px;
      font-weight: 700;
      --border-radius: 16px;
      --box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }

    /* Modal Styles */
    .modal-content {
      --background: #f8f9fa;
    }

    .modal-section {
      padding: 24px 16px;
      margin-bottom: 16px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 700;
        color: #2c3e50;
      }
    }

    .template-grid {
      display: grid;
      gap: 12px;
    }

    .template-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      border: 1px solid #eee;

      .template-info {
        flex: 1;

        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        p {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #666;
        }

        small {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .routine-item-detailed {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid #eee;

      .routine-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        .routine-controls {
          display: flex;
          gap: 4px;
        }
      }

      p {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #666;
      }

      .routine-details {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;

        .detail-chip {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.active {
            background: #667eea;
            color: white;
          }
        }
      }

      .days-indicator {
        display: flex;
        gap: 4px;

        .day-chip {
          background: rgba(118, 75, 162, 0.1);
          color: #764ba2;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;

      ion-icon {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        margin: 8px 0;
      }
    }

    /* Diary Modal */
    .form-section {
      margin-bottom: 24px;

      h3, h4 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }

      h4 {
        font-size: 16px;
      }
    }

    .mood-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 12px;
    }

    .mood-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      background: white;
      border: 2px solid #eee;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &.selected {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }

      ion-icon {
        font-size: 32px;
      }

      span {
        font-size: 12px;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .tags-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .form-actions {
      padding: 24px 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        padding: 0 12px 24px;
        gap: 16px;
      }

      .hero-section {
        padding: 16px 12px;
      }

      .hero-title {
        font-size: 24px;
      }

      .quick-stats {
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .sound-card {
        .sound-info {
          gap: 12px;

          ion-icon {
            font-size: 24px;
          }
        }
      }

      .mood-selector {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .recommendation-tabs ion-segment-button {
        padding: 8px 4px;
        
        ion-label {
          font-size: 12px;
        }
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonIcon, IonButton, IonProgressBar, IonChip, IonLabel,
    IonText, IonGrid, IonRow, IonCol, IonBadge,
    IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonCheckbox, IonItem, IonList, IonItemSliding, IonItemOptions,
    IonItemOption, IonSegment, IonSegmentButton
  ]
})
export class HomePage implements OnInit, OnDestroy {
  // Estados principales
  stats: UserStats = {
    totalSessions: 0,
    totalMinutes: 0,
    averageSessionLength: 0,
    mostUsedFrequency: 440,
    mostUsedWaveform: 'sine',
    favoriteActivity: 'relax',
    weeklyGoal: 300,
    weeklyProgress: 0,
    currentStreak: 0,
    longestStreak: 0
  };

  moodStats: MoodStats = {
    averageMood: 0,
    averageEnergy: 0,
    averageStress: 0,
    totalEntries: 0,
    moodTrend: 'stable',
    commonTags: []
  };

  // Control de modales
  showRoutineModal = false;
  showDiaryModal = false;

  // Datos de rutinas
  allRoutines: ScheduledRoutine[] = [];
  upcomingRoutines: any[] = [];
  routineStats = { total: 0, active: 0, byCategory: {}, mostUsedTime: '07:00' };
  routineTemplates = this.scheduledRoutinesService.routineTemplates;

  // Datos del diario
  todayEntry: DiaryEntry | null = null;
  insights: string[] = [];
  predefinedTags = this.wellnessDiaryService.predefinedTags;

  // Formulario del diario
  diaryForm = {
    mood: '' as DiaryEntry['mood'] | '',
    energy: 5,
    stress: 5,
    notes: '',
    tags: [] as string[],
    soundsUsed: [] as string[],
    sessionDuration: 0
  };

  // Opciones de estado de ánimo
  moodOptions = [
    { value: 'excellent' as const, label: 'Excelente', icon: 'happy', color: 'success' },
    { value: 'good' as const, label: 'Bien', icon: 'happy-outline', color: 'primary' },
    { value: 'okay' as const, label: 'Regular', icon: 'remove', color: 'warning' },
    { value: 'bad' as const, label: 'Mal', icon: 'sad-outline', color: 'danger' },
    { value: 'terrible' as const, label: 'Terrible', icon: 'sad', color: 'danger' }
  ];

  // Recomendaciones de sonido
  selectedTimeCategory: 'morning' | 'afternoon' | 'evening' = 'morning';
  currentTimeCategory: string = 'Mañana';

  private subscriptions = new Subscription();

  constructor(
    private statisticsService: StatisticsService,
    private wellnessDiaryService: WellnessDiaryService,
    private scheduledRoutinesService: ScheduledRoutinesService
  ) {
    addIcons({ 
      musicalNotes, moon, pulse, statsChart, calendar, heart, 
      add, time, notifications, star, trendingUp, flame, leaf,
      checkmark, close, create, trash, play, pause, alarm,
      sunny, cafe, moonIcon, bed, person, settings,
      analytics, today, chatbubble, happy, sad, thermometer,
      flash, water, bookmark, refresh
    });
  }

  ngOnInit() {
    this.initializeData();
    this.setCurrentTimeCategory();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeData() {
    // Suscribirse a estadísticas
    this.subscriptions.add(
      this.statisticsService.stats$.subscribe(stats => {
        this.stats = stats;
      })
    );

    // Suscribirse a estadísticas del diario
    this.subscriptions.add(
      this.wellnessDiaryService.stats$.subscribe(stats => {
        this.moodStats = stats;
      })
    );

  // Suscribirse a rutinas
    this.subscriptions.add(
      this.scheduledRoutinesService.routines$.subscribe((routines: ScheduledRoutine[]) => {
        this.allRoutines = routines;
        this.updateRoutineData();
      })
    );

    // Obtener entrada de hoy
    this.todayEntry = this.wellnessDiaryService.getEntryByDate(new Date());
    if (this.todayEntry) {
      this.populateDiaryForm();
    }

    // Obtener insights
    this.insights = this.wellnessDiaryService.getInsights();
  }

  private updateRoutineData() {
    this.routineStats = this.scheduledRoutinesService.getRoutineStats();
    this.upcomingRoutines = this.scheduledRoutinesService.getUpcomingRoutines(3);
  }

  private setCurrentTimeCategory() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      this.selectedTimeCategory = 'morning';
      this.currentTimeCategory = 'Mañana';
    } else if (hour >= 12 && hour < 18) {
      this.selectedTimeCategory = 'afternoon';
      this.currentTimeCategory = 'Tarde';
    } else {
      this.selectedTimeCategory = 'evening';
      this.currentTimeCategory = 'Noche';
    }
  }

  // Métodos de rutinas
  openRoutineModal() {
    this.showRoutineModal = true;
  }

  closeRoutineModal() {
    this.showRoutineModal = false;
  }

  createFromTemplate(template: RoutineTemplate) {
    this.scheduledRoutinesService.createFromTemplate(template);
  }

  toggleRoutine(id: string) {
    this.scheduledRoutinesService.toggleRoutine(id);
  }

  deleteRoutine(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      this.scheduledRoutinesService.deleteRoutine(id);
    }
  }

  getDaysText(daysOfWeek: number[]): string {
    return daysOfWeek.map(day => this.getDayName(day)).join(', ');
  }

  getDayName(dayIndex: number): string {
    return this.scheduledRoutinesService.getDayName(dayIndex);
  }

  // Métodos del diario
  openDiaryModal() {
    this.showDiaryModal = true;
  }

  closeDiaryModal() {
    this.showDiaryModal = false;
    this.resetDiaryForm();
  }

  selectMood(mood: DiaryEntry['mood']) {
    this.diaryForm.mood = mood;
  }

  toggleTag(tag: string) {
    const index = this.diaryForm.tags.indexOf(tag);
    if (index > -1) {
      this.diaryForm.tags.splice(index, 1);
    } else {
      this.diaryForm.tags.push(tag);
    }
  }

  saveDiaryEntry() {
    if (!this.diaryForm.mood) return;

    const entryData = {
      mood: this.diaryForm.mood,
      energy: this.diaryForm.energy,
      stress: this.diaryForm.stress,
      notes: this.diaryForm.notes,
      tags: this.diaryForm.tags,
      soundsUsed: this.diaryForm.soundsUsed,
      sessionDuration: this.diaryForm.sessionDuration
    };

    if (this.todayEntry) {
      this.wellnessDiaryService.updateEntry(this.todayEntry.id, entryData);
    } else {
      this.wellnessDiaryService.addEntry(entryData);
    }

    this.closeDiaryModal();
    
    // Actualizar datos
    this.todayEntry = this.wellnessDiaryService.getEntryByDate(new Date());
    this.insights = this.wellnessDiaryService.getInsights();
  }

  private populateDiaryForm() {
    if (this.todayEntry) {
      this.diaryForm = {
        mood: this.todayEntry.mood,
        energy: this.todayEntry.energy,
        stress: this.todayEntry.stress,
        notes: this.todayEntry.notes,
        tags: [...this.todayEntry.tags],
        soundsUsed: [...this.todayEntry.soundsUsed],
        sessionDuration: this.todayEntry.sessionDuration
      };
    }
  }

  private resetDiaryForm() {
    this.diaryForm = {
      mood: '',
      energy: 5,
      stress: 5,
      notes: '',
      tags: [],
      soundsUsed: [],
      sessionDuration: 0
    };
  }

  // Métodos de utilidad
  getMoodIcon(mood: DiaryEntry['mood'] | 'okay'): string {
    const moodMap = {
      'excellent': 'happy',
      'good': 'happy-outline',
      'okay': 'remove',
      'bad': 'sad-outline',
      'terrible': 'sad'
    };
    return moodMap[mood] || 'remove';
  }

  getMoodColor(mood: DiaryEntry['mood'] | 'okay'): string {
    const colorMap = {
      'excellent': 'success',
      'good': 'primary',
      'okay': 'warning',
      'bad': 'danger',
      'terrible': 'danger'
    };
    return colorMap[mood] || 'warning';
  }

  getMoodText(mood: DiaryEntry['mood'] | 'okay'): string {
    const textMap = {
      'excellent': 'Excelente',
      'good': 'Bien',
      'okay': 'Regular',
      'bad': 'Mal',
      'terrible': 'Terrible'
    };
    return textMap[mood] || 'Regular';
  }

  getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
    const trendMap = {
      'improving': 'trending-up',
      'stable': 'trending-up',
      'declining': 'trending-down'
    };
    return trendMap[trend];
  }

  getTrendText(trend: 'improving' | 'stable' | 'declining'): string {
    const textMap = {
      'improving': 'mejorando',
      'stable': 'estable',
      'declining': 'en declive'
    };
    return textMap[trend];
  }

  // Recomendaciones de sonido
  onTimeCategoryChange() {
    // Se actualiza automáticamente por el binding
  }

  getRecommendations(timeCategory: string) {
    const recommendations = {
      morning: [
        {
          name: 'Energía Matutina',
          description: 'Frecuencias para despertar y energizar',
          frequency: 528,
          duration: 15,
          icon: 'sunny',
          color: 'warning'
        },
        {
          name: 'Concentración',
          description: 'Tonos binaurales para enfocar',
          frequency: 40,
          duration: 30,
          icon: 'pulse',
          color: 'primary'
        }
      ],
      afternoon: [
        {
          name: 'Productividad',
          description: 'Mantén el rendimiento alto',
          frequency: 432,
          duration: 20,
          icon: 'flash',
          color: 'secondary'
        },
        {
          name: 'Relajación Activa',
          description: 'Reduce el estrés sin perder energía',
          frequency: 396,
          duration: 10,
          icon: 'leaf',
          color: 'success'
        }
      ],
      evening: [
        {
          name: 'Descompresión',
          description: 'Libera la tensión del día',
          frequency: 174,
          duration: 25,
          icon: 'moon',
          color: 'tertiary'
        },
        {
          name: 'Preparación Sueño',
          description: 'Induce la relajación profunda',
          frequency: 285,
          duration: 45,
          icon: 'bed',
          color: 'dark'
        }
      ]
    };

    return recommendations[timeCategory as keyof typeof recommendations] || recommendations.morning;
  }

  playRecommendedSound(sound: any) {
    // Aquí podrías integrar con el AudioService
    console.log('Reproduciendo sonido recomendado:', sound);
    // Por ejemplo: this.audioService.playFrequency(sound.frequency, sound.duration, 50, 'sine');
  }
}