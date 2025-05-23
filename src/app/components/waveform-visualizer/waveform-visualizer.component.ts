import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AudioService, WaveformType } from '../../services/audio.service';

@Component({
  selector: 'app-waveform-visualizer',
  template: `
    <div class="visualizer-container">
      <canvas 
        #waveformCanvas 
        class="waveform-canvas"
        [width]="canvasWidth"
        [height]="canvasHeight">
      </canvas>
      <div class="visualizer-info">
        <span class="frequency-display">{{frequency}} Hz</span>
        <span class="waveform-display">{{waveformType | titlecase}}</span>
      </div>
    </div>
  `,
  styles: [`
    .visualizer-container {
      position: relative;
      width: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      padding: 16px;
      margin: 16px 0;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
    }

    .waveform-canvas {
      width: 100%;
      height: 120px;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .visualizer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      font-size: 14px;
      color: #ffffff;
    }

    .frequency-display {
      background: linear-gradient(135deg, #0077ff, #00bfff);
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
    }

    .waveform-display {
      background: rgba(255,255,255,0.1);
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
    }
  `],
  standalone: true,
  imports: [CommonModule, TitleCasePipe]
})
export class WaveformVisualizerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('waveformCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() frequency: number = 440;
  @Input() waveformType: WaveformType = 'sine';
  @Input() isPlaying: boolean = false;

  canvasWidth = 600;
  canvasHeight = 120;
  private animationFrame: number | null = null;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor(private audioService: AudioService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    this.drawWaveform();
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private startAnimation() {
    const animate = () => {
      this.drawWaveform();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private drawWaveform() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw grid
    this.drawGrid();

    if (this.isPlaying) {
      // Draw real-time waveform from audio analyser
      this.drawRealTimeWaveform();
    } else {
      // Draw theoretical waveform
      this.drawTheoreticalWaveform();
    }
  }

  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    // Horizontal center line
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvasHeight / 2);
    this.ctx.lineTo(this.canvasWidth, this.canvasHeight / 2);
    this.ctx.stroke();

    // Vertical lines
    for (let i = 0; i < this.canvasWidth; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvasHeight);
      this.ctx.stroke();
    }
  }

  private drawRealTimeWaveform() {
    const waveformData = this.audioService.getWaveformData();
    if (!waveformData) return;

    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = this.canvasWidth / waveformData.length;
    let x = 0;

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i] / 128.0;
      const y = v * this.canvasHeight / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();
  }

  private drawTheoreticalWaveform() {
    this.ctx.strokeStyle = this.isPlaying ? '#00ff88' : '#0077ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const amplitude = this.canvasHeight * 0.3;
    const centerY = this.canvasHeight / 2;
    const cycles = 3; // Number of cycles to show
    const angleStep = (cycles * 2 * Math.PI) / this.canvasWidth;

    for (let x = 0; x < this.canvasWidth; x++) {
      const angle = x * angleStep;
      let y: number;

      switch (this.waveformType) {
        case 'sine':
          y = centerY + amplitude * Math.sin(angle);
          break;
        case 'square':
          y = centerY + amplitude * (Math.sin(angle) >= 0 ? 1 : -1);
          break;
        case 'triangle':
          y = centerY + amplitude * (2 / Math.PI) * Math.asin(Math.sin(angle));
          break;
        case 'sawtooth':
          y = centerY + amplitude * (2 * (angle / (2 * Math.PI) - Math.floor(angle / (2 * Math.PI) + 0.5)));
          break;
        default:
          y = centerY;
      }

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }
}