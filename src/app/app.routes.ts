import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Tự động chuyển hướng về trang login khi truy cập trang chủ
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Đường dẫn trang Đăng nhập
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  }, 
  // Đường dẫn trang Dashboard
  {
    path: 'dashboard',
    // Sửa m.DashboardComponent thành m.Dashboard
    canActivate: [authGuard], // 2. Giao nhiệm vụ canh cửa ở đây!
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  }
];