import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { WellnessDiaryService } from './wellness-diary.service';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface PlaybackSession {
  startTime: Date;
  frequency: number;
  waveform: WaveformType;
  volume: number;
  duration: number;
  activity: string;
  isCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private currentTimeout: any = null;
  private currentSession: PlaybackSession | null = null;

  // Observables para el estado
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentSessionSubject = new BehaviorSubject<PlaybackSession | null>(null);
  private volumeSubject = new BehaviorSubject<number>(50);

  public isPlaying$ = this.isPlayingSubject.asObservable();
  public currentSession$ = this.currentSessionSubject.asObservable();
  public volume$ = this.volumeSubject.asObservable();

  constructor(
    private statisticsService: StatisticsService,
    private wellnessDiaryService: WellnessDiaryService
  ) {}

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async playFrequency(
    frequency: number, 
    duration: number, 
    volume: number, 
    waveform: WaveformType = 'sine',
    activity: string = 'manual'
  ): Promise<void> {
    if (this.isPlaying) {
      this.stopSound();
    }

    const audioContext = this.initAudioContext();
    
    // Resume audio context if suspended (required by browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Crear sesión de reproducción
    this.currentSession = {
      startTime: new Date(),
      frequency,
      waveform,
      volume,
      duration,
      activity,
      isCompleted: false
    };

    // Create oscillator
    this.oscillator = audioContext.createOscillator();
    this.gainNode = audioContext.createGain();
    this.analyser = audioContext.createAnalyser();

    // Configure oscillator
    this.oscillator.type = waveform;
    this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Configure gain (volume) with smooth transitions
    const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
    this.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(normalizedVolume, audioContext.currentTime + 0.1);

    // Configure analyser for visualization
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect nodes
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(audioContext.destination);

    // Start playing
    this.oscillator.start();
    this.isPlaying = true;
    this.isPlayingSubject.next(true);
    this.currentSessionSubject.next(this.currentSession);
    this.volumeSubject.next(volume);

    // Programar fade out antes de terminar
    if (duration > 0) {
      const fadeOutTime = Math.min(2, duration * 60 * 0.1); // 10% de la duración o 2 segundos máximo
      const stopTime = duration * 60 * 1000; // Convertir minutos a milisegundos
      
      // Fade out
      setTimeout(() => {
        if (this.gainNode && this.isPlaying) {
          const currentTime = this.audioContext!.currentTime;
          this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutTime);
        }
      }, stopTime - (fadeOutTime * 1000));

      // Stop después de duration
      this.currentTimeout = setTimeout(() => {
        this.stopSound(true);
      }, stopTime);
    }

    // Handle oscillator end
    this.oscillator.onended = () => {
      if (this.currentSession && !this.currentSession.isCompleted) {
        this.completeSession();
      }
    };
  }

  stopSound(isCompleted: boolean = false): void {
    // Fade out suave antes de parar
    if (this.gainNode && this.isPlaying) {
      const currentTime = this.audioContext!.currentTime;
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);
    }

    setTimeout(() => {
      if (this.oscillator) {
        try {
          this.oscillator.stop();
          this.oscillator.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
        this.oscillator = null;
      }

      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }

      if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
      }

      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }

      this.isPlaying = false;
      this.isPlayingSubject.next(false);

      // Completar sesión si fue completada exitosamente
      if (isCompleted && this.currentSession) {
        this.completeSession();
      } else if (this.currentSession) {
        // Sesión interrumpida - solo guardar si duró más de 30 segundos
        const actualDuration = (new Date().getTime() - this.currentSession.startTime.getTime()) / 1000 / 60;
        if (actualDuration > 0.5) { // 30 segundos
          this.currentSession.duration = actualDuration;
          this.saveSession();
        }
      }

      this.currentSession = null;
      this.currentSessionSubject.next(null);
    }, 100);
  }

  private completeSession(): void {
    if (!this.currentSession) return;

    this.currentSession.isCompleted = true;
    this.saveSession();
  }

  private saveSession(): void {
    if (!this.currentSession) return;

    // Guardar en estadísticas
    this.statisticsService.addSession({
      duration: this.currentSession.duration,
      frequency: this.currentSession.frequency,
      waveform: this.currentSession.waveform,
      activity: this.currentSession.activity,
      mood: 'okay', // Valor por defecto, puede ser actualizado después
      notes: `Sesión de ${this.currentSession.waveform} a ${this.currentSession.frequency}Hz`
    });

    // Emitir eventos para notificaciones
    this.notifySessionCompleted();
  }

  private notifySessionCompleted(): void {
    if (!this.currentSession) return;

    // Aquí podrías emitir notificaciones push o mostrar mensajes
    console.log('Sesión completada:', {
      frequency: this.currentSession.frequency,
      duration: this.currentSession.duration,
      waveform: this.currentSession.waveform
    });

    // Si es una sesión larga (>5 min), sugerir registrar en el diario
    if (this.currentSession.duration >= 5) {
      this.suggestDiaryEntry();
    }
  }

  private suggestDiaryEntry(): void {
    // Emitir evento para sugerir entrada en el diario
    // Esto podría ser manejado por un componente toast o modal
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Sesión completada!', {
          body: '¿Cómo te sientes después de esta sesión? Registra tu bienestar.',
          icon: '/assets/icon/favicon.png'
        });
      }
    }, 1000);
  }

  // Métodos para rutinas programadas
  async playRoutine(routine: any): Promise<void> {
    await this.playFrequency(
      routine.frequency,
      routine.duration,
      routine.volume,
      routine.waveform,
      routine.category || 'routine'
    );
  }

  // Control de volumen en tiempo real
  setVolume(volume: number): void {
    if (this.gainNode && this.isPlaying) {
      const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
      const currentTime = this.audioContext!.currentTime;
      this.gainNode.gain.setValueAtTime(normalizedVolume, currentTime);
      this.volumeSubject.next(volume);
    }
  }

  // Control de frecuencia en tiempo real
  setFrequency(frequency: number): void {
    if (this.oscillator && this.isPlaying) {
      const currentTime = this.audioContext!.currentTime;
      this.oscillator.frequency.setValueAtTime(frequency, currentTime);
      
      if (this.currentSession) {
        this.currentSession.frequency = frequency;
        this.currentSessionSubject.next(this.currentSession);
      }
    }
  }

  // Métodos existentes para visualización
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentSession(): PlaybackSession | null {
    return this.currentSession;
  }

  // Generate waveform data for visualization
  getWaveformData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  // Generate frequency data for visualization
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Método para sonidos pregrabados/naturales
  async playNatureSound(soundType: 'rain' | 'ocean' | 'forest' | 'wind', volume: number = 50): Promise<void> {
    // Implementación para sonidos naturales pregrabados
    // Por ahora, simulamos con un tono suave
    const frequencyMap = {
      rain: 200,
      ocean: 150,
      forest: 300,
      wind: 100
    };

    await this.playFrequency(
      frequencyMap[soundType],
      10, // 10 minutos por defecto
      volume,
      'sine',
      `nature-${soundType}`
    );
  }

  // Método para tonos binaurales
  async playBinauralBeats(
    baseFrequency: number, 
    beatFrequency: number, 
    duration: number, 
    volume: number = 50
  ): Promise<void> {
    // Implementación simplificada de tonos binaurales
    // En una implementación completa, necesitarías crear dos osciladores para cada oído
    const leftEarFreq = baseFrequency;
    const rightEarFreq = baseFrequency + beatFrequency;
    
    // Por ahora, usar la frecuencia promedio
    const avgFrequency = (leftEarFreq + rightEarFreq) / 2;
    
    await this.playFrequency(
      avgFrequency,
      duration,
      volume,
      'sine',
      'binaural'
    );
  }

  // Configuraciones preestablecidas
  async playPreset(presetName: string): Promise<void> {
    const presets = {
      'deep-relaxation': { frequency: 174, duration: 20, volume: 40, waveform: 'sine' as WaveformType },
      'stress-relief': { frequency: 396, duration: 15, volume: 45, waveform: 'sine' as WaveformType },
      'healing': { frequency: 528, duration: 25, volume: 50, waveform: 'sine' as WaveformType },
      'focus': { frequency: 40, duration: 30, volume: 35, waveform: 'sine' as WaveformType },
      'sleep': { frequency: 285, duration: 45, volume: 25, waveform: 'sine' as WaveformType },
      'energy': { frequency: 741, duration: 10, volume: 55, waveform: 'triangle' as WaveformType }
    };

    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      await this.playFrequency(
        preset.frequency,
        preset.duration,
        preset.volume,
        preset.waveform,
        presetName
      );
    }
  }

  // Solicitar permisos de notificación
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Limpiar recursos
  destroy(): void {
    this.stopSound();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}