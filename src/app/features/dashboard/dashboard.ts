  import { Component, inject, signal, computed } from '@angular/core';
  import { Router } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'; // 1. Thêm Reactive Form
  import { AuthService } from '../../core/services/auth.service';

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
    imports: [CommonModule, ReactiveFormsModule], // 2. Nhớ thêm vào đây
    templateUrl: './dashboard.html'
  })
  export class Dashboard {
    private router = inject(Router);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder); // 3. Gọi công cụ tạo Form

    showModal = signal(false); // Biến điều khiển Modal
    searchTerm = signal('');

    // Form để nhập Task mới
    taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    assignee: ['', [Validators.required]],
    status: ['Todo' as 'Todo' | 'In Progress' | 'Done'], // Cho phép thay đổi
    priority: ['Medium' as 'Low' | 'Medium' | 'High']    // Cho phép thay đổi
  });

    tasks = signal<Task[]>([
      { id: 1, title: 'Thiết kế giao diện Login', assignee: 'Nam', status: 'Done', priority: 'High' },
      { id: 2, title: 'Cấu hình Route Guard', assignee: 'Nam', status: 'Done', priority: 'High' },
      { id: 3, title: 'Làm bảng danh sách công việc', assignee: 'Admin', status: 'In Progress', priority: 'Medium' },
      { id: 4, title: 'Kết nối API thực tế', assignee: 'Hệ thống', status: 'Todo', priority: 'Low' },
    ]);

    filteredTasks = computed(() => {
      const term = this.searchTerm().toLowerCase();
      return this.tasks().filter(task => 
        task.title.toLowerCase().includes(term) || task.assignee.toLowerCase().includes(term)
      );
    });
    updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

    // 4. Hàm lưu Task mới
    
  

    onLogout() {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    getStatusClass(status: string) {
      switch (status) {
        case 'Done': return 'bg-emerald-100 text-emerald-600';
        case 'In Progress': return 'bg-blue-100 text-blue-600';
        default: return 'bg-slate-100 text-slate-600';
      }
    }
    deleteTask(id: number) {
      // Hiện thông báo xác nhận cho chắc ăn (chuẩn UX)
      if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
        this.tasks.update(allTasks => allTasks.filter(t => t.id !== id));
      }
    }
  // ... các code cũ giữ nguyên

    isEditMode = signal(false); // Check xem đang sửa hay thêm
    editingTaskId = signal<number | null>(null); // Lưu ID của task đang được sửa

    // 1. Hàm mở Modal để Sửa
    openEditModal(task: Task) {
      this.isEditMode.set(true);
      this.editingTaskId.set(task.id);
      
      // Đổ dữ liệu của task đó vào Form
      this.taskForm.patchValue({
      title: task.title,
      assignee: task.assignee,
      status: task.status,
      priority: task.priority
    });
      
      this.showModal.set(true);
    }

    // 2. Hàm mở Modal để Thêm mới (Cần reset form)
    openAddModal() {
      this.isEditMode.set(false);
      this.editingTaskId.set(null);
      this.taskForm.reset({ status: 'Todo', priority: 'Medium' });
      this.showModal.set(true);
    }

    // 3. Cập nhật lại hàm saveTask để xử lý cả 2 trường hợp
    saveTask() {
      if (this.taskForm.invalid) {
        this.taskForm.markAllAsTouched();
        return;
      }

      const formRawValue = this.taskForm.getRawValue();

      if (this.isEditMode()) {
        // TRƯỜNG HỢP SỬA: Tìm và cập nhật task trong mảng
        this.tasks.update(allTasks => allTasks.map(t => 
          t.id === this.editingTaskId() ? { ...t, ...formRawValue as any } : t
        ));
      } else {
        // TRƯỜNG HỢP THÊM MỚI: Thêm vào đầu mảng
        const newTask: Task = {
          id: Date.now(),
          ...formRawValue as any
        };
        this.tasks.update(allTasks => [newTask, ...allTasks]);
      }

      this.showModal.set(false);
    }
    
  }
