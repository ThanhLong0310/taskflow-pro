import { Component, inject, signal,OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
private authService = inject(AuthService);
  
  ngOnInit() {
    // Nếu "anh bảo vệ" bảo là đã có thẻ rồi thì cho vào Dashboard luôn
    if (this.authService.checkAuth()) {
      this.router.navigate(['/dashboard']);
    }
  }

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
      this.authService.login(); // Dùng hàm login của service
      this.router.navigate(['/dashboard']);
    } else {
      alert('Sai tài khoản!');
    }
  }
}