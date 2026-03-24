import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  searchTerm = signal('');
  currentFilter = signal<'All' | 'Todo' | 'In Progress' | 'Done'>('All');

  taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    assignee: ['', [Validators.required]],
    status: ['Todo' as 'Todo' | 'In Progress' | 'Done'],
    priority: ['Medium' as 'Low' | 'Medium' | 'High']
  });

  // 1. SỬA LẠI: Load dữ liệu từ LocalStorage khi khởi tạo
  tasks = signal<Task[]>(this.loadTasks());

  // 2. THÊM MỚI: 3 biến Computed để tự động đếm số lượng Task
  totalTasks = computed(() => this.tasks().length);
  doneTasks = computed(() => this.tasks().filter(t => t.status === 'Done').length);
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'In Progress').length);

  // Lọc dữ liệu cho bảng tìm kiếm
  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.currentFilter();
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();

    // 1. Lọc dữ liệu (Search + Tab)
    let result = this.tasks().filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(term) || task.assignee.toLowerCase().includes(term);
      const matchesFilter = filter === 'All' || task.status === filter;
      return matchesSearch && matchesFilter;
    });

    // 2. Sắp xếp dữ liệu (Sort)
    // 2. Sắp xếp dữ liệu (Sort)
    if (sortCol) {
      result.sort((a, b) => {

        // 🌟 NẾU LÀ CỘT ƯU TIÊN: Xếp theo điểm số (Trọng số)
        if (sortCol === 'priority') {
          const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
          const weightA = priorityWeight[a.priority];
          const weightB = priorityWeight[b.priority];

          if (weightA < weightB) return sortDir === 'asc' ? -1 : 1;
          if (weightA > weightB) return sortDir === 'asc' ? 1 : -1;
          return 0;
        }

        // 🌟 NẾU LÀ CÁC CỘT KHÁC: Giữ nguyên xếp theo bảng chữ cái (A-Z)
        const valA = a[sortCol].toString().toLowerCase();
        const valB = b[sortCol].toString().toLowerCase();

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });
  completionRate = computed(() => {
    if (this.totalTasks() === 0) return 0; // Tránh lỗi chia cho 0 nếu bảng trống
    return Math.round((this.doneTasks() / this.totalTasks()) * 100);
  });

  // 3. Tự động lưu dữ liệu mỗi khi mảng tasks thay đổi
  constructor() {
    effect(() => {
      localStorage.setItem('taskflow_data', JSON.stringify(this.tasks()));
    });
  }

  // Hàm đọc dữ liệu từ LocalStorage (Được gọi ở phần khởi tạo tasks)
  private loadTasks(): Task[] {
    const data = localStorage.getItem('taskflow_data');
    return data ? JSON.parse(data) : [
      { id: 1, title: 'Dự án mẫu: Chào mừng bạn!', assignee: 'Hệ thống', status: 'Todo', priority: 'Low' }
    ];
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

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
    if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      this.tasks.update(allTasks => allTasks.filter(t => t.id !== id));
    }
    this.showToast('Đã xóa công việc thành công!', 'info');
  }

  isEditMode = signal(false);
  editingTaskId = signal<number | null>(null);

  openEditModal(task: Task) {
    this.isEditMode.set(true);
    this.editingTaskId.set(task.id);
    this.taskForm.patchValue({
      title: task.title,
      assignee: task.assignee,
      status: task.status,
      priority: task.priority
    });
    this.showModal.set(true);
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.editingTaskId.set(null);
    this.taskForm.reset({ status: 'Todo', priority: 'Medium' });
    this.showModal.set(true);
  }

  saveTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formRawValue = this.taskForm.getRawValue();

    if (this.isEditMode()) {
      this.tasks.update(allTasks => allTasks.map(t =>
        t.id === this.editingTaskId() ? { ...t, ...formRawValue as any } : t
      ));
      this.showToast('Cập nhật công việc thành công!', 'success');
    } else {
      const newTask: Task = {
        id: Date.now(),
        ...formRawValue as any
      };
      this.tasks.update(allTasks => [newTask, ...allTasks]);
      this.showToast('Thêm công việc thành công!', 'success');
    }

    this.showModal.set(false);
  }

  isFieldInvalid(fieldName: string) {
    const field = this.taskForm.get(fieldName);
    return field?.invalid && (field?.touched || field?.dirty);
  }
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('success');

  // 2. Hàm kích hoạt thông báo
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);

    // Tự động dọn dẹp (tắt thông báo) sau 3 giây
    setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }
  getPriorityClass(priority: string) {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-slate-500 bg-slate-50 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  }
  sortColumn = signal<keyof Task | ''>(''); // Đang sắp xếp theo cột nào?
  sortDirection = signal<'asc' | 'desc'>('asc'); // Tăng dần (asc) hay Giảm dần (desc)?

  // HÀM KÍCH HOẠT SẮP XẾP KHI BẤM VÀO TIÊU ĐỀ
  toggleSort(column: keyof Task) {
    if (this.sortColumn() === column) {
      // Nếu bấm lại cột đang chọn -> Đổi chiều sắp xếp
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu bấm cột mới -> Set cột đó và mặc định là Tăng dần
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }
  // ==========================================
  // TÍNH NĂNG CHỌN NHIỀU (BULK ACTIONS)
  // ==========================================

  // 1. Biến lưu danh sách ID các task đang được tick chọn
  selectedTaskIds = signal<number[]>([]);

  // 2. Kiểm tra xem có phải tất cả các task trên màn hình đều đang được chọn không?
  isAllSelected = computed(() => {
    const currentTasks = this.filteredTasks();
    return currentTasks.length > 0 && this.selectedTaskIds().length === currentTasks.length;
  });

  // 3. Hàm tick/bỏ tick 1 task lẻ
  toggleSelection(id: number) {
    this.selectedTaskIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  // 4. Hàm tick/bỏ tick TẤT CẢ (Nút trên cùng)
  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      // Chọn hết tất cả các task ĐANG HIỂN THỊ (sau khi đã search/lọc)
      this.selectedTaskIds.set(this.filteredTasks().map(t => t.id));
    } else {
      // Bỏ chọn hết
      this.selectedTaskIds.set([]);
    }
  }

  // 5. Nút bấm: Xóa tất cả các task đã chọn
  bulkDelete() {
    const count = this.selectedTaskIds().length;
    if (confirm(`Bạn có chắc chắn muốn xóa ${count} công việc đã chọn?`)) {
      this.tasks.update(allTasks => allTasks.filter(t => !this.selectedTaskIds().includes(t.id)));
      this.selectedTaskIds.set([]); // Reset lại mảng chọn
      this.showToast(`Đã xóa ${count} công việc thành công!`, 'info');
    }
  }
  // ==========================================
  // XUẤT DỮ LIỆU RA FILE EXCEL (CSV)
  // ==========================================
  exportToCSV() {
    // Lấy dữ liệu đang hiển thị trên bảng (đã lọc và tìm kiếm)
    const tasksToExport = this.filteredTasks();

    if (tasksToExport.length === 0) {
      this.showToast('Không có dữ liệu để xuất!', 'error');
      return;
    }

    // 1. Tạo dòng tiêu đề (Header)
    const headers = ['ID', 'Tên công việc', 'Người thực hiện', 'Độ ưu tiên', 'Trạng thái'];

    // 2. Chuyển đổi từng task thành một dòng dữ liệu cách nhau bằng dấu phẩy
    const csvRows = tasksToExport.map(task => {
      // Bọc trong dấu ngoặc kép "" để tránh lỗi nếu tên công việc có chứa dấu phẩy
      return `#${task.id},"${task.title}","${task.assignee}","${task.priority}","${task.status}"`;
    });

    // 3. Gộp Header và Dữ liệu lại thành 1 chuỗi văn bản dài
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // 4. Thêm BOM (Byte Order Mark) để Excel đọc tiếng Việt UTF-8 không bị lỗi font
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

    // 5. Tạo link ẩn và tự động click để trình duyệt tải file về
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `TaskFlow_BaoCao_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Báo cáo thành công!
    this.showToast('Đã tải file Excel thành công!', 'success');
  }

  // 6. Nút bấm: Đánh dấu "Đã xong" cho tất cả task đã chọn
  bulkMarkAsDone() {
    const count = this.selectedTaskIds().length;
    this.tasks.update(allTasks => allTasks.map(t =>
      this.selectedTaskIds().includes(t.id) ? { ...t, status: 'Done' } : t
    ));
    this.selectedTaskIds.set([]); // Reset lại mảng chọn
    this.showToast(`Đã đánh dấu hoàn thành ${count} công việc!`, 'success');
  }
  // ==========================================
  // TÍNH NĂNG PHÂN TRANG (PAGINATION)
  // ==========================================
  
  // 1. Cài đặt số task hiển thị trên 1 trang và trang hiện tại
  currentPage = signal(1);
  itemsPerPage = signal(5); // Hiện 5 task 1 trang cho dễ test

  // 2. Tính toán tổng số trang
  totalPages = computed(() => {
    // Ví dụ có 12 task, chia 5 thì được 2.4 trang -> Làm tròn lên là 3 trang
    return Math.ceil(this.filteredTasks().length / this.itemsPerPage()) || 1;
  });

  // 3. CẮT DỮ LIỆU: Chỉ lấy đúng 5 task của trang hiện tại
  paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredTasks().slice(start, end);
  });

  // 4. Các nút bấm chuyển trang
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

}