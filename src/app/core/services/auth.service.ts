import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dùng Signal để cả ứng dụng biết trạng thái đăng nhập ngay lập tức
  isLoggedIn = signal<boolean>(localStorage.getItem('isLoggedIn') === 'true');

  login() {
    localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedIn.set(true);
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn.set(false);
  }

  // Hàm kiểm tra nhanh
  checkAuth(): boolean {
    return this.isLoggedIn();
  }
}