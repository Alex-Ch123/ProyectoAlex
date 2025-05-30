import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WaveformType } from './audio.service';

export interface FavoriteFrequency {
  id: string;
  name: string;
  frequency: number;
  waveform: WaveformType;
  duration: number;
  volume: number;
  createdAt: Date;
  isPlaying?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private storageKey = 'sound_therapy_favorites';
  private favoritesSubject = new BehaviorSubject<FavoriteFrequency[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  getFavorites(): FavoriteFrequency[] {
    return this.favoritesSubject.value;
  }

  addFavorite(frequency: number, waveform: WaveformType, duration: number, volume: number): FavoriteFrequency {
    const favorites = this.getFavorites();
    
    // Check if this exact configuration already exists
    const existing = favorites.find(f => 
      f.frequency === frequency && 
      f.waveform === waveform && 
      f.duration === duration && 
      f.volume === volume
    );
    
    if (existing) {
      return existing; // Return existing instead of creating duplicate
    }

    const newFavorite: FavoriteFrequency = {
      id: this.generateId(),
      name: `${frequency} Hz - ${this.getWaveformLabel(waveform)}`,
      frequency,
      waveform,
      duration,
      volume,
      createdAt: new Date(),
      isPlaying: false
    };

    const updatedFavorites = [...favorites, newFavorite];
    this.saveFavorites(updatedFavorites);
    return newFavorite;
  }

  removeFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    const filteredFavorites = favorites.filter(f => f.id !== id);
    
    if (filteredFavorites.length !== favorites.length) {
      this.saveFavorites(filteredFavorites);
      return true;
    }
    return false;
  }

  isFavorite(frequency: number, waveform: WaveformType, duration: number, volume: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => 
      f.frequency === frequency && 
      f.waveform === waveform && 
      f.duration === duration && 
      f.volume === volume
    );
  }

  getFavoriteByConfig(frequency: number, waveform: WaveformType, duration: number, volume: number): FavoriteFrequency | undefined {
    const favorites = this.getFavorites();
    return favorites.find(f => 
      f.frequency === frequency && 
      f.waveform === waveform && 
      f.duration === duration && 
      f.volume === volume
    );
  }

  updateFavoritePlayingStatus(id: string, isPlaying: boolean): void {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.map(f => ({
      ...f,
      isPlaying: f.id === id ? isPlaying : false // Only one can be playing at a time
    }));
    this.saveFavorites(updatedFavorites);
  }

  stopAllFavorites(): void {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.map(f => ({
      ...f,
      isPlaying: false
    }));
    this.saveFavorites(updatedFavorites);
  }

  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const favorites = JSON.parse(stored);
        // Convert createdAt strings back to Date objects
        favorites.forEach((favorite: any) => {
          favorite.createdAt = new Date(favorite.createdAt);
          favorite.isPlaying = false; // Reset playing status on load
        });
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favoritesSubject.next([]);
    }
  }

  private saveFavorites(favorites: FavoriteFrequency[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getWaveformLabel(waveform: WaveformType): string {
    const labels = {
      'sine': 'Senoidal',
      'square': 'Cuadrada',
      'triangle': 'Triangular',
      'sawtooth': 'Sierra'
    };
    return labels[waveform] || waveform;
  }
}
