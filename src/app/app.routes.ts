import { Routes } from '@angular/router';

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
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  }
];