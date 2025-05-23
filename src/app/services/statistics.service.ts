import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionData {
  id: string;
  date: Date;
  duration: number; // minutos
  frequency: number;
  waveform: string;
  activity: string; // 'study', 'sleep', 'relax', 'meditation'
  mood: string; // 'great', 'good', 'okay', 'bad'
  notes: string;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  mostUsedFrequency: number;
  mostUsedWaveform: string;
  favoriteActivity: string;
  weeklyGoal: number;
  weeklyProgress: number;
  currentStreak: number;
  longestStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly STORAGE_KEY = 'sound_therapy_sessions';
  private readonly STATS_KEY = 'sound_therapy_stats';
  
  private sessions: SessionData[] = [];
  private statsSubject = new BehaviorSubject<UserStats>(this.getDefaultStats());
  
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.loadSessions();
    this.updateStats();
  }

  private getDefaultStats(): UserStats {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      mostUsedFrequency: 440,
      mostUsedWaveform: 'sine',
      favoriteActivity: 'relax',
      weeklyGoal: 300, // 5 horas por semana
      weeklyProgress: 0,
      currentStreak: 0,
      longestStreak: 0
    };
  }

  addSession(sessionData: Omit<SessionData, 'id' | 'date'>): void {
    const session: SessionData = {
      ...sessionData,
      id: this.generateId(),
      date: new Date()
    };
    
    this.sessions.push(session);
    this.saveSessions();
    this.updateStats();
  }

  getSessions(limit?: number): SessionData[] {
    const sorted = this.sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getSessionsThisWeek(): SessionData[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.sessions.filter(session => session.date >= oneWeekAgo);
  }

  getSessionsToday(): SessionData[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.sessions.filter(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
  }

  getDailyStats(days: number = 7): { date: string, minutes: number }[] {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayMinutes = this.sessions
        .filter(session => {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === date.getTime();
        })
        .reduce((total, session) => total + session.duration, 0);
      
      result.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        minutes: dayMinutes
      });
    }
    
    return result;
  }

  private updateStats(): void {
    if (this.sessions.length === 0) {
      this.statsSubject.next(this.getDefaultStats());
      return;
    }

    const totalSessions = this.sessions.length;
    const totalMinutes = this.sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = totalMinutes / totalSessions;

    // Frecuencia más usada
    const frequencyCount = this.sessions.reduce((acc, session) => {
      acc[session.frequency] = (acc[session.frequency] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostUsedFrequency = parseInt(Object.keys(frequencyCount)
      .reduce((a, b) => frequencyCount[parseInt(a)] > frequencyCount[parseInt(b)] ? a : b));

    // Forma de onda más usada
    const waveformCount = this.sessions.reduce((acc, session) => {
      acc[session.waveform] = (acc[session.waveform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedWaveform = Object.keys(waveformCount)
      .reduce((a, b) => waveformCount[a] > waveformCount[b] ? a : b);

    // Actividad favorita
    const activityCount = this.sessions.reduce((acc, session) => {
      acc[session.activity] = (acc[session.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteActivity = Object.keys(activityCount)
      .reduce((a, b) => activityCount[a] > activityCount[b] ? a : b);

    // Progreso semanal
    const weeklyMinutes = this.getSessionsThisWeek()
      .reduce((sum, session) => sum + session.duration, 0);
    
    const weeklyGoal = 300; // 5 horas
    const weeklyProgress = Math.min((weeklyMinutes / weeklyGoal) * 100, 100);

    // Racha actual y más larga
    const { currentStreak, longestStreak } = this.calculateStreaks();

    const stats: UserStats = {
      totalSessions,
      totalMinutes,
      averageSessionLength: Math.round(averageSessionLength),
      mostUsedFrequency,
      mostUsedWaveform,
      favoriteActivity,
      weeklyGoal,
      weeklyProgress,
      currentStreak,
      longestStreak
    };

    this.statsSubject.next(stats);
    this.saveStats(stats);
  }

  private calculateStreaks(): { currentStreak: number, longestStreak: number } {
    const sortedDates = [...new Set(this.sessions.map(s => 
      new Date(s.date).toDateString()
    ))].sort();

    if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar si la racha actual sigue activa
    if (sortedDates.includes(today) || sortedDates.includes(yesterday.toDateString())) {
      currentStreak = 1;
      
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const currentDate = new Date(sortedDates[i + 1]);
        const previousDate = new Date(sortedDates[i]);
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calcular la racha más larga
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private loadSessions(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.sessions = JSON.parse(stored).map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }));
    }
  }

  private saveSessions(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions));
  }

  private saveStats(stats: UserStats): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Método para limpiar datos (útil para desarrollo)
  clearAllData(): void {
    this.sessions = [];
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
    this.updateStats();
  }
}