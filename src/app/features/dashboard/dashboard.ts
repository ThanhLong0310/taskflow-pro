import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Quan trọng: Thêm cái này để dùng @for

// 1. Định nghĩa cấu trúc một Task
interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'Done' | 'In Progress' | 'Todo';
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // 2. Thêm CommonModule vào đây
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private router = inject(Router);

  // 3. Mảng dữ liệu mẫu (Giả lập dữ liệu từ API)
  tasks = signal<Task[]>([
    { id: 1, title: 'Thiết kế giao diện Login', assignee: 'Nam', status: 'Done', priority: 'High' },
    { id: 2, title: 'Cấu hình Route Guard', assignee: 'Nam', status: 'Done', priority: 'High' },
    { id: 3, title: 'Làm bảng danh sách công việc', assignee: 'Admin', status: 'In Progress', priority: 'Medium' },
    { id: 4, title: 'Kết nối API thực tế', assignee: 'Hệ thống', status: 'Todo', priority: 'Low' },
  ]);

  onLogout() {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  // Hàm helper để đổ màu cho Status
  getStatusClass(status: string) {
    switch (status) {
      case 'Done': return 'bg-emerald-100 text-emerald-600';
      case 'In Progress': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}