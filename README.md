# 🚀 TaskFlow Pro - Modern Kanban Task Management

**🌟 Trải nghiệm Live Demo ngay tại đây:** 👉 **[MỞ TASKFLOW PRO](https://task-e7028.web.app)**

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**TaskFlow Pro** là một ứng dụng quản lý công việc hiện đại, được xây dựng dựa trên phương pháp Kanban. Ứng dụng giúp bạn theo dõi tiến độ dự án trực quan, đồng bộ dữ liệu theo thời gian thực và cung cấp không gian làm việc cá nhân hóa, bảo mật cho từng người dùng.

---

## ✨ Tính năng nổi bật

* **🔐 Xác thực bảo mật (Google Login):** Đăng nhập an toàn, nhanh chóng chỉ với 1 click bằng tài khoản Google. Hiển thị Avatar và thông tin người dùng trực quan.
* **🛡️ Không gian làm việc riêng tư (Data Isolation):** Mỗi tài khoản có một không gian lưu trữ độc lập. Không ai có thể xem hay chỉnh sửa công việc của người khác.
* **🔄 Đồng bộ Real-time:** Tự động đồng bộ dữ liệu ngay lập tức giữa các thiết bị nhờ sức mạnh của Firebase Firestore.
* **🖱️ Kéo thả mượt mà (Drag & Drop):** Chuyển đổi trạng thái công việc nhanh chóng giữa các cột (Todo -> In Progress -> Done) với Angular CDK. Hiệu ứng pháo hoa chúc mừng khi hoàn thành Task.
* **📊 Phân tích dữ liệu:** Biểu đồ Donut (Chart.js) thống kê tỷ lệ hoàn thành dự án trực quan ngay trên Dashboard.
* **🎨 Giao diện hiện đại & Dark Mode:** Thiết kế UI/UX tinh tế với TailwindCSS, hỗ trợ chế độ nền tối (Dark/Light mode) giúp bảo vệ mắt và lưu trữ tùy chọn cấu hình.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Khung ứng dụng (Framework):** Angular 17+ (Standalone Components, Signals)
* **Giao diện (UI/Styling):** Tailwind CSS, HTML5/CSS3
* **Cơ sở dữ liệu & Back-end:** Firebase (Firestore Database, Firebase Authentication, Firebase Hosting)
* **Thư viện hỗ trợ:** * `@angular/cdk/drag-drop` (Kéo thả)
  * `chart.js` (Vẽ biểu đồ)
  * `canvas-confetti` (Hiệu ứng)

---

## 💻 Hướng dẫn cài đặt (Chạy trên máy cá nhân)

Nếu bạn muốn tải code về và chạy thử trên máy tính của mình, hãy làm theo các bước sau:

**1. Clone dự án về máy:**
```bash
git clone [https://github.com/Tên-Tài-Khoản-Của-Bạn/taskflow-pro.git](https://github.com/Tên-Tài-Khoản-Của-Bạn/taskflow-pro.git)
cd taskflow-pro