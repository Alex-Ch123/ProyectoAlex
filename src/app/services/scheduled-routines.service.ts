import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ScheduledRoutine {
  id: string;
  name: string;
  description: string;
  time: string; // formato HH:MM
  frequency: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  duration: number; // minutos
  volume: number; // 0-100
  daysOfWeek: number[]; // 0=Domingo, 1=Lunes, etc.
  isActive: boolean;
  category: 'morning' | 'work' | 'evening' | 'sleep' | 'custom';
  soundType: 'tone' | 'nature' | 'white-noise' | 'binaural';
  createdAt: Date;
  lastTriggered?: Date;
}

export interface RoutineTemplate {
  name: string;
  description: string;
  category: ScheduledRoutine['category'];
  time: string;
  frequency: number;
  waveform: ScheduledRoutine['waveform'];
  duration: number;
  volume: number;
  daysOfWeek: number[];
  soundType: ScheduledRoutine['soundType'];
}

@Injectable({
  providedIn: 'root'
})
export class ScheduledRoutinesService {
  private readonly STORAGE_KEY = 'scheduled_routines';
  
  private routines: ScheduledRoutine[] = [];
  private routinesSubject = new BehaviorSubject<ScheduledRoutine[]>([]);
  private activeRoutineSubject = new BehaviorSubject<ScheduledRoutine | null>(null);
  
  public routines$ = this.routinesSubject.asObservable();
  public activeRoutine$ = this.activeRoutineSubject.asObservable();

  // Plantillas predefinidas para rutinas comunes
  public readonly routineTemplates: RoutineTemplate[] = [
    {
      name: 'Despertar Suave',
      description: 'Sonidos relajantes para comenzar el día',
      category: 'morning',
      time: '07:00',
      frequency: 528,
      waveform: 'sine',
      duration: 10,
      volume: 30,
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
      soundType: 'tone'
    },
    {
      name: 'Enfoque Matutino',
      description: 'Tonos para mejorar la concentración',
      category: 'work',
      time: '09:00',
      frequency: 40,
      waveform: 'sine',
      duration: 30,
      volume: 40,
      daysOfWeek: [1, 2, 3, 4, 5],
      soundType: 'binaural'
    },
    {
      name: 'Descanso de Mediodía',
      description: 'Relajación durante el almuerzo',
      category: 'work',
      time: '12:30',
      frequency: 432,
      waveform: 'sine',
      duration: 15,
      volume: 35,
      daysOfWeek: [1, 2, 3, 4, 5],
      soundType: 'white-noise'
    },
    {
      name: 'Relajación Vespertina',
      description: 'Sonidos para descomprimir después del trabajo',
      category: 'evening',
      time: '18:00',
      frequency: 396,
      waveform: 'sine',
      duration: 20,
      volume: 45,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      soundType: 'nature'
    },
    {
      name: 'Preparación para Dormir',
      description: 'Sonidos para inducir el sueño',
      category: 'sleep',
      time: '22:00',
      frequency: 174,
      waveform: 'sine',
      duration: 45,
      volume: 25,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      soundType: 'white-noise'
    }
  ];

  private checkInterval: any;

  constructor() {
    this.loadRoutines();
    this.startRoutineChecker();
  }

  addRoutine(routineData: Omit<ScheduledRoutine, 'id' | 'createdAt'>): void {
    const routine: ScheduledRoutine = {
      ...routineData,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    this.routines.push(routine);
    this.saveRoutines();
    this.routinesSubject.next([...this.routines]);
  }

  updateRoutine(id: string, updates: Partial<ScheduledRoutine>): void {
    const index = this.routines.findIndex(routine => routine.id === id);
    if (index !== -1) {
      this.routines[index] = { ...this.routines[index], ...updates };
      this.saveRoutines();
      this.routinesSubject.next([...this.routines]);
    }
  }

  deleteRoutine(id: string): void {
    this.routines = this.routines.filter(routine => routine.id !== id);
    this.saveRoutines();
    this.routinesSubject.next([...this.routines]);
  }

  toggleRoutine(id: string): void {
    const routine = this.routines.find(r => r.id === id);
    if (routine) {
      this.updateRoutine(id, { isActive: !routine.isActive });
    }
  }

  getActiveRoutines(): ScheduledRoutine[] {
    return this.routines.filter(routine => routine.isActive);
  }

  getRoutinesByCategory(category: ScheduledRoutine['category']): ScheduledRoutine[] {
    return this.routines.filter(routine => routine.category === category);
  }

  getUpcomingRoutines(limit: number = 5): ScheduledRoutine[] {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const upcoming = this.getActiveRoutines()
      .map(routine => {
        const [hours, minutes] = routine.time.split(':').map(Number);
        const routineTime = hours * 60 + minutes;
        
        // Encontrar la próxima ocurrencia
        let nextDay = currentDay;
        let nextTime = routineTime;
        let daysUntil = 0;

        // Si es hoy pero ya pasó la hora, buscar el próximo día
        if (nextTime <= currentTime || !routine.daysOfWeek.includes(currentDay)) {
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (routine.daysOfWeek.includes(checkDay)) {
              nextDay = checkDay;
              daysUntil = i;
              break;
            }
          }
        }

        return {
          ...routine,
          nextOccurrence: new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000),
          daysUntil
        };
      })
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
      .slice(0, limit);

    return upcoming;
  }

  private startRoutineChecker(): void {
    // Verificar cada minuto si hay rutinas que ejecutar
    this.checkInterval = setInterval(() => {
      this.checkForDueRoutines();
    }, 60000); // 60 segundos
  }

  private checkForDueRoutines(): void {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const dueRoutines = this.getActiveRoutines().filter(routine => {
      return routine.daysOfWeek.includes(currentDay) && 
             routine.time === currentTime &&
             (!routine.lastTriggered || 
              routine.lastTriggered.toDateString() !== now.toDateString());
    });

    dueRoutines.forEach(routine => {
      this.triggerRoutine(routine);
    });
  }

  private triggerRoutine(routine: ScheduledRoutine): void {
    // Actualizar última ejecución
    this.updateRoutine(routine.id, { lastTriggered: new Date() });
    
    // Emitir la rutina activa
    this.activeRoutineSubject.next(routine);
    
    // Auto-limpiar después de la duración
    setTimeout(() => {
      this.activeRoutineSubject.next(null);
    }, routine.duration * 60 * 1000);
  }

  createFromTemplate(template: RoutineTemplate): void {
    this.addRoutine({
      ...template,
      isActive: true
    });
  }

  getDayName(dayIndex: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex];
  }

  getRoutineStats(): {
    total: number;
    active: number;
    byCategory: Record<string, number>;
    mostUsedTime: string;
  } {
    const total = this.routines.length;
    const active = this.getActiveRoutines().length;
    
    const byCategory = this.routines.reduce((acc, routine) => {
      acc[routine.category] = (acc[routine.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeCount = this.routines.reduce((acc, routine) => {
      acc[routine.time] = (acc[routine.time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTime = Object.keys(timeCount).reduce((a, b) => 
      timeCount[a] > timeCount[b] ? a : b, '07:00');

    return { total, active, byCategory, mostUsedTime };
  }

  private loadRoutines(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.routines = JSON.parse(stored).map((routine: any) => ({
        ...routine,
        createdAt: new Date(routine.createdAt),
        lastTriggered: routine.lastTriggered ? new Date(routine.lastTriggered) : undefined
      }));
      this.routinesSubject.next([...this.routines]);
    }
  }

  private saveRoutines(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.routines));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // Limpiar todos los datos
  clearAllData(): void {
    this.routines = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.routinesSubject.next([]);
  }
}