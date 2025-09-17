# Work Managerment - Ứng dụng Quản lý Công việc Chuyên nghiệp

<div align="center">
  <img src="public/favicon.png" alt="TaskFlow Logo" width="80" height="80">
  
  **Ứng dụng quản lý công việc hiện đại với Firebase Cloud Sync và tính năng đa nền tảng**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-9-orange)](https://firebase.google.com/)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
</div>

## 🌐 Live Demo

**🔗 [Truy cập ứng dụng tại đây](https://hipwork.vercel.app/)**

*Ứng dụng đã được deploy lên Vercel và sẵn sàng sử dụng trên mọi thiết bị!*

## 🚀 Tính năng chính

### 🔥 Firebase Cloud Sync
- **Real-time synchronization** giữa PC và mobile
- **Offline support** với automatic sync khi có mạng
- **Cross-device compatibility** - dữ liệu luôn đồng bộ
- **Cloud backup** tự động

### 📋 Quản lý Task Toàn diện
- **3 trạng thái workflow**: Todo → In Progress → Completed
- **Hệ thống ưu tiên**: High, Medium, Low với màu sắc trực quan
- **Time management**: Thời gian bắt đầu và kết thúc với định dạng AM/PM
- **Tags & Categories**: Phân loại và tổ chức công việc hiệu quả
- **Markdown notes**: Ghi chú chi tiết với hỗ trợ markdown

### 📸 Photo Verification System
- **Bắt buộc chụp ảnh** khi hoàn thành task
- **Camera access** với preview và retake
- **Timestamp recording** cho việc theo dõi
- **Photo viewing** trong task details
- **Cloud storage** cho ảnh chứng minh

### 🔄 Recurring Tasks
- **Tự động tạo task lặp lại**: Daily, Weekly, Monthly
- **Smart scheduling**: Tính toán ngày tiếp theo tự động
- **Cloud-based recurring** với Firebase

### 🎯 Multiple Views
- **📝 List View**: Danh sách chi tiết với sorting và filtering
- **📊 Kanban Board**: Drag & drop (desktop) + Touch buttons (mobile)
- **📅 Calendar View**: Xem theo tháng với task details
- **📈 Analytics Dashboard**: Thống kê và biểu đồ chi tiết

### 📱 Mobile-First Design
- **Touch-optimized** Kanban với manual status buttons
- **Responsive tabs** và navigation
- **Mobile camera** integration
- **iPhone/Android** compatible

### ⌨️ Keyboard Shortcuts
- `N` - Thêm task mới
- `K` - Chuyển sang Kanban view
- `L` - Chuyển sang List view  
- `C` - Chuyển sang Calendar view
- `A` - Chuyển sang Analytics view
- **Toggle ON/OFF** shortcuts trong header

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase (configured for public use)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Firebase Real-time
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Fonts**: Geist Sans & Mono

## 🌟 Sử dụng ứng dụng

### 🎯 Truy cập ngay
1. **Mở trình duyệt** trên PC hoặc mobile
2. **Truy cập**: [https://hipwork.vercel.app](https://hipwork.vercel.app/)
3. **Bắt đầu sử dụng** ngay lập tức - không cần đăng ký!

### 📱 Trên Mobile (iPhone/Android)
- **Thêm vào Home Screen** để trải nghiệm như native app
- **Sử dụng camera** để chụp ảnh hoàn thành task
- **Touch buttons** trong Kanban thay vì drag & drop

### 💻 Trên Desktop
- **Keyboard shortcuts** để thao tác nhanh
- **Drag & drop** trong Kanban board
- **Full analytics** dashboard

## 🏗️ Cấu trúc Project

```
taskflow/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── analytics-dashboard.tsx
│   ├── calendar-view.tsx
│   ├── kanban-board.tsx
│   ├── markdown-renderer.tsx
│   ├── photo-capture-modal.tsx
│   ├── search-filter.tsx
│   ├── task-card.tsx
│   ├── task-detail-modal.tsx
│   ├── task-form.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── firebase.ts           # Firebase configuration
│   └── utils.ts
├── services/
│   └── taskService.ts        # Firebase CRUD operations
├── public/
│   └── favicon.png
└── README.md
```

## 💾 Firebase Data Structure

```typescript
interface Task {
  id?: string                   # Firebase document ID
  title: string
  description?: string
  completed: boolean
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  startTime?: string
  endTime?: string
  tags: string[]
  category?: string
  completedAt?: string
  completionPhoto?: string      # Base64 image data
  notes?: string               # Markdown supported
  recurring?: "none" | "daily" | "weekly" | "monthly"
  lastRecurringDate?: string
  createdAt?: Timestamp        # Firebase server timestamp
  updatedAt?: Timestamp        # Firebase server timestamp
}
```

## 🎯 Hướng dẫn sử dụng

### 🆕 Tạo Task mới
1. **Click "Thêm công việc mới"** hoặc nhấn `N`
2. **Điền thông tin**: tiêu đề, mô tả, thời gian, ưu tiên
3. **Thêm tags và categories** tùy chọn
4. **Thiết lập recurring** nếu cần
5. **Dữ liệu tự động sync** lên Firebase Cloud

### 🔄 Workflow Task
1. **Todo**: Task mới được tạo
2. **In Progress**: 
   - Desktop: Click vào task
   - Mobile: Nhấn nút "Bắt đầu"
3. **Completed**: Chụp ảnh bắt buộc để hoàn thành

### 📱 Mobile vs Desktop
- **Desktop**: Drag & drop trong Kanban
- **Mobile**: Touch buttons để chuyển trạng thái
- **Cả hai**: Real-time sync giữa thiết bị

### 🎮 Views và Navigation
- **Header buttons** hoặc keyboard shortcuts
- **Filter và sort** trong List view
- **Touch-friendly** Kanban trên mobile
- **Calendar view** với task details

## 📊 Analytics Features

- **Real-time Statistics**: Cập nhật tức thì từ Firebase
- **Completion Rate**: Tỷ lệ hoàn thành tổng thể
- **Status Distribution**: Phân bố theo trạng thái
- **Weekly Trends**: Xu hướng hoàn thành theo tuần
- **Category Analysis**: Phân tích theo danh mục
- **Photo Verification Rate**: Tỷ lệ task có ảnh chứng minh
- **Cross-device Analytics**: Thống kê từ mọi thiết bị

## 🔧 Tính năng nâng cao

### 🌙 Theme System
- **Dark/Light mode** tự động theo system
- **Smooth transitions** giữa các theme
- **Custom colors** cho priority và status

### ⌨️ Keyboard Shortcuts
- **Toggle ON/OFF** trong header
- **Smart detection** - không hoạt động khi typing
- **Toast feedback** cho mọi thao tác

### 🔄 Real-time Sync
- **Instant updates** giữa các thiết bị
- **Offline support** với auto-sync
- **Conflict resolution** tự động

## 📱 Cross-Platform Support

- **Mobile First**: Tối ưu cho iPhone/Android
- **Touch Optimized**: Buttons thay vì drag & drop
- **Tablet Support**: Layout adaptive
- **Desktop**: Full features với keyboard shortcuts
- **PWA Ready**: Có thể cài như native app

## 🚀 Production Deployment

### ✅ Đã Deploy trên Vercel
- **Live URL**: [https://hipwork.vercel.app](https://hipwork.vercel.app/)
- **Auto-deployment** từ Git commits
- **Global CDN** cho tốc độ tối ưu
- **SSL Certificate** tự động

### 🔧 Firebase Configuration
- **Firestore Database**: Real-time NoSQL
- **Security Rules**: Configured for public access
- **Cloud Storage**: Cho ảnh chứng minh
- **Analytics**: Usage tracking

### 📈 Performance
- **Next.js 14**: App Router với Server Components
- **Vercel Edge**: Global edge network
- **Firebase**: Real-time database
- **Optimized Images**: Automatic optimization

## 🔒 Security & Privacy

- **Firebase Security Rules**: Configured for safe public access
- **No Authentication Required**: Immediate access
- **Data Isolation**: Each session independent
- **HTTPS Only**: Secure connections
- **No Personal Data**: Only task information stored

## 🤝 Feedback & Support

- **Issues**: Report bugs or request features
- **Email**: your.email@example.com
- **Live Demo**: Test all features online
- **Mobile Testing**: Works on all devices

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨💻 Author

**Your Name**
- GitHub: [duonghip16](https://github.com/duonghip16)
- Email: duonghip1609@gmail.com
- Live Demo: [https://hipwork.vercel.app/](https://hipwork.vercel.app/)

## 🙏 Technology Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service
- [Vercel](https://vercel.com/) - Deployment platform
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  <h3>🌟 Ready to boost your productivity?</h3>
  <p><strong><a href="https://your-app-url.vercel.app">Try TaskFlow now!</a></strong></p>
  <p>Made with ❤️ using Next.js, Firebase & TypeScript</p>
</div>
