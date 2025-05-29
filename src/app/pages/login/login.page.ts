import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonCard, IonCardContent, IonTitle } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="login-contenido" fullscreen>
      <ion-card class="login-card">
        <ion-card-content>
          <ion-title class="login-titulo">Bienvenido</ion-title>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <ion-input
              class="login-input"
              label="Correo electrónico"
              type="email"
              formControlName="email"
              required
              fill="outline"
              placeholder="usuario@correo.com"
            ></ion-input>
            <ion-input
              class="login-input"
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
              [disabled]="loginForm.invalid"
              class="login-boton"
            >Iniciar sesión</ion-button>
            <div *ngIf="loginError" class="login-error">
              Usuario o contraseña incorrectos
            </div>
            <div class="register-link">
              ¿No tienes cuenta? <a routerLink="/register">Regístrate</a>
            </div>
          </form>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .login-contenido {
      --background: #f6f8fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f6f8fa 0%, #e9eef5 100%);
    }
    .login-card {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      padding: 32px 24px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
    }
    .login-titulo {
      text-align: center;
      margin-bottom: 32px;
      color: #1a1a1a;
      font-weight: 700;
      font-size: 24px;
    }
    .login-input {
      margin-bottom: 20px;
      --border-radius: 12px;
      --padding-start: 16px;
    }
    .login-boton {
      margin-top: 16px;
      --background: linear-gradient(135deg, #0077ff 0%, #00bfff 100%);
      --border-radius: 12px;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,119,255,0.3);
    }
    .register-link {
      text-align: center;
      margin-top: 24px;
      color: #666;
    }
    .register-link a {
      color: #0077ff;
      text-decoration: none;
      font-weight: 500;
    }
    .login-error {
      color: #ff3b30;
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonTitle
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  loginError = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        console.log('Iniciando sesión con:', { email, password });

        const success = await this.authService.login(email, password);

        if (success) {
          console.log('Login exitoso');
          await this.router.navigate(['/tabs/home']);
        } else {
          this.loginError = true;
        }
      } catch (error) {
        console.error('Error en login:', error);
        this.loginError = true;
      }
    }
  }
}
