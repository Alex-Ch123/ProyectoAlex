import { Injectable } from '@angular/core';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

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

  constructor() {}

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
    waveform: WaveformType = 'sine'
  ): Promise<void> {
    if (this.isPlaying) {
      this.stopSound();
    }

    const audioContext = this.initAudioContext();

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

    // Start playing
    this.oscillator.start();
    this.isPlaying = true;

    // Stop after duration
    if (duration > 0) {
      this.currentTimeout = setTimeout(() => {
        this.stopSound();
      }, duration * 60 * 1000); // Convert minutes to milliseconds
    }
  }

  stopSound(): void {
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
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
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