import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonCard, IonCardContent, IonTitle } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  template: `
    <ion-content class="register-contenido" fullscreen>
      <ion-card class="register-card">
        <ion-card-content>
          <ion-title class="register-titulo">Crear cuenta</ion-title>
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <ion-input
              class="register-input"
              label="Nombre"
              type="text"
              formControlName="name"
              required
              fill="outline"
              placeholder="Tu nombre"
            ></ion-input>
            <ion-input
              class="register-input"
              label="Correo electrónico"
              type="email"
              formControlName="email"
              required
              fill="outline"
              placeholder="usuario@correo.com"
            ></ion-input>
            <ion-input
              class="register-input"
              label="Contraseña"
              type="password"
              formControlName="password"
              required
              fill="outline"
              placeholder="••••••••"
            ></ion-input>
            <ion-button
              expand="block"
              type="submit"
              [disabled]="registerForm.invalid"
              class="register-boton"
            >Registrarse</ion-button>
            <div class="login-link">
              ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
            </div>
          </form>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .register-contenido {
      --background: #f6f8fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f6f8fa 0%, #e9eef5 100%);
    }
    .register-card {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      padding: 32px 24px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
    }
    .register-titulo {
      text-align: center;
      margin-bottom: 32px;
      color: #1a1a1a;
      font-weight: 700;
      font-size: 24px;
    }
    .register-input {
      margin-bottom: 20px;
      --border-radius: 12px;
      --padding-start: 16px;
    }
    .register-boton {
      margin-top: 16px;
      --background: linear-gradient(135deg, #0077ff 0%, #00bfff 100%);
      --border-radius: 12px;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,119,255,0.3);
    }
    .login-link {
      text-align: center;
      margin-top: 24px;
      color: #666;
      a {
        color: #0077ff;
        text-decoration: none;
        font-weight: 500;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonTitle,
    ReactiveFormsModule
  ]
})
export class RegisterPage {
  registerForm: FormGroup;
  loginError = false; // Agregar esta propiedad

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      try {
        console.log('Datos de registro:', this.registerForm.value);
        const success = await this.authService.register(this.registerForm.value);
        if (success) {
          console.log('Registro exitoso, redirigiendo...');
          this.router.navigate(['/tabs/home']);
        } else {
          console.log('Error en registro');
          this.loginError = true;
        }
      } catch (error) {
        console.error('Error en registro:', error);
        this.loginError = true;
      }
    }
  }
}
