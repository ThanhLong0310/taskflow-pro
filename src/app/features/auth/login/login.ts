import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router); // 

  showPassword = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePassword() {
    this.showPassword.update(val => !val);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    // Lấy dữ liệu người dùng vừa gõ
    const { email, password } = this.loginForm.getRawValue();

    // Giả lập kiểm tra dữ liệu với Server (Database)
    if (email === 'admin@company.com' && password === '123456') {
      // Đăng nhập thành công -> Dùng router đưa người dùng sang trang Dashboard
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/dashboard']);
    } else {
      // Đăng nhập thất bại -> Báo lỗi
      alert('Sai email hoặc mật khẩu! \n(Gợi ý: Thử admin@company.com / 123456)');
    }
  }
}