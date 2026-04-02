import { Component, signal, computed, effect, ViewChild, ElementRef, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Chart, registerables } from 'chart.js';
import confetti from 'canvas-confetti';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AsyncPipe } from '@angular/common';

Chart.register(...registerables);

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  createdAt: number;
  dueDate: string;
  tags: string[];
  subTasksTotal: number;
  subTasksDone: number;
  userId?: string; // Đã thêm biến này để lưu dấu chân sếp Tâm
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, AsyncPipe], // Đã dọn dẹp dấu phẩy thừa
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit {
  isDarkMode = signal(typeof localStorage !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  isSidebarOpen = signal(false);
  viewMode = signal<'table' | 'kanban'>('kanban');

  tasks = signal<Task[]>([]);
  searchQuery = signal('');
  currentFilter = signal<'All' | 'Todo' | 'In Progress' | 'Done'>('All');
  sortColumn = signal<keyof Task>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  currentPage = signal(1);
  itemsPerPage = 5;
  selectedTaskIds = signal<string[]>([]);

  showModal = signal(false);
  isEditMode = signal(false);
  currentEditingId = signal<string | null>(null);
  taskForm: FormGroup;

  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('info');

  @ViewChild('pieChart') pieChartRef!: ElementRef;
  chartInstance: any;

  successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);
  private firestore: Firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      assignee: [''],
      priority: ['Medium'],
      status: ['Todo'],
      dueDate: [''],
      tags: [''],
      subTasksTotal: [0],
      subTasksDone: [0]
    });

    if (this.isDarkMode()) document.documentElement.classList.add('dark');

    // MÁY CẢM BIẾN REAL-TIME: ĐÃ NÂNG CẤP BỘ LỌC TÀI KHOẢN
    onSnapshot(this.tasksCollection, (snapshot) => {
      const currentUid = this.auth.currentUser?.uid; // Hỏi xem ai đang đăng nhập
      
      const tasksData = snapshot.docs
        .map(doc => doc.data() as Task)
        .filter(task => task.userId === currentUid); // CHỈ LỌC TASK CỦA NGƯỜI ĐÓ

      console.log("🎉 FIREBASE ĐÃ CHỊU NHẢ DỮ LIỆU RIÊNG TƯ:", tasksData);
      this.tasks.set(tasksData);
      this.cdr.detectChanges(); 
    }, (error) => {
      console.error("❌ Lỗi cản đường:", error);
    });

    effect(() => {
      const currentTasks = this.tasks();
      if (this.chartInstance) {
        const todo = currentTasks.filter(t => t.status === 'Todo').length;
        const inProgress = currentTasks.filter(t => t.status === 'In Progress').length;
        const done = currentTasks.filter(t => t.status === 'Done').length;
        this.chartInstance.data.datasets[0].data = [todo, inProgress, done];
        this.chartInstance.update();
      }
    });
  }

  ngAfterViewInit() { this.renderChart(); }

  filteredTasks = computed(() => {
    let result = this.tasks();
    if (this.currentFilter() !== 'All') result = result.filter(t => t.status === this.currentFilter());
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q));
    }
    return result;
  });

  paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredTasks().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredTasks().length / this.itemsPerPage) || 1);
  totalTasks = computed(() => this.tasks().length);
  doneTasks = computed(() => this.tasks().filter(t => t.status === 'Done').length);
  completionRate = computed(() => this.totalTasks() === 0 ? 0 : Math.round((this.doneTasks() / this.totalTasks()) * 100));
  isAllSelected = computed(() => this.paginatedTasks().length > 0 && this.selectedTaskIds().length === this.paginatedTasks().length);

  todoList = computed(() => this.filteredTasks().filter(t => t.status === 'Todo'));
  inProgressList = computed(() => this.filteredTasks().filter(t => t.status === 'In Progress'));
  doneList = computed(() => this.filteredTasks().filter(t => t.status === 'Done'));

  toggleDarkMode() {
    this.isDarkMode.update(d => !d);
    document.documentElement.classList.toggle('dark', this.isDarkMode());
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }

  toggleSidebar() { this.isSidebarOpen.update(v => !v); }
  updateSearch(event: any) { this.searchQuery.set(event.target.value); this.currentPage.set(1); }
  toggleSort(col: keyof Task) { /* Tạm ẩn cho gọn */ }
  toggleSelection(id: string) { this.selectedTaskIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  toggleAll(event: any) { this.selectedTaskIds.set(event.target.checked ? this.paginatedTasks().map(t => t.id) : []); }

  openAddModal() {
    this.isEditMode.set(false);
    this.currentEditingId.set(null);
    this.taskForm.reset({ priority: 'Medium', status: 'Todo', subTasksTotal: 0, subTasksDone: 0 });
    this.showModal.set(true);
  }

  openEditModal(task: Task) {
    this.isEditMode.set(true);
    this.currentEditingId.set(task.id);
    this.taskForm.patchValue({
      ...task,
      tags: task.tags ? task.tags.join(', ') : ''
    });
    this.showModal.set(true);
  }

  async saveTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    // NÂNG CẤP: Lấy ID người dùng trước khi lưu
    const currentUid = this.auth.currentUser?.uid;
    if (!currentUid) {
      this.showToast('Vui lòng đăng nhập để lưu task!', 'error');
      return;
    }

    const rawVal = this.taskForm.value;
    const processedTags = rawVal.tags ? String(rawVal.tags).split(',').map(t => t.trim()).filter(t => t !== '') : [];
    const val = { ...rawVal, tags: processedTags };

    try {
      if (this.isEditMode() && this.currentEditingId()) {
        const docRef = doc(this.firestore, 'tasks', this.currentEditingId()!);
        await updateDoc(docRef, val);
        this.showToast('Cập nhật thành công!', 'success');
      } else {
        const newId = Date.now().toString();
        const docRef = doc(this.firestore, 'tasks', newId);
        
        // Gắn thẻ ID chủ sở hữu vào task mới
        const newTask: Task = { 
          ...val, 
          id: newId, 
          createdAt: Date.now(),
          userId: currentUid 
        };
        
        await setDoc(docRef, newTask);
        this.showToast('Tạo task thành công!', 'success');
      }
      this.showModal.set(false);
    } catch (error: any) {
      console.error("LỖI FIREBASE:", error);
      alert("❌ Lưu thất bại! Lỗi từ Đám mây: \n" + error.message);
      this.showToast('Chưa bật Database hoặc sai quyền!', 'error');
    }
  }

  async deleteTask(id: string) {
    if (confirm('Bạn có chắc muốn xóa công việc này?')) {
      await deleteDoc(doc(this.firestore, 'tasks', id));
      this.showToast('Đã xóa công việc!', 'error');
    }
  }

  bulkDelete() { }
  bulkMarkAsDone() { }

  async drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) return;
    const taskToMove = event.previousContainer.data[event.previousIndex];
    const newStatus = event.container.id as 'Todo' | 'In Progress' | 'Done';

    const docRef = doc(this.firestore, 'tasks', taskToMove.id);
    await updateDoc(docRef, { status: newStatus });

    if (newStatus === 'Done') {
      this.successSound.play().catch(e => console.log('Auto-play blocked'));
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });
      this.showToast(`Tuyệt vời! Đã hoàn thành task.`, 'success');
    } else {
      this.showToast(`Đã chuyển sang ${newStatus}!`, 'info');
    }
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  exportToCSV() { }

  renderChart() {
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    const currentTasks = this.tasks();
    const todo = currentTasks.filter(t => t.status === 'Todo').length;
    const inProgress = currentTasks.filter(t => t.status === 'In Progress').length;
    const done = currentTasks.filter(t => t.status === 'Done').length;

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Chờ làm', 'Đang xử lý', 'Đã xong'],
        datasets: [{
          data: [todo, inProgress, done],
          backgroundColor: ['#64748b', '#3b82f6', '#10b981'],
          borderWidth: 0,
          hoverOffset: 5
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 'bold', size: 11 } } } } }
    });
  }

  showToast(msg: string, type: 'success' | 'error' | 'info') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.taskForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getAvatarColor(name: string): string {
    if (!name) return 'bg-slate-300';
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    return taskDate < today;
  }

  getPriorityClass(priority: string) {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400';
      case 'Low': return 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400';
      default: return '';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Done': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-400';
      case 'Todo': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return '';
    }
  }

  onLogout() { if (confirm('Bạn có chắc muốn đăng xuất?')) this.showToast('Đã đăng xuất thành công!', 'info'); }
  
  async login() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this.showToast('Chào mừng sếp đã quay trở lại!', 'success');
    } catch (error) {
      this.showToast('Đăng nhập thất bại rồi sếp ơi!', 'error');
    }
  }

  async logout() {
    if (confirm('Sếp chắc chắn muốn đăng xuất chứ?')) {
      await signOut(this.auth);
      this.showToast('Đã đăng xuất an toàn!', 'info');
    }
  }
}