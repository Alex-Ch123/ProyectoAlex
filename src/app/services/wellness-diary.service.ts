import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DiaryEntry {
  id: string;
  date: Date;
  mood: 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';
  energy: number; // 1-10
  stress: number; // 1-10
  notes: string;
  soundsUsed: string[];
  sessionDuration: number;
  tags: string[];
}

export interface MoodStats {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  totalEntries: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  commonTags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WellnessDiaryService {
  private readonly STORAGE_KEY = 'wellness_diary_entries';
  
  private entries: DiaryEntry[] = [];
  private entriesSubject = new BehaviorSubject<DiaryEntry[]>([]);
  private statsSubject = new BehaviorSubject<MoodStats>(this.getDefaultStats());
  
  public entries$ = this.entriesSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  // Etiquetas predefinidas para facilitar el uso
  public readonly predefinedTags = [
    'Relajado', 'Concentrado', 'Energético', 'Tranquilo', 'Meditativo',
    'Estresado', 'Ansioso', 'Feliz', 'Cansado', 'Motivado',
    'Trabajo', 'Estudio', 'Sueño', 'Dolor de cabeza', 'Ejercicio'
  ];

  constructor() {
    this.loadEntries();
    this.updateStats();
  }

  private getDefaultStats(): MoodStats {
    return {
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      totalEntries: 0,
      moodTrend: 'stable',
      commonTags: []
    };
  }

  addEntry(entryData: Omit<DiaryEntry, 'id' | 'date'>): void {
    const entry: DiaryEntry = {
      ...entryData,
      id: this.generateId(),
      date: new Date()
    };
    
    this.entries.push(entry);
    this.saveEntries();
    this.updateStats();
    this.entriesSubject.next([...this.entries]);
  }

  updateEntry(id: string, updates: Partial<DiaryEntry>): void {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.entries[index] = { ...this.entries[index], ...updates };
      this.saveEntries();
      this.updateStats();
      this.entriesSubject.next([...this.entries]);
    }
  }

  deleteEntry(id: string): void {
    this.entries = this.entries.filter(entry => entry.id !== id);
    this.saveEntries();
    this.updateStats();
    this.entriesSubject.next([...this.entries]);
  }

  getEntries(limit?: number): DiaryEntry[] {
    const sorted = this.entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getEntriesThisWeek(): DiaryEntry[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.entries.filter(entry => entry.date >= oneWeekAgo);
  }

  getEntryByDate(date: Date): DiaryEntry | null {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return this.entries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    }) || null;
  }

  getMoodTrendData(days: number = 7): { date: string, mood: number, energy: number, stress: number }[] {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEntry = this.entries.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      });
      
      result.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        mood: dayEntry ? this.moodToNumber(dayEntry.mood) : 0,
        energy: dayEntry ? dayEntry.energy : 0,
        stress: dayEntry ? dayEntry.stress : 0
      });
    }
    
    return result;
  }

  private moodToNumber(mood: DiaryEntry['mood']): number {
    const moodMap = {
      'terrible': 1,
      'bad': 2,
      'okay': 3,
      'good': 4,
      'excellent': 5
    };
    return moodMap[mood] || 3;
  }

  private updateStats(): void {
    if (this.entries.length === 0) {
      this.statsSubject.next(this.getDefaultStats());
      return;
    }

    const totalEntries = this.entries.length;
    const averageMood = this.entries.reduce((sum, entry) => 
      sum + this.moodToNumber(entry.mood), 0) / totalEntries;
    const averageEnergy = this.entries.reduce((sum, entry) => 
      sum + entry.energy, 0) / totalEntries;
    const averageStress = this.entries.reduce((sum, entry) => 
      sum + entry.stress, 0) / totalEntries;

    // Calcular tendencia (comparar últimas 2 semanas)
    const recentEntries = this.getEntriesThisWeek();
    const previousWeekEntries = this.entries.filter(entry => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return entry.date >= twoWeeksAgo && entry.date < oneWeekAgo;
    });

    let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentEntries.length > 0 && previousWeekEntries.length > 0) {
      const recentAvgMood = recentEntries.reduce((sum, entry) => 
        sum + this.moodToNumber(entry.mood), 0) / recentEntries.length;
      const previousAvgMood = previousWeekEntries.reduce((sum, entry) => 
        sum + this.moodToNumber(entry.mood), 0) / previousWeekEntries.length;
      
      const difference = recentAvgMood - previousAvgMood;
      if (difference > 0.3) moodTrend = 'improving';
      else if (difference < -0.3) moodTrend = 'declining';
    }

    // Etiquetas más comunes
    const tagCount = this.entries.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const commonTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    const stats: MoodStats = {
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      averageStress: Math.round(averageStress * 10) / 10,
      totalEntries,
      moodTrend,
      commonTags
    };

    this.statsSubject.next(stats);
  }

  private loadEntries(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.entries = JSON.parse(stored).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      this.entriesSubject.next([...this.entries]);
    }
  }

  private saveEntries(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Método para obtener insights basados en los datos
  getInsights(): string[] {
    const insights: string[] = [];
    const stats = this.statsSubject.value;
    
    if (stats.totalEntries === 0) return ['¡Comienza a registrar tu bienestar para obtener insights personalizados!'];

    if (stats.moodTrend === 'improving') {
      insights.push('¡Tu estado de ánimo ha mejorado esta semana! 📈');
    } else if (stats.moodTrend === 'declining') {
      insights.push('Tu estado de ánimo ha bajado un poco. Considera usar sonidos relajantes. 🎵');
    }

    if (stats.averageStress > 7) {
      insights.push('Tus niveles de estrés están altos. Te recomendamos sesiones de relajación. 🧘‍♀️');
    }

    if (stats.averageEnergy < 4) {
      insights.push('Tu energía ha estado baja. Prueba sonidos energizantes por las mañanas. ☀️');
    }

    if (stats.commonTags.includes('Concentrado')) {
      insights.push('Las sesiones de sonido te ayudan con la concentración. ¡Sigue así! 🎯');
    }

    return insights.length > 0 ? insights : ['Continúa registrando tu bienestar para obtener más insights. 📊'];
  }

  // Limpiar todos los datos
  clearAllData(): void {
    this.entries = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateStats();
    this.entriesSubject.next([]);
  }
}