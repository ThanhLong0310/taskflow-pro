import { Routes } from '@angular/router';

export const routes: Routes = [
  // Tự động chuyển hướng về trang login khi truy cập trang chủ
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Khai báo đường dẫn cho trang login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  }
];  