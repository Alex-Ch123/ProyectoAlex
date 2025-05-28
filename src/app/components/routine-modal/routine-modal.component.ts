import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, 
         IonLabel, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonRange,
         IonText, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { RoutineService } from '../../services/routine.service';
import { addIcons } from 'ionicons';
import { close, checkmark, time, musicalNotes, volumeHigh } from 'ionicons/icons';

@Component({
  selector: 'app-routine-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva Rutina Programada</ion-title>
        <ion-button slot="end" fill="clear" (click)="dismiss()">
          <ion-icon name="close"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="routineForm" (ngSubmit)="saveRoutine()">
        
        <!-- Basic Info -->
        <ion-card class="form-section">
          <ion-card-content>
            <h3>Información Básica</h3>
            
            <ion-item>
              <ion-label position="stacked">Nombre de la rutina</ion-label>
              <ion-input
                formControlName="name"
                placeholder="Ej: Despertar relajante"
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">
                <ion-icon name="time"></ion-icon>
                Hora
              </ion-label>
              <ion-input
                type="time"
                formControlName="time"
                required>
              </ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Days Selection -->
        <ion-card class="form-section">
          <ion-card-content>
            <h3>Días de la semana</h3>
            <ion-grid>
              <ion-row>
                <ion-col size="auto" *ngFor="let day of weekDays">
                  <ion-checkbox
                    [checked]="selectedDays.includes(day.value)"
                    (ionChange)="toggleDay(day.value)">
                  </ion-checkbox>
                  <ion-label class="day-label">{{day.label}}</ion-label>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Sound Configuration -->
        <ion-card class="form-section">
          <ion-card-content>
            <h3>
              <ion-icon name="musical-notes"></ion-icon>
              Configuración de Sonido
            </h3>

            <ion-item>
              <ion-label position="stacked">Tipo de sonido</ion-label>
              <ion-select formControlName="soundType" placeholder="Selecciona un tipo">
                <ion-select-option value="morning">Sonidos Matutinos (Naturaleza)</ion-select-option>
                <ion-select-option value="night">Relajación Nocturna (Ruido Rosa)</ion-select-option>
                <ion-select-option value="frequency">Frecuencia Específica</ion-select-option>
                <ion-select-option value="white-noise">Ruido Blanco</ion-select-option>
                <ion-select-option value="pink-noise">Ruido Rosa</ion-select-option>
                <ion-select-option value="brown-noise">Ruido Marrón</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item *ngIf="routineForm.get('soundType')?.value === 'frequency'">
              <ion-label position="stacked">Frecuencia (Hz)</ion-label>
              <ion-input
                type="number"
                formControlName="frequency"
                placeholder="440"
                min="20"
                max="20000">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Duración (minutos)</ion-label>
              <ion-range
                formControlName="duration"
                min="1"
                max="60"
                pin="true"
                snaps="true"
                [value]="routineForm.get('duration')?.value">
                <ion-label slot="start">1</ion-label>
                <ion-label slot="end">60</ion-label>
              </ion-range>
              <ion-text>
                <p>{{routineForm.get('duration')?.value}} minutos</p>
              </ion-text>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">
                <ion-icon name="volume-high"></ion-icon>
                Volumen
              </ion-label>
              <ion-range
                formControlName="volume"
                min="10"
                max="100"
                pin="true"
                [value]="routineForm.get('volume')?.value">
                <ion-label slot="start">10%</ion-label>
                <ion-label slot="end">100%</ion-label>
              </ion-range>
              <ion-text>
                <p>{{routineForm.get('volume')?.value}}%</p>
              </ion-text>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Preview & Save -->
        <div class="form-actions">
          <ion-button
            expand="block"
            type="submit"
            [disabled]="routineForm.invalid || selectedDays.length === 0"
            class="save-button">
            <ion-icon name="checkmark" slot="start"></ion-icon>
            Guardar Rutina
          </ion-button>
        </div>

      </form>
    </ion-content>
  `,
  styles: [`
    .form-section {
      margin-bottom: 20px;
      border-radius: 16px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: var(--ion-color-primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .day-label {
      margin-left: 8px;
      font-size: 14px;
    }

    ion-col {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .form-actions {
      padding: 20px 0;
    }

    .save-button {
      height: 48px;
      font-weight: 600;
      --border-radius: 12px;
    }

    ion-item {
      --padding-start: 0;
      --padding-end: 0;
      margin-bottom: 16px;
    }

    ion-range {
      padding: 16px 0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem,
    IonLabel, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonRange,
    IonText, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon
  ]
})
export class RoutineModalComponent implements OnInit {
  routineForm: FormGroup;
  selectedDays: string[] = [];
  
  weekDays = [
    { label: 'L', value: 'Lun' },
    { label: 'M', value: 'Mar' },
    { label: 'X', value: 'Mié' },
    { label: 'J', value: 'Jue' },
    { label: 'V', value: 'Vie' },
    { label: 'S', value: 'Sáb' },
    { label: 'D', value: 'Dom' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private routineService: RoutineService
  ) {
    addIcons({ close, checkmark, time, musicalNotes, volumeHigh });
    
    this.routineForm = this.fb.group({
      name: ['', Validators.required],
      time: ['', Validators.required],
      soundType: ['', Validators.required],
      frequency: [440],
      duration: [10],
      volume: [50]
    });
  }

  ngOnInit() {
    // Request notification permission when modal opens
    this.routineService.requestNotificationPermission();
  }

  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
  }

  async saveRoutine() {
    if (this.routineForm.valid && this.selectedDays.length > 0) {
      const formValue = this.routineForm.value;
      
      const routine = {
        name: formValue.name,
        time: formValue.time,
        days: this.selectedDays,
        soundType: formValue.soundType,
        frequency: formValue.frequency,
        duration: formValue.duration,
        volume: formValue.volume,
        isActive: true
      };

      this.routineService.addRoutine(routine);
      await this.modalController.dismiss(routine);
    }
  }

  async dismiss() {
    await this.modalController.dismiss();
  }
}