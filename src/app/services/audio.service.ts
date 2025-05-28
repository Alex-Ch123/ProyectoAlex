import { Injectable } from '@angular/core';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type SoundType = 'nature' | 'pink' | 'white' | 'frequency';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTimeout: any = null;
  private currentSoundInfo: string = '';

  // Sound file paths - Updated to correct path
  private soundFiles = {
    nature: 'assets/sounds/NatureSound.mp3',
    pink: 'assets/sounds/PinkSound.mp3',
    white: 'assets/sounds/WhiteSound.mp3'
  };

  // Volume adjustments for specific sounds
  private soundVolumeAdjustments = {
    nature: 0.3, // Reduce nature sound volume to 30% of requested volume
    pink: 1.0,   // Normal volume
    white: 1.0   // Normal volume
  };

  constructor() {}

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Check if any sound is currently playing
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentSoundInfo(): string {
    return this.currentSoundInfo;
  }

  // Force stop any currently playing sound
  stopSound(): void {
    console.log('Stopping all audio...');
    
    // Stop audio element if playing
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = ''; // Clear source to free memory
        this.audioElement.load(); // Reset the audio element
      } catch (error) {
        console.warn('Error stopping audio element:', error);
      }
      this.audioElement = null;
    }

    // Stop oscillator if playing
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
        console.warn('Oscillator already stopped');
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        console.warn('Gain node already disconnected');
      }
      this.gainNode = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        console.warn('Analyser already disconnected');
      }
      this.analyser = null;
    }

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    this.isPlaying = false;
    this.currentSoundInfo = '';
    console.log('All audio stopped successfully');
  }

  // Play sound files (MP3)
  async playSoundFile(
    soundType: 'nature' | 'pink' | 'white',
    duration: number,
    volume: number,
    force: boolean = false
  ): Promise<void> {
    
    // Check if another sound is playing (unless forced)
    if (this.isPlaying && !force) {
      throw new Error(`Ya hay un sonido reproduciéndose: ${this.currentSoundInfo}. Detén el sonido actual antes de reproducir otro.`);
    }

    // Stop any current sound first
    this.stopSound();

    // Verify file path exists
    const soundPath = this.soundFiles[soundType];
    if (!soundPath) {
      throw new Error(`Tipo de sonido desconocido: ${soundType}`);
    }

    try {
      // Apply volume adjustment for specific sounds
      const adjustedVolume = volume * (this.soundVolumeAdjustments[soundType] || 1.0);
      
      this.audioElement = new Audio();
      
      // Add error handling before setting src
      this.audioElement.onerror = (error) => {
        console.error('Audio element error:', error);
        this.stopSound();
        throw new Error(`Error al cargar el archivo de audio: ${soundPath}`);
      };

      this.audioElement.oncanplay = () => {
        console.log(`Audio file loaded successfully: ${soundPath}`);
      };

      this.audioElement.src = soundPath;
      this.audioElement.loop = true;
      this.audioElement.volume = Math.max(0, Math.min(1, adjustedVolume / 100));

      // Set current sound info
      this.currentSoundInfo = this.getSoundDisplayName(soundType);

      // Test if file can be loaded
      await new Promise((resolve, reject) => {
        this.audioElement!.addEventListener('canplaythrough', resolve, { once: true });
        this.audioElement!.addEventListener('error', reject, { once: true });
        this.audioElement!.load();
      });

      // Play the audio
      await this.audioElement.play();
      this.isPlaying = true;

      console.log(`Playing ${soundType} sound for ${duration} minutes at ${volume}% volume (adjusted to ${adjustedVolume}%)`);

      // Stop after duration (convert minutes to milliseconds)
      if (duration > 0) {
        this.currentTimeout = setTimeout(() => {
          this.stopSound();
        }, duration * 60 * 1000);
      }

    } catch (error) {
      console.error('Error playing sound file:', error);
      this.stopSound(); // Clean up on error
      
      // More specific error messages
      if (error instanceof Error && error.message.includes('network')) {
        throw new Error(`No se pudo cargar el archivo ${soundPath}. Verifica tu conexión a internet.`);
      } else if (error instanceof Error && error.message.includes('decode')) {
        throw new Error(`El archivo ${soundPath} está dañado o en un formato no compatible.`);
      } else {
        throw new Error(`No se pudo reproducir el sonido ${soundType}. Archivo: ${soundPath}`);
      }
    }
  }

  // Play frequency (oscillator)
  async playFrequency(
    frequency: number, 
    duration: number, 
    volume: number, 
    waveform: WaveformType = 'sine',
    force: boolean = false
  ): Promise<void> {
    
    // Check if another sound is playing (unless forced)
    if (this.isPlaying && !force) {
      throw new Error(`Ya hay un sonido reproduciéndose: ${this.currentSoundInfo}. Detén el sonido actual antes de reproducir otro.`);
    }

    // Stop any current sound first
    this.stopSound();

    const audioContext = this.initAudioContext();

    try {
      // Resume audio context if suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create oscillator
      this.oscillator = audioContext.createOscillator();
      this.gainNode = audioContext.createGain();
      this.analyser = audioContext.createAnalyser();

      // Configure oscillator
      this.oscillator.type = waveform;
      this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Configure gain (volume)
      const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
      this.gainNode.gain.setValueAtTime(normalizedVolume, audioContext.currentTime);

      // Configure analyser for visualization
      this.analyser.fftSize = 2048;

      // Connect nodes
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(audioContext.destination);

      // Set current sound info
      this.currentSoundInfo = `${frequency}Hz - ${waveform}`;

      // Start playing
      this.oscillator.start();
      this.isPlaying = true;

      console.log(`Playing ${frequency}Hz ${waveform} wave for ${duration} minutes at ${volume}% volume`);

      // Stop after duration
      if (duration > 0) {
        this.currentTimeout = setTimeout(() => {
          this.stopSound();
        }, duration * 60 * 1000);
      }

    } catch (error) {
      console.error('Error playing frequency:', error);
      this.stopSound(); // Clean up on error
      throw new Error(`No se pudo reproducir la frecuencia ${frequency}Hz.`);
    }
  }

  // Universal play method for routines
  async playRoutineSound(
    soundType: string,
    frequency: number | undefined,
    duration: number,
    volume: number,
    force: boolean = true // Routines can override current sound
  ): Promise<void> {
    console.log(`Attempting to play routine sound: ${soundType}`);
    
    try {
      switch (soundType) {
        case 'morning':
        case 'nature':
          await this.playSoundFile('nature', duration, volume, force);
          break;
        case 'night':
        case 'pink-noise':
          await this.playSoundFile('pink', duration, volume, force);
          break;
        case 'white-noise':
          await this.playSoundFile('white', duration, volume, force);
          break;
        case 'brown-noise':
          // Use low frequency sine wave for brown noise simulation
          await this.playFrequency(60, duration, volume, 'sine', force);
          break;
        case 'frequency':
          if (frequency) {
            await this.playFrequency(frequency, duration, volume, 'sine', force);
          } else {
            throw new Error('Frecuencia no especificada para tipo frequency');
          }
          break;
        default:
          console.warn('Unknown sound type:', soundType);
          // Default to nature sound
          await this.playSoundFile('nature', duration, volume, force);
      }
    } catch (error) {
      console.error('Error playing routine sound:', error);
      throw error;
    }
  }

  private getSoundDisplayName(soundType: string): string {
    const displayNames: { [key: string]: string } = {
      'nature': 'Sonidos de Naturaleza',
      'pink': 'Ruido Rosa',
      'white': 'Ruido Blanco'
    };
    return displayNames[soundType] || soundType;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
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
}