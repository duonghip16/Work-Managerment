# TaskFlow - Ứng dụng Quản lý Công việc Chuyên nghiệp

<div align="center">
  <img src="public/favicon.png" alt="TaskFlow Logo" width="80" height="80">
  
  **Ứng dụng quản lý công việc hiện đại với dashboard analytics và tính năng lọc thông minh**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 🚀 Tính năng chính

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

### 🔄 Recurring Tasks
- **Tự động tạo task lặp lại**: Daily, Weekly, Monthly
- **Smart scheduling**: Tính toán ngày tiếp theo tự động
- **Backward compatibility**: Hỗ trợ dữ liệu cũ

### 🎯 Multiple Views
- **📝 List View**: Danh sách chi tiết với sorting và filtering
- **📊 Kanban Board**: Drag & drop với 3 cột trạng thái
- **📅 Calendar View**: Xem theo tháng với task details
- **📈 Analytics Dashboard**: Thống kê và biểu đồ chi tiết

### ⌨️ Keyboard Shortcuts
- `N` - Thêm task mới
- `K` - Chuyển sang Kanban view
- `L` - Chuyển sang List view  
- `C` - Chuyển sang Calendar view
- `A` - Chuyển sang Analytics view
- **Toggle ON/OFF** shortcuts trong header

### 🎨 Modern UI/UX
- **Dark/Light mode** với smooth transitions
- **Responsive design** cho mọi thiết bị
- **Professional styling** với Tailwind CSS
- **Accessibility compliant** components
- **Real-time clock** trong header

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Data Persistence**: localStorage
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Fonts**: Geist Sans & Mono

## 📦 Cài đặt

```bash
# Clone repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Cài đặt dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install

# Chạy development server
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

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
│   └── utils.ts
├── public/
│   └── favicon.png
└── README.md
```

## 💾 Data Structure

```typescript
interface Task {
  id: number
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
  completionPhoto?: string
  notes?: string
  recurring?: "none" | "daily" | "weekly" | "monthly"
  lastRecurringDate?: string
}
```

## 🎯 Sử dụng

### Tạo Task mới
1. Click "Thêm công việc mới" hoặc nhấn `N`
2. Điền thông tin: tiêu đề, mô tả, thời gian, ưu tiên
3. Thêm tags và categories tùy chọn
4. Thiết lập recurring nếu cần

### Workflow Task
1. **Todo**: Task mới được tạo
2. **In Progress**: Click vào task để bắt đầu
3. **Completed**: Chụp ảnh bắt buộc để hoàn thành

### Views và Navigation
- Sử dụng buttons trên header hoặc keyboard shortcuts
- Filter và sort trong List view
- Drag & drop trong Kanban view
- Click vào ngày trong Calendar view

## 📊 Analytics Features

- **Completion Rate**: Tỷ lệ hoàn thành tổng thể
- **Status Distribution**: Phân bố theo trạng thái
- **Weekly Trends**: xu hướng hoàn thành theo tuần
- **Category Analysis**: Phân tích theo danh mục
- **Photo Verification Rate**: Tỷ lệ task có ảnh chứng minh

## 🔧 Customization

### Theme Configuration
- Sử dụng CSS variables trong `globals.css`
- Dark/light mode tự động theo system preference
- Custom colors cho priority và status

### Keyboard Shortcuts
- Enable/disable trong header
- Không hoạt động khi focus vào input fields
- Toast notifications cho feedback

## 📱 Responsive Design

- **Mobile First**: Tối ưu cho mobile devices
- **Tablet Support**: Layout adaptive cho tablet
- **Desktop**: Full features với keyboard shortcuts

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
npm run export
# Upload dist folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">
  Made with ❤️ using Next.js and TypeScript
</div>