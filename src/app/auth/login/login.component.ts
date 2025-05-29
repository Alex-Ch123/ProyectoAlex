import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';  // Ajusta la ruta si es necesario

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']  // o .css si usas css
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  async login() {
    const success = await this.authService.login(this.email, this.password);
    if (success) {
      // Login exitoso: aquí podrías redirigir a otra página
      console.log('Usuario logueado');
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  }
}
