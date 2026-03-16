import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule], // Bắt buộc phải có cái này để dùng form chuyên nghiệp
  templateUrl: './login.html' // Đảm bảo trỏ đúng tên file HTML của bạn
})
export class LoginComponent {
  // Inject FormBuilder để tạo form
  private fb = inject(FormBuilder);

  // Signal quản lý trạng thái ẩn/hiện mật khẩu
  showPassword = signal(false);

  // Tạo form với các điều kiện ràng buộc (Validate)
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], // Bắt buộc nhập + phải là email
    password: ['', [Validators.required, Validators.minLength(6)]] // Bắt buộc nhập + tối thiểu 6 ký tự
  });

  // Hàm đảo ngược trạng thái mật khẩu
  togglePassword() {
    this.showPassword.update(val => !val);
  }

  // Hàm xử lý khi bấm nút Đăng nhập
  onSubmit() {
    if (this.loginForm.invalid) {
      // Nếu form lỗi, ép tất cả các ô input hiện đỏ lên
      this.loginForm.markAllAsTouched();
      return;
    }
    
    // Nếu hợp lệ, in dữ liệu ra console (Lát nữa sẽ nối API ở đây)
    console.log('Dữ liệu hợp lệ:', this.loginForm.getRawValue());
    alert('Đăng nhập thành công với: ' + this.loginForm.value.email);
  }
}