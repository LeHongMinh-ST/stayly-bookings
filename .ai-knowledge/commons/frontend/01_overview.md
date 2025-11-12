# Frontend Overview - Hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan Frontend

Hệ thống frontend được chia thành **2 phần riêng biệt** hoàn toàn:

1. **Admin Panel (Hệ thống quản lý)**
   - Dành cho **Users** (Super Admin, Owner, Manager, Staff)
   - URL: `/admin` hoặc `/dashboard`
   - Quản lý homestay/hotel, booking, nhân viên, báo cáo
   - **KHÔNG** cho phép Customer truy cập

2. **Customer Frontend (Giao diện khách hàng)**
   - Dành cho **Customers** và **Guests** (chưa đăng nhập)
   - URL: `/` hoặc `/booking`
   - Tìm kiếm, đặt phòng, quản lý booking, đánh giá
   - **KHÔNG** cho phép truy cập Admin Panel

**Phân tách hoàn toàn:**
- 2 bảng dữ liệu riêng: `users` (quản lý) và `customers` (khách hàng)
- 2 authentication systems riêng
- 2 routing systems riêng
- Middleware/Guards ngăn chặn truy cập trái phép

---

## 2. Admin Panel (Hệ thống quản lý)

### 2.1. Tổng quan

**Mục đích:** Quản lý toàn bộ hệ thống homestay và hotel booking

**Đối tượng sử dụng:**
- **Super Admin:** Quản lý toàn hệ thống
- **Owner:** Quản lý doanh nghiệp và tất cả homestay/hotel
- **Manager:** Quản lý homestay/hotel được gán
- **Staff:** Thực hiện các tác vụ theo quyền (Receptionist, Housekeeping, Service Staff, Accountant)

**URL Base:** `/admin` hoặc `/dashboard`

**Authentication:** JWT Token (từ bảng `users`)

### 2.2. Cấu trúc Admin Panel

#### 2.2.1. Layout & Navigation

**Sidebar Navigation:**
```
Dashboard
├── Tổng quan
├── Thống kê nhanh
└── Báo cáo tổng hợp

Quản lý Cơ sở Lưu trú
├── Danh sách Homestay/Hotel
├── Tạo mới Homestay/Hotel
├── Quản lý Tầng (Hotel)
└── Duyệt Homestay/Hotel (Super Admin)

Quản lý Phòng
├── Danh sách Phòng
├── Tạo mới Phòng/RoomType
├── Quản lý Trạng thái Phòng (Hotel)
└── Quản lý Giá cả

Quản lý Dịch vụ (Hotel)
├── Danh sách Dịch vụ
├── Tạo mới Dịch vụ
├── Quản lý Đặt dịch vụ
└── Quản lý Bàn/Phòng Spa (nếu có)

Quản lý Booking
├── Danh sách Booking
├── Lịch đặt phòng (Calendar)
├── Check-in/Check-out
└── Quản lý Hóa đơn (Hotel)

Quản lý Thanh toán
├── Danh sách Giao dịch
├── Xử lý Hoàn tiền
└── Báo cáo Doanh thu

Quản lý Khách hàng
├── Danh sách Khách hàng
└── Chi tiết Khách hàng

Quản lý Đánh giá
├── Danh sách Đánh giá
├── Duyệt Đánh giá
└── Phản hồi Đánh giá

Quản lý Khuyến mãi
├── Danh sách Khuyến mãi
├── Tạo mới Khuyến mãi
└── Lịch sử Sử dụng

Quản lý Người dùng (Super Admin, Owner)
├── Danh sách Users
├── Tạo mới User
├── Phân quyền
└── Gán Homestay/Hotel

Báo cáo & Thống kê
├── Báo cáo Doanh thu
├── Báo cáo Booking
├── Báo cáo Dịch vụ (Hotel)
└── Báo cáo Đánh giá

Cài đặt
├── Cấu hình Hệ thống (Super Admin)
├── Cấu hình Phí dịch vụ (Super Admin)
└── Quản lý Tài khoản
```

#### 2.2.2. Chức năng theo Role

##### Super Admin

**Quyền truy cập:**
- ✅ Tất cả chức năng trong hệ thống
- ✅ Duyệt/từ chối homestay/hotel mới
- ✅ Quản lý người dùng toàn hệ thống (tạo Owner, Manager, Staff)
- ✅ Xem báo cáo tổng quan toàn hệ thống
- ✅ Cấu hình hệ thống (phí dịch vụ, commission)
- ✅ Quản lý tài khoản Super Admin khác

**Màn hình chính:**
- Dashboard tổng quan hệ thống
- Danh sách homestay/hotel chờ duyệt
- Quản lý người dùng
- Báo cáo tổng hợp

##### Owner

**Quyền truy cập:**
- ✅ Quản lý toàn bộ doanh nghiệp (tất cả homestay/hotel)
- ✅ Tạo và quản lý homestay/hotel
- ✅ Tạo và quản lý Manager, Staff
- ✅ Gán Manager quản lý homestay/hotel
- ✅ Xem tất cả dữ liệu và báo cáo tổng hợp
- ✅ Cấu hình chung cho doanh nghiệp
- ✅ Quản lý thanh toán và doanh thu

**Màn hình chính:**
- Dashboard tổng quan doanh nghiệp
- Quản lý homestay/hotel
- Quản lý nhân viên
- Báo cáo doanh thu

##### Manager

**Quyền truy cập:**
- ✅ Quản lý homestay/hotel được gán
- ✅ Quản lý phòng, giá cả, lịch đặt phòng
- ✅ Quản lý booking, check-in/check-out
- ✅ Quản lý dịch vụ (đối với hotel)
- ✅ Quản lý nhân viên (nếu được Owner cấp quyền)
- ✅ Xem báo cáo của homestay/hotel được gán
- ❌ Không thể tạo homestay/hotel mới
- ❌ Không thể thay đổi cấu hình quan trọng

**Màn hình chính:**
- Dashboard homestay/hotel được gán
- Quản lý booking
- Quản lý phòng và giá cả
- Báo cáo homestay/hotel

##### Staff (Receptionist, Housekeeping, Service Staff, Accountant)

**Receptionist (Lễ tân):**
- ✅ Xem booking
- ✅ Check-in/check-out
- ✅ Cập nhật trạng thái booking
- ✅ Xem lịch đặt phòng
- ❌ Không thể chỉnh sửa thông tin homestay/hotel

**Housekeeping (Nhân viên phục vụ):**
- ✅ Xem lịch dọn phòng
- ✅ Cập nhật trạng thái phòng (clean, dirty, maintenance)
- ✅ Xem thông tin booking
- ❌ Không thể check-in/check-out

**Service Staff (Nhân viên dịch vụ):**
- ✅ Quản lý đặt dịch vụ (spa, nhà hàng)
- ✅ Xác nhận/hủy đặt dịch vụ
- ✅ Gán nhân viên/bàn cho booking dịch vụ
- ✅ Xem lịch đặt dịch vụ
- ❌ Không thể quản lý booking phòng

**Accountant (Kế toán):**
- ✅ Xem báo cáo
- ✅ Quản lý hóa đơn
- ✅ Xem thống kê doanh thu
- ❌ Không thể check-in/check-out

### 2.3. Các Module chính trong Admin Panel

#### 2.3.1. Dashboard Module

**Chức năng:**
- Tổng quan nhanh: số booking, doanh thu, tỷ lệ lấp đầy
- Biểu đồ doanh thu theo thời gian
- Thống kê booking theo trạng thái
- Top homestay/hotel có doanh thu cao nhất
- Thông báo và cảnh báo

**Dữ liệu hiển thị:**
- **Super Admin:** Tổng quan toàn hệ thống
- **Owner:** Tổng quan doanh nghiệp
- **Manager:** Tổng quan homestay/hotel được gán
- **Staff:** Thông tin liên quan đến công việc

#### 2.3.2. Accommodation Management Module

**Chức năng:**
- Danh sách homestay/hotel (lọc, tìm kiếm)
- Tạo mới homestay/hotel
- Chỉnh sửa thông tin homestay/hotel
- Upload hình ảnh (tối thiểu 3-5 ảnh, tối đa 20-50 ảnh)
- Quản lý tiện ích
- Quản lý chính sách (check-in/check-out, hủy phòng)
- Tạm ngưng/hoạt động lại
- Duyệt homestay/hotel (Super Admin)

**Đặc biệt cho Hotel:**
- Quản lý tầng (Floor Management)
- Quản lý hạng sao
- Thông tin liên hệ (số điện thoại, email, website)
- Giờ check-in/check-out mặc định

#### 2.3.3. Room Management Module

**Chức năng cho Homestay:**
- Danh sách phòng
- Tạo mới phòng
- Chỉnh sửa thông tin phòng
- Upload hình ảnh phòng
- Quản lý tiện ích trong phòng
- Xóa phòng (chỉ khi không có booking trong 30 ngày tới)

**Chức năng cho Hotel:**
- Quản lý RoomType (loại phòng)
- Quản lý Room (phòng cụ thể)
- Gán phòng vào tầng
- Quản lý trạng thái phòng (available, occupied, dirty, clean, maintenance, out_of_order)
- Dashboard trạng thái phòng theo tầng
- Block/unblock phòng để bảo trì

#### 2.3.4. Pricing Management Module

**Chức năng:**
- Thiết lập giá cơ bản cho từng loại phòng
- Thiết lập giá theo mùa (high season, low season)
- Thiết lập giá theo ngày trong tuần
- Thiết lập giá khuyến mãi (promotion)
- Thiết lập phụ thu thêm khách
- Xem lịch sử thay đổi giá
- Calendar view cho giá theo ngày

**Quy tắc hiển thị:**
- Không thể thay đổi giá cho các ngày đã có booking
- Hiển thị cảnh báo khi thay đổi giá
- Preview giá cuối cùng dựa trên công thức tính giá

#### 2.3.5. Booking Management Module

**Chức năng:**
- Danh sách booking (lọc theo trạng thái, ngày, homestay/hotel)
- Tìm kiếm booking (theo mã booking, tên khách, email)
- Xem chi tiết booking
- Tạo booking thủ công (cho khách walk-in)
- Check-in/check-out
- Đánh dấu no-show
- Hủy booking
- Gửi thông báo cho khách hàng

**Calendar View:**
- Lịch đặt phòng theo tháng/năm
- Trạng thái phòng: available, booked, blocked
- Block/unblock phòng cho các ngày cụ thể
- Xem chi tiết booking cho từng ngày

**Đặc biệt cho Hotel:**
- Gán phòng cụ thể khi check-in (nếu chưa gán)
- Quản lý dịch vụ phát sinh trong thời gian lưu trú
- Xem lịch theo tầng hoặc loại phòng

#### 2.3.6. Service Management Module (Hotel only)

**Chức năng:**
- Danh sách dịch vụ (nhà hàng, spa, gym, hồ bơi, phòng họp, etc.)
- Tạo mới dịch vụ
- Chỉnh sửa thông tin dịch vụ
- Quản lý ServiceItem (menu nhà hàng, dịch vụ spa)
- Quản lý RestaurantTable (bàn nhà hàng)
- Quản lý SpaRoom (phòng spa)
- Quản lý đặt dịch vụ (Service Booking)
- Lịch đặt dịch vụ theo ngày/giờ
- Gán nhân viên/bàn cho booking dịch vụ

**Quản lý đặt dịch vụ:**
- Danh sách booking dịch vụ (attached và standalone)
- Xác nhận/hủy booking dịch vụ
- Đánh dấu no-show
- Quản lý capacity (sức chứa) cho từng slot thời gian
- Gửi thông báo nhắc nhở

#### 2.3.7. Payment Management Module

**Chức năng:**
- Danh sách giao dịch thanh toán
- Xem chi tiết giao dịch
- Xử lý hoàn tiền (refund)
- Lọc theo trạng thái, phương thức thanh toán
- Export báo cáo giao dịch

#### 2.3.8. Invoice Management Module (Hotel only)

**Chức năng:**
- Tạo hóa đơn khi check-out
- Xem danh sách hóa đơn
- In hóa đơn
- Gửi hóa đơn qua email
- Quản lý lịch sử hóa đơn

#### 2.3.9. Customer Management Module

**Chức năng:**
- Danh sách khách hàng (lọc, tìm kiếm)
- Xem chi tiết khách hàng
- Xem lịch sử booking của khách hàng
- Vô hiệu hóa tài khoản khách hàng (nếu vi phạm)
- ❌ Không thể tạo tài khoản khách hàng (khách hàng tự đăng ký)

#### 2.3.10. Review Management Module

**Chức năng:**
- Danh sách đánh giá (lọc theo trạng thái, homestay/hotel)
- Xem chi tiết đánh giá
- Duyệt/từ chối đánh giá
- Phản hồi đánh giá từ Owner/Manager
- Thống kê đánh giá: điểm trung bình, số lượng đánh giá, phân bố sao

#### 2.3.11. Promotion Management Module

**Chức năng:**
- Danh sách khuyến mãi
- Tạo mới khuyến mãi (coupon, seasonal, flash_sale)
- Chỉnh sửa khuyến mãi
- Xem lịch sử sử dụng khuyến mãi
- Quản lý mã giảm giá

#### 2.3.12. User Management Module (Super Admin, Owner)

**Chức năng:**
- Danh sách users (lọc theo role)
- Tạo mới user (Owner, Manager, Staff)
- Chỉnh sửa thông tin user
- Gán quyền cho user
- Gán user vào homestay/hotel
- Vô hiệu hóa/xóa user
- Đặt lại mật khẩu

#### 2.3.13. Reporting & Analytics Module

**Chức năng:**
- Báo cáo doanh thu (theo ngày/tuần/tháng/năm, theo homestay/hotel)
- Báo cáo booking (số lượng, tỷ lệ hủy, tỷ lệ lấp đầy)
- Báo cáo dịch vụ (Hotel) - doanh thu từng loại dịch vụ
- Báo cáo đánh giá (điểm trung bình, xu hướng)
- Export báo cáo (PDF, Excel)
- Biểu đồ và visualization

**Đặc biệt cho Hotel:**
- Thống kê theo tầng
- Thống kê theo loại phòng
- ADR (Average Daily Rate)
- RevPAR (Revenue Per Available Room)

### 2.4. Authentication & Authorization

**Authentication:**
- Login với email và password (từ bảng `users`)
- JWT token cho session
- Refresh token mechanism
- Remember me option

**Authorization:**
- Role-based access control (RBAC)
- Permission-based access control
- Route guards để kiểm tra quyền truy cập
- Component-level permissions

**Middleware/Guards:**
- `JwtAuthGuard`: Xác thực JWT token
- `RolesGuard`: Kiểm tra role (Super Admin, Owner, Manager, Staff)
- `PermissionsGuard`: Kiểm tra permissions cụ thể
- `AccommodationGuard`: Kiểm tra quyền truy cập homestay/hotel cụ thể

---

## 3. Customer Frontend (Giao diện khách hàng)

### 3.1. Tổng quan

**Mục đích:** Giao diện cho khách hàng tìm kiếm, đặt phòng và quản lý booking

**Đối tượng sử dụng:**
- **Customers:** Khách hàng đã đăng ký
- **Guests:** Khách hàng chưa đăng nhập (có thể đặt phòng nhưng không có lợi ích)

**URL Base:** `/` hoặc `/booking`

**Authentication:** JWT Token (từ bảng `customers`)

### 3.2. Cấu trúc Customer Frontend

#### 3.2.1. Layout & Navigation

**Header Navigation:**
```
Logo
├── Tìm kiếm Homestay/Hotel
├── Đặt phòng
├── Đặt dịch vụ (Hotel)
├── Về chúng tôi
└── [Đăng nhập / Tài khoản]
    ├── Đăng nhập
    ├── Đăng ký
    └── (Nếu đã đăng nhập)
        ├── Tài khoản của tôi
        ├── Booking của tôi
        ├── Đánh giá của tôi
        └── Đăng xuất
```

**Footer:**
- Thông tin liên hệ
- Chính sách
- Hỗ trợ
- Mạng xã hội

### 3.3. Các Module chính trong Customer Frontend

#### 3.3.1. Homepage Module

**Chức năng:**
- Hero section với search form
- Featured homestay/hotel
- Top đánh giá
- Khuyến mãi nổi bật
- Blog/Tin tức (nếu có)

**Search Form:**
- Địa điểm (tỉnh/thành phố, quận/huyện)
- Ngày check-in, check-out
- Số lượng khách (người lớn, trẻ em)
- Số lượng phòng
- Loại hình lưu trú (Homestay, Hotel, Tất cả)
- Nút "Tìm kiếm"

#### 3.3.2. Search & Listing Module

**Chức năng:**
- Kết quả tìm kiếm homestay/hotel
- Lọc kết quả:
  - Khoảng giá
  - Tiện ích (wifi, điều hòa, bếp, hồ bơi, spa, gym, etc.)
  - Đánh giá (sao)
  - Hạng sao (Hotel)
  - Dịch vụ cụ thể (Hotel)
  - Khoảng cách từ điểm đến
  - Có thể hủy miễn phí
- Sắp xếp:
  - Giá tăng dần
  - Giá giảm dần
  - Đánh giá cao nhất
  - Mới nhất
  - Hạng sao (Hotel)
- Hiển thị:
  - Danh sách (List view)
  - Bản đồ (Map view)
  - Kết hợp (List + Map)

**Card hiển thị:**
- Hình ảnh chính
- Tên homestay/hotel
- Địa chỉ
- Đánh giá (sao, số lượng đánh giá)
- Giá mỗi đêm
- Tiện ích nổi bật
- Nút "Xem chi tiết"

#### 3.3.3. Accommodation Detail Module

**Chức năng:**
- Thông tin chi tiết homestay/hotel:
  - Gallery hình ảnh (lightbox)
  - Tên, địa chỉ, bản đồ
  - Mô tả chi tiết
  - Tiện ích
  - Chính sách (check-in/check-out, hủy phòng, trẻ em, thú cưng)
  - Đánh giá và nhận xét
- Danh sách phòng và giá:
  - Thông tin từng loại phòng
  - Hình ảnh phòng
  - Tiện ích trong phòng
  - Giá theo ngày (calendar)
  - Số phòng còn trống
  - Nút "Đặt phòng"
- Đối với Hotel:
  - Thông tin dịch vụ (nhà hàng, spa, gym, hồ bơi, etc.)
  - Tầng chứa dịch vụ
  - Có thể đặt dịch vụ kèm hoặc đặt riêng

**Booking Widget (Sticky):**
- Hiển thị giá tổng cộng
- Ngày check-in/check-out
- Số lượng khách
- Nút "Đặt phòng ngay"

#### 3.3.4. Room Detail Module

**Chức năng:**
- Thông tin chi tiết phòng:
  - Gallery hình ảnh
  - Mô tả
  - Tiện ích
  - Diện tích
  - Số lượng khách tối đa
  - Loại giường
- Giá theo ngày (calendar)
- Availability calendar
- Nút "Đặt phòng"

#### 3.3.5. Booking Module

**Chức năng:**
- Form đặt phòng:
  - Thông tin khách hàng (nếu chưa đăng nhập: tên, email, số điện thoại)
  - Ngày check-in/check-out
  - Số lượng phòng
  - Số lượng khách (người lớn, trẻ em)
  - Yêu cầu đặc biệt
  - Đối với Hotel:
    - Chọn phòng cụ thể (nếu cho phép)
    - Chọn dịch vụ kèm (bữa sáng, spa, etc.)
- Tổng tiền:
  - Giá phòng (theo số đêm)
  - Phụ thu thêm khách
  - Phí dịch vụ (%)
  - Thuế VAT
  - Giảm giá (nếu có mã khuyến mãi)
  - Tổng cộng
- Áp dụng mã khuyến mãi
- Xác nhận đặt phòng
- Chuyển đến trang thanh toán

**Quy tắc:**
- Phải đăng nhập hoặc cung cấp thông tin liên hệ
- Số lượng khách không được vượt quá max_guests
- Phải có đủ phòng trống
- Giá được tính và giữ cố định

#### 3.3.6. Service Booking Module (Hotel)

**Chức năng đặt dịch vụ kèm:**
- Chọn dịch vụ khi đặt phòng
- Chọn dịch vụ trong thời gian lưu trú

**Chức năng đặt dịch vụ riêng (Standalone):**
- Đặt bàn nhà hàng:
  - Chọn hotel và nhà hàng
  - Chọn ngày, giờ
  - Chọn số lượng người
  - Chọn loại bàn
  - Thông tin liên hệ
  - Xem menu và giá
- Đặt spa:
  - Chọn hotel và spa
  - Chọn dịch vụ spa
  - Chọn ngày, giờ
  - Chọn phòng spa (nếu có nhiều phòng)
  - Thông tin liên hệ
  - Xem giá dịch vụ
- Đặt phòng họp:
  - Chọn hotel và phòng họp
  - Chọn ngày, giờ bắt đầu, giờ kết thúc
  - Chọn số lượng người
  - Chọn dịch vụ kèm (catering, coffee break, equipment)
  - Thông tin liên hệ
  - Xem giá thuê phòng và dịch vụ
- Đặt gym/hồ bơi:
  - Chọn hotel và dịch vụ
  - Chọn ngày, slot thời gian (nếu có giới hạn)
  - Thông tin liên hệ
  - Xem giá (nếu tính phí) hoặc miễn phí
- Xác nhận đặt dịch vụ
- Chuyển đến trang thanh toán (nếu cần)

#### 3.3.7. Payment Module

**Chức năng:**
- Chọn phương thức thanh toán:
  - Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
  - Ví điện tử (MoMo, ZaloPay, VNPay)
  - Chuyển khoản ngân hàng
  - Thanh toán tại cơ sở (nếu cho phép)
- Nhập thông tin thanh toán (tùy phương thức)
- Xác nhận thanh toán
- Xử lý thanh toán (redirect đến payment gateway)
- Kết quả thanh toán:
  - Thành công: Hiển thị mã booking, gửi email xác nhận
  - Thất bại: Cho phép thử lại (tối đa 3 lần)

**Quy tắc:**
- Thời gian giữ chỗ (hold time): 15 phút
- Sau 15 phút nếu chưa thanh toán, booking tự động hủy
- Thanh toán thất bại: cho phép thử lại

#### 3.3.8. My Bookings Module (Customer đã đăng nhập)

**Chức năng:**
- Danh sách booking phòng:
  - Lọc theo trạng thái (pending_payment, confirmed, cancelled, completed)
  - Tìm kiếm theo mã booking
  - Xem chi tiết booking:
    - Thông tin homestay/hotel, phòng
    - Ngày check-in/check-out
    - Số lượng khách, phòng
    - Tổng tiền, trạng thái thanh toán
    - Mã booking
  - Hủy booking (theo chính sách hủy)
  - In/tải voucher booking
  - Liên hệ Owner/Manager
- Danh sách booking dịch vụ:
  - Lọc theo loại dịch vụ, trạng thái
  - Xem chi tiết booking dịch vụ:
    - Thông tin hotel và dịch vụ
    - Ngày, giờ đặt
    - Số lượng người/slot
    - Tổng tiền, trạng thái thanh toán
    - Mã booking dịch vụ
  - Hủy booking dịch vụ (trước 1 giờ hoặc theo chính sách)
  - In/tải voucher booking dịch vụ
  - Liên hệ hotel

#### 3.3.9. My Account Module (Customer đã đăng nhập)

**Chức năng:**
- Thông tin cá nhân:
  - Xem/chỉnh sửa profile
  - Đổi mật khẩu
  - Quản lý phương thức thanh toán (thẻ tín dụng, ví điện tử)
- Lịch sử booking
- Đánh giá của tôi
- Điểm tích lũy (Loyalty Points) - nếu có
- Cài đặt thông báo

#### 3.3.10. Review Module

**Chức năng:**
- Đánh giá sau khi check-out:
  - Số sao (1-5)
  - Nhận xét chi tiết
  - Đánh giá theo tiêu chí: vị trí, giá trị, vệ sinh, dịch vụ, tiện ích
  - Upload ảnh (tùy chọn)
- Chỉnh sửa/xóa đánh giá (trong vòng 7 ngày)
- Xem đánh giá của khách hàng khác:
  - Lọc theo điểm đánh giá
  - Sắp xếp theo mới nhất, hữu ích nhất
  - Phản hồi từ Owner/Manager

#### 3.3.11. Authentication Module

**Chức năng:**
- Đăng ký:
  - Email (unique)
  - Mật khẩu (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số)
  - Số điện thoại
  - Họ tên
  - Ngày sinh (tùy chọn)
  - Xác thực email sau khi đăng ký
- Đăng nhập:
  - Email và mật khẩu
  - Remember me
  - Quên mật khẩu (reset password)
- Đăng xuất

**Quy tắc:**
- Email phải unique trong hệ thống
- Phải xác thực email trước khi có thể đặt phòng
- Khách hàng có thể đặt phòng mà không cần đăng ký (guest checkout), nhưng đăng ký sẽ có nhiều lợi ích hơn

### 3.4. Authentication & Authorization

**Authentication:**
- Login với email và password (từ bảng `customers`)
- JWT token cho session
- Refresh token mechanism
- Guest checkout (không cần đăng nhập)

**Authorization:**
- Customer chỉ có thể xem/chỉnh sửa dữ liệu của mình
- Guest có thể đặt phòng nhưng không có quyền truy cập "My Bookings"
- Middleware/Guard ngăn Customer truy cập Admin Panel

---

## 4. Technology Stack

### 4.1. Framework & Libraries

**Core Framework:**
- **Next.js 16+ (React 19.2)**
  - Server-side rendering (SSR) cho SEO
  - Static site generation (SSG) cho performance
  - API routes cho BFF pattern
  - TypeScript support
  - App Router (Next.js 13+)

**UI Framework:**
- **Tailwind CSS** (hoặc **Material-UI** / **Ant Design**)
  - Utility-first CSS framework
  - Responsive design
  - Custom components

**State Management:**
- **Zustand** hoặc **Redux Toolkit**
  - Global state management
  - User session, cart, filters

**Form Management:**
- **React Hook Form**
  - Form validation
  - Performance optimization

**Data Fetching:**
- **TanStack Query (React Query)**
  - Server state management
  - Caching, refetching
  - Optimistic updates

**Routing:**
- **Next.js App Router**
  - File-based routing
  - Dynamic routes
  - Route groups

### 4.2. UI Components

**Component Library:**
- **shadcn/ui** (hoặc **Radix UI** + **Tailwind CSS**)
  - Accessible components
  - Customizable
  - TypeScript support

**Icons:**
- **Lucide React** hoặc **Heroicons**

**Charts & Visualization:**
- **Recharts** hoặc **Chart.js**
  - Dashboard charts
  - Analytics visualization

**Maps:**
- **Google Maps API** hoặc **Mapbox**
  - Hiển thị vị trí homestay/hotel
  - Tìm kiếm theo vị trí

**Date Picker:**
- **react-datepicker** hoặc **@radix-ui/react-calendar**
  - Check-in/check-out date selection
  - Calendar view

**Image Gallery:**
- **react-image-gallery** hoặc **swiper**
  - Gallery cho homestay/hotel, phòng

### 4.3. Authentication

**Libraries:**
- **next-auth** hoặc **Auth.js**
  - JWT authentication
  - Session management
  - OAuth support (nếu cần)

### 4.4. Payment Integration

**Libraries:**
- Payment gateway SDKs:
  - VNPay SDK
  - MoMo SDK
  - ZaloPay SDK
  - Stripe SDK

### 4.5. Development Tools

**Code Quality:**
- **ESLint** + **Prettier**
- **TypeScript** (strict mode)
- **Husky** (pre-commit hooks)

**Testing:**
- **Jest** + **React Testing Library**
- **Cypress** hoặc **Playwright** (E2E)

**Build & Deploy:**
- **Vercel** (recommended cho Next.js)
- **Docker** (nếu self-hosted)

---

## 5. Kiến trúc Frontend

### 5.1. Cấu trúc thư mục

```
frontend/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin Panel Routes
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── accommodations/
│   │   │   ├── rooms/
│   │   │   ├── bookings/
│   │   │   ├── services/
│   │   │   ├── payments/
│   │   │   ├── customers/
│   │   │   ├── reviews/
│   │   │   ├── promotions/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   └── layout.tsx            # Admin Layout
│   │
│   ├── (customer)/               # Customer Frontend Routes
│   │   ├── page.tsx              # Homepage
│   │   ├── search/
│   │   ├── accommodations/
│   │   │   └── [id]/
│   │   ├── rooms/
│   │   │   └── [id]/
│   │   ├── booking/
│   │   ├── payment/
│   │   ├── services/
│   │   ├── my-bookings/
│   │   ├── my-account/
│   │   └── layout.tsx             # Customer Layout
│   │
│   ├── api/                      # API Routes (BFF)
│   │   ├── auth/
│   │   ├── accommodations/
│   │   ├── bookings/
│   │   └── ...
│   │
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   └── layout.tsx                 # Root Layout
│
├── components/                   # Shared Components
│   ├── ui/                       # Base UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── admin/                    # Admin-specific Components
│   │   ├── sidebar/
│   │   ├── dashboard/
│   │   ├── booking-calendar/
│   │   └── ...
│   │
│   ├── customer/                 # Customer-specific Components
│   │   ├── search-form/
│   │   ├── accommodation-card/
│   │   ├── booking-widget/
│   │   └── ...
│   │
│   └── shared/                   # Shared Components
│       ├── header/
│       ├── footer/
│       ├── map/
│       └── ...
│
├── lib/                          # Utilities & Config
│   ├── api/                      # API Client
│   │   ├── client.ts
│   │   ├── accommodations.ts
│   │   ├── bookings.ts
│   │   └── ...
│   │
│   ├── auth/                     # Authentication
│   │   ├── config.ts
│   │   └── guards.ts
│   │
│   ├── utils/                    # Utility Functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── ...
│   │
│   └── constants/                # Constants
│       ├── routes.ts
│       └── ...
│
├── hooks/                        # Custom Hooks
│   ├── use-auth.ts
│   ├── use-booking.ts
│   ├── use-search.ts
│   └── ...
│
├── store/                        # State Management
│   ├── auth-store.ts
│   ├── booking-store.ts
│   └── ...
│
├── types/                        # TypeScript Types
│   ├── accommodation.ts
│   ├── booking.ts
│   ├── user.ts
│   └── ...
│
└── styles/                       # Global Styles
    └── globals.css
```

### 5.2. Routing Strategy

**Admin Panel Routes:**
```
/admin
├── /dashboard                    # Dashboard
├── /accommodations               # Quản lý cơ sở lưu trú
│   ├── /                         # Danh sách
│   ├── /create                   # Tạo mới
│   └── /[id]                     # Chi tiết
│       ├── /edit                 # Chỉnh sửa
│       └── /floors               # Quản lý tầng (Hotel)
├── /rooms                        # Quản lý phòng
├── /pricing                      # Quản lý giá cả
├── /bookings                     # Quản lý booking
│   ├── /calendar                 # Lịch đặt phòng
│   └── /[id]                     # Chi tiết booking
├── /services                     # Quản lý dịch vụ (Hotel)
├── /payments                     # Quản lý thanh toán
├── /customers                    # Quản lý khách hàng
├── /reviews                      # Quản lý đánh giá
├── /promotions                   # Quản lý khuyến mãi
├── /users                        # Quản lý người dùng (Super Admin, Owner)
└── /reports                      # Báo cáo & Thống kê
```

**Customer Frontend Routes:**
```
/
├── /                             # Homepage
├── /search                       # Tìm kiếm
├── /accommodations
│   └── /[id]                     # Chi tiết homestay/hotel
├── /rooms
│   └── /[id]                     # Chi tiết phòng
├── /booking                       # Đặt phòng
├── /payment                       # Thanh toán
├── /services                      # Đặt dịch vụ (Hotel)
│   ├── /restaurant                # Đặt bàn nhà hàng
│   ├── /spa                       # Đặt spa
│   └── /meeting-room              # Đặt phòng họp
├── /my-bookings                   # Booking của tôi (Customer)
├── /my-account                    # Tài khoản của tôi (Customer)
├── /auth
│   ├── /login                     # Đăng nhập
│   ├── /register                  # Đăng ký
│   └── /forgot-password           # Quên mật khẩu
└── /reviews                       # Đánh giá
```

### 5.3. State Management Strategy

**Global State (Zustand/Redux):**
- User session (auth state)
- Shopping cart (booking data)
- Search filters
- UI state (sidebar, modals)

**Server State (TanStack Query):**
- Accommodations data
- Bookings data
- User profile
- Cached API responses

**Local State (React useState):**
- Form inputs
- UI toggles
- Component-specific state

### 5.4. API Integration

**BFF Pattern (Backend for Frontend):**
- Next.js API routes (`/app/api/`) làm proxy
- Transform data cho frontend
- Handle authentication
- Cache responses

**API Client:**
- Centralized API client với interceptors
- Error handling
- Request/response transformation
- TypeScript types

---

## 6. Responsive Design

### 6.1. Breakpoints

**Mobile:** < 768px
**Tablet:** 768px - 1024px
**Desktop:** > 1024px

### 6.2. Mobile-First Approach

- Design mobile-first
- Progressive enhancement
- Touch-friendly UI
- Optimized images

---

## 7. Performance Optimization

### 7.1. Next.js Optimizations

- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automatic với App Router
- **Static Generation:** SSG cho pages tĩnh
- **Incremental Static Regeneration:** ISR cho dynamic content

### 7.2. Caching Strategy

- **API Responses:** TanStack Query cache
- **Static Assets:** CDN caching
- **Images:** Next.js Image optimization + CDN

### 7.3. Bundle Optimization

- **Tree Shaking:** Remove unused code
- **Code Splitting:** Dynamic imports
- **Bundle Analysis:** webpack-bundle-analyzer

---

## 8. Security

### 8.1. Client-Side Security

- **XSS Prevention:** Sanitize user inputs
- **CSRF Protection:** Token-based
- **Secure Storage:** HttpOnly cookies cho tokens
- **Content Security Policy:** CSP headers

### 8.2. Authentication Security

- **JWT Tokens:** Secure storage
- **Refresh Tokens:** Rotation mechanism
- **Session Management:** Secure logout

---

## 9. Testing Strategy

### 9.1. Unit Tests

- Components
- Hooks
- Utilities
- State management

### 9.2. Integration Tests

- API integration
- Form submissions
- Authentication flows

### 9.3. E2E Tests

- Critical user flows:
  - Search → View → Book → Pay
  - Admin: Create accommodation → Manage booking
- Cypress hoặc Playwright

---

## 10. Deployment

### 10.1. Hosting Options

**Recommended:**
- **Vercel** (Next.js native support)
- **Netlify**
- **AWS Amplify**

**Self-hosted:**
- Docker container
- Kubernetes (nếu scale lớn)

### 10.2. CI/CD Pipeline

- **GitHub Actions** / **GitLab CI**
- Automated testing
- Build & deploy
- Environment variables management

---

## 11. Monitoring & Analytics

### 11.1. Error Tracking

- **Sentry** (error tracking)
- **LogRocket** (session replay)

### 11.2. Analytics

- **Google Analytics** / **Plausible**
- User behavior tracking
- Conversion tracking

### 11.3. Performance Monitoring

- **Web Vitals** (Core Web Vitals)
- **Lighthouse** (performance audits)

---

## 12. Accessibility (a11y)

### 12.1. WCAG Compliance

- **Keyboard Navigation:** Full keyboard support
- **Screen Readers:** ARIA labels
- **Color Contrast:** WCAG AA compliance
- **Focus Management:** Visible focus indicators

### 12.2. Best Practices

- Semantic HTML
- Alt text cho images
- Form labels
- Error messages

---

## 13. Internationalization (i18n)

### 13.1. Multi-language Support

- **next-intl** hoặc **react-i18next**
- Support languages: Vietnamese, English (có thể mở rộng)

### 13.2. Localization

- Date/time formatting
- Currency formatting
- Number formatting

---

## 14. Roadmap & Phases

### Phase 1: MVP (3-4 tháng)

**Admin Panel:**
- Authentication
- Dashboard
- Accommodation management
- Room management
- Booking management
- Basic reporting

**Customer Frontend:**
- Homepage
- Search & listing
- Accommodation detail
- Booking flow
- Payment integration
- My bookings

### Phase 2: Enhancement (2-3 tháng)

**Admin Panel:**
- Service management (Hotel)
- Advanced reporting
- User management
- Review management

**Customer Frontend:**
- Service booking (Hotel)
- Reviews & ratings
- My account
- Promotions

### Phase 3: Advanced Features (2-3 tháng)

- Advanced search filters
- Map integration
- Real-time notifications
- Mobile app (nếu cần)

---

## 15. Best Practices

### 15.1. Code Organization

- **Component-based:** Reusable components
- **Feature-based:** Group by features
- **Separation of concerns:** UI, logic, data

### 15.2. TypeScript

- **Strict mode:** Enable strict TypeScript
- **Type safety:** Avoid `any`
- **Interfaces:** Define clear interfaces

### 15.3. Performance

- **Lazy loading:** Code splitting
- **Image optimization:** Next.js Image
- **Bundle size:** Monitor và optimize

### 15.4. User Experience

- **Loading states:** Show loading indicators
- **Error handling:** User-friendly error messages
- **Feedback:** Success/error notifications
- **Accessibility:** WCAG compliance

---

**Lưu ý:** Tài liệu này sẽ được cập nhật thường xuyên dựa trên feedback và thay đổi requirements.

