import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  email: string;
  name?: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private defaultUser: User = {
    email: 'test@test.com',
    password: '123456',
    name: 'Usuario Test'
  };

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private users: User[] = [this.defaultUser]; // Usuarios en memoria

  async login(email: string, password: string): Promise<boolean> {
    console.log('Intento de login:', { email, password });
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserSubject.next(user);
      console.log('Login exitoso:', user);
      return true;
    }
    console.log('Login fallido');
    return false;
  }

  async register(userData: {email: string, password: string, name: string}): Promise<boolean> {
    console.log('Intento de registro:', userData);

    // Revisa si ya existe el email
    const exists = this.users.some(u => u.email === userData.email);
    if (exists) {
      console.log('Registro fallido: email ya registrado');
      return false;  // No permitir duplicados
    }

    this.users.push(userData);
    this.currentUserSubject.next(userData);
    console.log('Usuarios registrados:', this.users);
    return true;
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}
