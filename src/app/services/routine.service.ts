import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';

export interface ScheduledRoutine {
  id: string;
  name: string;
  time: string;
  days: string[];
  soundType: string;
  frequency?: number;
  duration: number;
  volume: number;
  isActive: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routines: ScheduledRoutine[] = [];
  private storageKey = 'sound_therapy_routines';
  private scheduledTimeouts: Map<string, number> = new Map(); // Cambiado a 'number'
  private activeRoutines: Set<string> = new Set(); // Track active routines to prevent duplicates

  constructor(private audioService: AudioService) {
    this.loadRoutines();
    this.scheduleAllActiveRoutines();
  }

  getScheduledRoutines(): ScheduledRoutine[] {
    return this.routines;
  }

  addRoutine(routine: Omit<ScheduledRoutine, 'id' | 'createdAt'>): ScheduledRoutine {
    const newRoutine: ScheduledRoutine = {
      ...routine,
      id: this.generateId(),
      createdAt: new Date()
    };

    this.routines.push(newRoutine);
    this.saveRoutines();
    
    if (newRoutine.isActive) {
      this.scheduleRoutine(newRoutine);
    }

    return newRoutine;
  }

  updateRoutine(id: string, updates: Partial<ScheduledRoutine>): boolean {
    const index = this.routines.findIndex(r => r.id === id);
    if (index === -1) return false;

    // Clear existing schedule for this routine
    this.clearRoutineSchedule(id);

    this.routines[index] = { ...this.routines[index], ...updates };
    this.saveRoutines();
    
    // Reschedule if active
    if (this.routines[index].isActive) {
      this.scheduleRoutine(this.routines[index]);
    }

    return true;
  }

  deleteRoutine(id: string): boolean {
    const index = this.routines.findIndex(r => r.id === id);
    if (index === -1) return false;

    // Clear any scheduled timeouts for this routine
    this.clearRoutineSchedule(id);
    
    // Stop audio if this routine is currently playing
    if (this.activeRoutines.has(id)) {
      this.audioService.stopSound();
      this.activeRoutines.delete(id);
    }

    this.routines.splice(index, 1);
    this.saveRoutines();
    
    console.log(`Routine ${id} deleted and all associated timeouts cleared`);
    return true;
  }

  toggleRoutine(id: string): boolean {
    const routine = this.routines.find(r => r.id === id);
    if (!routine) return false;

    routine.isActive = !routine.isActive;
    this.saveRoutines();

    if (routine.isActive) {
      this.scheduleRoutine(routine);
    } else {
      this.clearRoutineSchedule(id);
      // Stop audio if this routine is currently playing
      if (this.activeRoutines.has(id)) {
        this.audioService.stopSound();
        this.activeRoutines.delete(id);
      }
    }

    return true;
  }

  private scheduleAllActiveRoutines() {
    // Clear all existing timeouts first
    this.clearAllSchedules();
    
    this.routines.filter(r => r.isActive).forEach(routine => {
      this.scheduleRoutine(routine);
    });
  }

  private scheduleRoutine(routine: ScheduledRoutine) {
    if (!routine.isActive) return;

    // Clear any existing schedule for this routine first
    this.clearRoutineSchedule(routine.id);

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    
    // Schedule for each day of the week
    routine.days.forEach(day => {
      const dayIndex = dayNames.indexOf(day);
      if (dayIndex === -1) return;

      const [hours, minutes] = routine.time.split(':').map(Number);
      
      // Calculate next occurrence of this time on this day
      let scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);
      
      // Calculate days until target day
      const currentDay = now.getDay();
      let daysUntilTarget = (dayIndex - currentDay + 7) % 7;
      
      // If it's the same day but time has passed, schedule for next week
      if (daysUntilTarget === 0 && scheduleTime <= now) {
        daysUntilTarget = 7;
      }
      
      scheduleTime.setDate(now.getDate() + daysUntilTarget);
      
      const timeUntilTrigger = scheduleTime.getTime() - now.getTime();
      
      if (timeUntilTrigger > 0) {
        const timeoutKey = `${routine.id}-${day}`;
        
        const timeoutId = window.setTimeout(() => {
          this.triggerRoutine(routine);
        }, timeUntilTrigger);
        
        this.scheduledTimeouts.set(timeoutKey, timeoutId);
        
        const hoursUntil = Math.floor(timeUntilTrigger / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntilTrigger % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`Routine "${routine.name}" scheduled for ${day} at ${routine.time} (in ${hoursUntil}h ${minutesUntil}m)`);
      }
    });
  }

  private clearRoutineSchedule(routineId: string) {
    const keysToDelete: string[] = [];
    
    for (const [key, timeoutId] of this.scheduledTimeouts.entries()) {
      if (key.startsWith(routineId + '-')) {
        window.clearTimeout(timeoutId);
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.scheduledTimeouts.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cleared ${keysToDelete.length} timeouts for routine ${routineId}`);
    }
  }

  private clearAllSchedules() {
    for (const timeoutId of this.scheduledTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    this.scheduledTimeouts.clear();
    this.activeRoutines.clear();
    console.log('All scheduled timeouts cleared');
  }

  private async triggerRoutine(routine: ScheduledRoutine) {
    // Prevent duplicate triggers
    if (this.activeRoutines.has(routine.id)) {
      console.log(`Routine ${routine.id} is already active, skipping trigger`);
      return;
    }

    console.log(`Triggering routine: ${routine.name}`);
    this.activeRoutines.add(routine.id);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Rutina: ${routine.name}`, {
        body: `Es hora de tu sesión de ${this.getSoundTypeDisplayName(routine.soundType)} (${routine.duration} min)`,
        icon: '/assets/icon/favicon.png',
        tag: `routine-${routine.id}`,
        requireInteraction: true
      });
    }

    // Play the actual sound
    try {
      await this.audioService.playRoutineSound(
        routine.soundType,
        routine.frequency,
        routine.duration,
        routine.volume,
        true // Force override any existing sound
      );
      
      console.log(`Successfully started playing routine: ${routine.name}`);
      
      // Set a timeout to clean up the active routine after the duration
      window.setTimeout(() => {
        this.activeRoutines.delete(routine.id);
        console.log(`Routine ${routine.id} finished playing`);
      }, routine.duration * 60 * 1000);
      
    } catch (error) {
      console.error(`Error playing routine sound for "${routine.name}":`, error);
      this.activeRoutines.delete(routine.id); // Remove from active on error
      
      // Show error notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Error en rutina: ${routine.name}`, {
          body: 'No se pudo reproducir el sonido. Verifica los archivos de audio.',
          icon: '/assets/icon/favicon.png',
          tag: `routine-error-${routine.id}`
        });
      }
    }

    // Schedule next occurrence (next week)
    if (routine.isActive && this.routines.find(r => r.id === routine.id)) {
      window.setTimeout(() => {
        if (routine.isActive) {
          this.scheduleRoutine(routine);
        }
      }, 1000); // Wait 1 second before rescheduling to avoid conflicts
    }
  }

  private getSoundTypeDisplayName(soundType: string): string {
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

  private loadRoutines() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.routines = JSON.parse(stored);
        // Convert createdAt strings back to Date objects
        this.routines.forEach(routine => {
          routine.createdAt = new Date(routine.createdAt);
        });
      } catch (error) {
        console.error('Error loading routines:', error);
        this.routines = [];
      }
    }
  }

  private saveRoutines() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.routines));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notifications are denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Method to clean up on service destruction
  destroy() {
    this.clearAllSchedules();
  }
}