# Hướng dẫn cài đặt Firebase Authentication

## Bước 1: Tạo dự án Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (Thêm dự án)
3. Nhập tên dự án (ví dụ: "vietnam-poi-map")
4. Có thể bật hoặc tắt Google Analytics (tuỳ chọn)
5. Click **"Create project"** và đợi cho đến khi dự án được tạo

## Bước 2: Thêm ứng dụng Web

1. Trong trang tổng quan dự án, click biểu tượng **Web** (`</>`)
2. Đặt tên cho ứng dụng (ví dụ: "vietnam-poi-web")
3. **Không cần** chọn "Firebase Hosting"
4. Click **"Register app"**
5. Bạn sẽ thấy đoạn mã cấu hình Firebase. **Lưu lại** các giá trị sau:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Bước 3: Bật Email/Password Authentication

1. Trong Firebase Console, chọn **"Authentication"** từ menu bên trái
2. Click tab **"Sign-in method"**
3. Click vào **"Email/Password"**
4. Bật **"Enable"** cho Email/Password
5. Click **"Save"**

## Bước 4: Cấu hình môi trường

1. Tạo file `.env` trong thư mục gốc dự án (nếu chưa có)
2. Thêm các biến môi trường sau:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenWeather API (nếu có)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

3. Thay thế các giá trị `your_...` bằng thông tin từ Firebase Console

## Bước 5: Khởi động ứng dụng

```bash
npm run dev
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG:**
- **KHÔNG** commit file `.env` lên Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ sử dụng các API key cho môi trường development
- Trong production, sử dụng biến môi trường của hosting platform

## Tính năng Authentication

Sau khi cài đặt, ứng dụng sẽ có các tính năng:

✅ **Đăng ký** - Tạo tài khoản mới bằng email/password  
✅ **Đăng nhập** - Đăng nhập với email/password  
✅ **Đăng xuất** - Thoát khỏi tài khoản  
✅ **Quên mật khẩu** - Gửi email reset password  
✅ **Tên hiển thị** - Đặt tên hiển thị khi đăng ký  

## Troubleshooting

### Lỗi "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra lại API key trong file `.env`
- Đảm bảo file `.env` nằm ở thư mục gốc dự án
- Restart server sau khi thay đổi file `.env`

### Lỗi "Firebase: Error (auth/network-request-failed)"
- Kiểm tra kết nối internet
- Kiểm tra firewall hoặc VPN

### Lỗi "Firebase: Error (auth/operation-not-allowed)"
- Đảm bảo đã bật Email/Password authentication trong Firebase Console

## Cấu trúc file

```
src/
├── firebase/
│   └── config.js          # Cấu hình Firebase
├── contexts/
│   └── AuthContext.jsx    # Context quản lý authentication
├── components/
│   └── Auth/
│       ├── AuthModal.jsx  # Modal đăng nhập/đăng ký
│       ├── AuthModal.css  # Style cho modal
│       └── UserMenu.jsx   # Menu người dùng đã đăng nhập
```
