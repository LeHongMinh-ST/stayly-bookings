# Nghiệp vụ hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan hệ thống

Hệ thống quản lý homestay và khách sạn booking là một nền tảng cho phép:
- Owner/Manager quản lý thông tin cơ sở lưu trú, phòng, giá cả, lịch đặt phòng
- Khách hàng tìm kiếm, xem chi tiết, đặt phòng và thanh toán online cho cả homestay và khách sạn
- Quản trị viên quản lý toàn bộ hệ thống, người dùng và giao dịch

### 1.1. Phân loại loại hình lưu trú (Accommodation Types)

Hệ thống hỗ trợ 2 loại hình lưu trú chính:

**Homestay:**
- Cơ sở lưu trú nhỏ, thường do gia đình quản lý
- Số lượng phòng hạn chế (thường < 10 phòng)
- Môi trường thân thiện, gần gũi
- Tiện ích đơn giản, tập trung vào trải nghiệm địa phương

**Hotel (Khách sạn):**
- Cơ sở lưu trú lớn, chuyên nghiệp
- Số lượng phòng nhiều (có thể hàng trăm phòng)
- Nhiều tầng, nhiều khu vực
- Dịch vụ đầy đủ: nhà hàng, spa, gym, hội trường, v.v.
- Hệ thống quản lý phức tạp hơn
- Có thể có nhiều loại phòng và gói dịch vụ

## 2. Quản lý Homestays và Hotels

### 2.1. Đăng ký và quản lý tài khoản

**Đặc điểm hệ thống:**
- Hệ thống dành cho một doanh nghiệp quản lý nhiều homestay và hotel
- **Phân tách tài khoản:**
  - **Tài khoản quản lý (Users):** Super Admin, Owner, Manager, Staff
    - Được tạo bởi người có quyền
    - Đăng nhập vào hệ thống quản lý (Admin Panel/Backend)
    - Quản lý homestay/hotel, booking, nhân viên, báo cáo
  - **Tài khoản khách hàng (Customers):** Customer/Guest
    - Tự đăng ký
    - Đăng nhập vào giao diện khách hàng (Frontend/Website/App)
    - Chỉ có thể đặt phòng, xem booking của mình, đánh giá
    - **KHÔNG THỂ** đăng nhập vào hệ thống quản lý

**Nghiệp vụ đăng ký cho Customer (Khách hàng):**
- Khách hàng tự đăng ký tài khoản trên giao diện khách hàng (website/app) với thông tin:
  - Email (duy nhất trong hệ thống)
  - Mật khẩu (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số)
  - Số điện thoại
  - Họ tên
  - Ngày sinh (tùy chọn)
- Xác thực email sau khi đăng ký
- Đăng nhập/đăng xuất trên giao diện khách hàng
- Quản lý thông tin cá nhân: cập nhật profile, đổi mật khẩu
- Quản lý phương thức thanh toán (thẻ tín dụng, ví điện tử)
- **Không thể truy cập hệ thống quản lý (Admin Panel)**

**Quy tắc:**
- Email phải duy nhất trong bảng tương ứng (`users` hoặc `customers`). Một người có thể dùng cùng email cho cả 2 loại tài khoản nhưng chúng là 2 thực thể riêng biệt.
- Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số
- Phải xác thực email trước khi có thể đặt phòng
- Khách hàng có thể đặt phòng mà không cần đăng ký (guest checkout), nhưng đăng ký sẽ có nhiều lợi ích hơn (lưu lịch sử, tích điểm, v.v.)
- Customer và User là 2 bảng riêng biệt, đăng nhập ở 2 cổng khác nhau (`/admin` vs `/`), không thể chuyển đổi vai trò

### 2.1.1. Phân quyền và quản lý người dùng (Role-Based Access Control)

**Đặc điểm hệ thống:**
- Hệ thống dành cho một doanh nghiệp quản lý nhiều homestay và hotel
- Tất cả homestay/hotel thuộc về cùng một doanh nghiệp
- Nhân viên có thể làm việc cho nhiều homestay/hotel
- Báo cáo tổng hợp cho toàn bộ doanh nghiệp

**Các vai trò trong hệ thống:**

1. **Super Admin (Quản trị viên hệ thống):**
   - Quyền cao nhất trong hệ thống
   - Quản lý toàn bộ hệ thống
   - Quản lý người dùng toàn hệ thống
   - Xem báo cáo tổng quan
   - Cấu hình hệ thống
   - Quản lý phí dịch vụ, commission
   - Tạo tài khoản Owner, Manager, Staff

2. **Owner (Chủ sở hữu/Quản lý Doanh nghiệp):**
   - Được Super Admin tạo và gán quyền
   - Người quản lý toàn bộ doanh nghiệp, bao gồm tất cả homestay/hotel
   - Tạo và quản lý nhiều homestay/hotel
   - Tạo và quản lý các tài khoản Manager
   - Tạo và quản lý các tài khoản nhân viên (Staff)
   - Xem tất cả dữ liệu và báo cáo tổng hợp (tất cả homestay/hotel)
   - Cấu hình chung cho doanh nghiệp
   - Quản lý thanh toán và doanh thu tổng hợp
   - Gán Manager quản lý một hoặc nhiều homestay/hotel cụ thể
   - Không thể tự đăng ký, phải được Super Admin tạo

3. **Manager (Quản lý Homestay/Hotel):**
   - Được Owner hoặc Super Admin tạo và gán quyền
   - Có thể được gán quản lý một hoặc nhiều homestay/hotel
   - Quản lý homestay/hotel được gán:
     - Quản lý phòng, giá cả, lịch đặt phòng
     - Quản lý booking, check-in/check-out
     - Quản lý dịch vụ (đối với hotel)
   - Quản lý nhân viên (nếu được Owner cấp quyền)
   - Xem báo cáo của homestay/hotel được gán (hoặc tất cả nếu được cấp quyền)
   - Không thể tạo homestay/hotel mới hoặc thay đổi cấu hình quan trọng

4. **Staff (Nhân viên Homestay/Hotel):**
   - Được Manager, Owner hoặc Super Admin tạo và gán quyền
   - Có thể được gán làm việc cho một hoặc nhiều homestay/hotel
   - Quyền hạn tùy theo vai trò cụ thể:
     - **Receptionist (Lễ tân):** check-in/check-out, xem booking, cập nhật trạng thái booking
     - **Housekeeping (Nhân viên phục vụ):** cập nhật trạng thái phòng (clean, dirty, maintenance)
     - **Service Staff (Nhân viên dịch vụ):** quản lý đặt dịch vụ (spa, nhà hàng)
     - **Accountant (Kế toán):** xem báo cáo, quản lý hóa đơn
   - Chỉ có quyền trong phạm vi được gán
   - Không thể thay đổi cấu hình hoặc xóa dữ liệu

5. **Customer (Khách hàng):**
   - **Tách biệt hoàn toàn với tài khoản quản lý:**
     - Lưu trữ trong bảng `customers` riêng biệt (không phải bảng `users`)
     - Chỉ đăng nhập vào giao diện khách hàng (Frontend: website/app đặt phòng)
     - **KHÔNG THỂ** đăng nhập vào hệ thống quản lý (Admin Panel)
   - **Chức năng trên giao diện khách hàng:**
     - Đăng ký tài khoản (tự đăng ký)
     - Tìm kiếm, xem chi tiết homestay/hotel
     - Đặt phòng và thanh toán
     - Quản lý booking của mình
     - Đánh giá và nhận xét
     - Xem lịch sử đặt phòng
     - Quản lý thông tin cá nhân
   - **Không có quyền quản lý:**
     - Không thể truy cập hệ thống quản lý
     - Không thể quản lý homestay/hotel, phòng, giá cả
     - Không thể xem báo cáo hoặc quản lý nhân viên

**Nghiệp vụ quản lý người dùng:**

1. **Phân tách tài khoản:**
   - **Tài khoản quản lý (Users):** Lưu trong bảng `users`
     - Super Admin, Owner, Manager, Staff
     - Đăng nhập vào hệ thống quản lý (Admin Panel)
     - URL: `/admin` hoặc `/dashboard`
   - **Tài khoản khách hàng (Customers):** Lưu trong bảng `customers`
     - Customer/Guest
     - Đăng nhập vào giao diện khách hàng (Frontend)
     - URL: `/` hoặc `/booking`
     - Không thể truy cập Admin Panel

   **Lợi ích của việc tách bảng:**
   - **Bảo mật tốt hơn:** Tách biệt hoàn toàn dữ liệu quản lý và khách hàng
   - **Hiệu năng:** Tối ưu query, không cần join giữa users và customers
   - **Đơn giản hóa:** Mỗi bảng có cấu trúc phù hợp với vai trò
   - **Phân quyền rõ ràng:** Middleware/Guard dễ dàng kiểm tra và chặn Customer truy cập Admin Panel
   - **Mở rộng:** Dễ dàng thêm trường riêng cho Customer (ví dụ: loyalty points, preferences)
   - **Bảo mật API:** API Admin và API Customer có thể tách biệt hoàn toàn

   **Sơ đồ phân tách giao diện:**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │                    HỆ THỐNG                            │
   ├─────────────────────────────────────────────────────────┤
   │                                                         │
   │  ┌──────────────────┐      ┌──────────────────┐        │
   │  │  Admin Panel     │      │  Frontend        │        │
   │  │  (Backend)       │      │  (Customer UI)   │        │
   │  │                  │      │                  │        │
   │  │  URL: /admin     │      │  URL: /          │        │
   │  │  hoặc /dashboard │      │  hoặc /booking   │        │
   │  │                  │      │                  │        │
   │  │  ✅ Users        │      │  ✅ Customers    │        │
   │  │  (Super Admin,   │      │  ✅ Guests       │        │
   │  │   Owner,         │      │  (chưa đăng nhập)│        │
   │  │   Manager,       │      │                  │        │
   │  │   Staff)         │      │  ❌ Users        │        │
   │  │                  │      │  (không đặt phòng)│       │
   │  │  ❌ Customers    │      │                  │        │
   │  │  (bị chặn)       │      │                  │        │
   │  └──────────────────┘      └──────────────────┘        │
   │                                                         │
   │  ┌──────────────────┐      ┌──────────────────┐        │
   │  │  Bảng: users     │      │  Bảng: customers │        │
   │  │                  │      │                  │        │
   │  │  - id            │      │  - id            │        │
   │  │  - email         │      │  - email         │        │
   │  │  - password      │      │  - password      │        │
   │  │  - role          │      │  - full_name     │        │
   │  │  - ...           │      │  - phone         │        │
   │  │                  │      │  - ...           │        │
   │  └──────────────────┘      └──────────────────┘        │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
   ```

2. **Tạo tài khoản quản lý (Users):**
   - **Super Admin có thể:**
     - Tạo tài khoản Owner
     - Tạo tài khoản Manager
     - Tạo tài khoản Staff
     - Xóa hoặc vô hiệu hóa bất kỳ tài khoản quản lý nào
   - **Owner có thể:**
     - Tạo tài khoản Manager
     - Tạo tài khoản Staff
     - Gán quyền cho Manager và Staff
     - Gán Manager quản lý một hoặc nhiều homestay/hotel
     - Gán Staff làm việc cho một hoặc nhiều homestay/hotel
     - Xóa hoặc vô hiệu hóa Manager và Staff (không thể xóa chính mình)
   - **Manager có thể (nếu được Owner cấp quyền):**
     - Tạo tài khoản Staff
     - Gán quyền cho Staff
     - Gán Staff làm việc cho homestay/hotel được quản lý
     - Xóa hoặc vô hiệu hóa Staff (không thể xóa Owner hoặc Manager khác)
   - Tất cả tài khoản quản lý đều được tạo bởi người có quyền, không tự đăng ký
   - Tất cả tài khoản quản lý đăng nhập vào Admin Panel

3. **Quản lý tài khoản khách hàng (Customers):**
   - Customer tự đăng ký trên giao diện khách hàng
   - Super Admin, Owner có thể:
     - Xem danh sách khách hàng
     - Xem thông tin chi tiết khách hàng
     - Vô hiệu hóa tài khoản khách hàng (nếu vi phạm)
     - Không thể tạo tài khoản khách hàng (khách hàng tự đăng ký)
   - Customer không thể truy cập Admin Panel, dù có email/mật khẩu

4. **Phân quyền chi tiết:**
   - Hệ thống sử dụng Role-Based Access Control (RBAC) với kiến trúc module riêng biệt
   - **RBAC Module:** Quản lý roles và permissions như Domain Entities, tách biệt khỏi User module
   - **Chỉ áp dụng cho User (admin/staff):** Permissions không áp dụng cho Customer
   - **Role là Domain Entity:**
     - Role có CRUD operations (Create, Read, Update, Delete)
     - Role có field `is_super_admin` để đánh dấu role mặc định (super_admin role)
     - Role có relationship many-to-many với Permission (mỗi role có nhiều permissions)
     - Super Admin role không thể xóa
     - Các role khác có thể tạo mới và gán permissions
   - **Permission là Value Object (Catalog):**
     - Permissions được seed sẵn vào database
     - Không có CRUD cho Permission (chỉ là catalog)
     - Permission format: `module:action` (ví dụ: `user:manage`, `booking:read`)
   - **User có roles và permissions độc lập:**
     - User có thể có nhiều roles
     - User có thể có permissions trực tiếp (ngoài permissions từ roles)
     - Permissions từ roles được merge với permissions trực tiếp khi check quyền
   - **Super Admin:**
     - Role `super_admin` có `is_super_admin = true`
     - Tự động có full permissions, không cần gán permissions cụ thể
     - Không thể xóa role super_admin
   - **Wildcard permissions:**
     - `*:manage`: Full access to all modules
     - `module:*`: Full access to all actions in a module (ví dụ: `user:*`)
   - **Permissions được seed sẵn:**
     - User management: `user:create`, `user:read`, `user:update`, `user:delete`, `user:manage`
     - Customer management: `customer:create`, `customer:read`, `customer:update`, `customer:delete`, `customer:manage`
     - Homestay/Hotel: `homestay:*`
     - Room: `room:*`
     - Booking: `booking:*` (bao gồm `checkin`, `checkout`)
     - Payment: `payment:*`
     - Report: `report:*`
     - Role/Permission: `role:create`, `role:read`, `role:update`, `role:delete`, `role:assign`, `role:manage`, `permission:read`, `permission:assign`, `permission:manage`
     - System: `system:*`
   - **Gán quyền:**
     - Chỉ Super Admin mới có thể gán roles và permissions cho User
     - Chỉ Super Admin mới có thể tạo/sửa/xóa roles
     - User phải có ít nhất 1 role
     - Permissions có thể được gán trực tiếp cho User hoặc thông qua roles
     - Khi gán permissions cho role, tất cả users có role đó sẽ tự động có permissions (real-time)

5. **Bảo mật dữ liệu:**
   - Owner có thể truy cập tất cả dữ liệu của doanh nghiệp (tất cả homestay/hotel)
   - Manager chỉ có thể truy cập dữ liệu của homestay/hotel được gán
   - Staff chỉ có thể truy cập dữ liệu trong phạm vi quyền được gán
   - Super Admin có thể truy cập tất cả dữ liệu (tự động có full permissions)
   - Customer chỉ có thể truy cập dữ liệu của mình (booking, đánh giá của mình)
   - Hoạt động của tất cả người dùng được ghi log để theo dõi
   - **Phân tách giao diện:**
     - Admin Panel: Chỉ Users (Super Admin, Owner, Manager, Staff) mới truy cập được
     - Frontend: Customer và Guest (chưa đăng nhập) có thể truy cập
     - Middleware/Guard ngăn Customer truy cập Admin Panel
   - **Kiến trúc phân quyền:**
     - **RBAC Module:** Module riêng biệt quản lý roles và permissions như Domain Entities
     - **Guards:** `RolesGuard` và `PermissionsGuard` chỉ áp dụng cho User, không áp dụng cho Customer
     - **Permission check logic (Real-time từ database):**
       - `PermissionsGuard` load roles và permissions từ database khi check (real-time)
       - Merge permissions từ roles và permissions trực tiếp của user
       - Super Admin: Tự động bypass permission check (check `is_super_admin` flag)
       - Wildcard `*:manage`: Full access
       - Wildcard `module:*`: Full access to module
       - Permission cụ thể: Check exact match
       - Không cần đăng nhập lại khi gán permissions mới cho role (real-time check)
   - **Cách sử dụng trong Controller:**
     - Chỉ cần dùng `@Permissions('user:read')` decorator
     - Không cần hardcode `@Roles('super_admin', 'owner')` (quyền động từ database)
     - Guard tự động check permissions từ roles trong database

**Bảng phân quyền tóm tắt:**

| Quyền | Super Admin | Owner | Manager | Receptionist | Housekeeping | Service Staff | Accountant | Customer |
|-------|------------|-------|---------|--------------|--------------|---------------|------------|----------|
| Tạo homestay/hotel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý homestay/hotel | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chỉnh sửa thông tin | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý phòng | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ✅ (trạng thái) | ❌ | ❌ | ❌ |
| Quản lý giá cả | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý booking | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ✅ (xem, check-in/out) | ❌ | ❌ | ❌ | ✅ (của mình) |
| Quản lý nhân viên | ✅ Tất cả | ✅ Tất cả | ✅ (nếu được cấp quyền) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem báo cáo | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Quản lý thanh toán | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ❌ | ✅ | ✅ (của mình) |
| Quản lý dịch vụ | ✅ Tất cả | ✅ Tất cả | ✅ (được gán) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Quy tắc:**
- **Đăng ký tài khoản:**
  - **Customer:** Tự đăng ký trên giao diện khách hàng (Frontend)
  - **Users (Quản lý):** Tất cả được tạo bởi người có quyền, không tự đăng ký
    - Super Admin được tạo bởi Super Admin khác hoặc trong quá trình setup hệ thống
    - Owner được tạo bởi Super Admin
    - Manager được tạo bởi Super Admin hoặc Owner
    - Staff được tạo bởi Super Admin, Owner hoặc Manager (nếu được cấp quyền)
- **Phân tách giao diện và quyền truy cập:**
  - **Admin Panel (Hệ thống quản lý):**
    - Chỉ Users (Super Admin, Owner, Manager, Staff) mới có thể đăng nhập
    - URL: `/admin` hoặc `/dashboard`
    - Customer **KHÔNG THỂ** truy cập, dù có email/mật khẩu
    - Middleware/Guard kiểm tra role và chặn Customer
  - **Frontend (Giao diện khách hàng):**
    - Customer và Guest (chưa đăng nhập) có thể truy cập
    - URL: `/` hoặc `/booking`
    - Users có thể truy cập nhưng không có chức năng đặt phòng (chỉ xem)
- **Quản lý người dùng:**
  - Owner không thể bị xóa bởi Manager hoặc Staff
  - Manager và Staff chỉ có thể hoạt động trong phạm vi được gán
  - Manager có thể được gán quản lý một hoặc nhiều homestay/hotel
  - Staff có thể được gán làm việc cho một hoặc nhiều homestay/hotel
  - Customer và User là 2 bảng riêng biệt, không thể chuyển đổi vai trò
- **Bảo mật:**
  - Hoạt động của tất cả người dùng được ghi log để theo dõi
  - Quyền có thể được cấu hình chi tiết hơn tùy theo nhu cầu thông qua RBAC module
  - Khi tạo tài khoản quản lý, hệ thống gửi email với thông tin đăng nhập (email và mật khẩu tạm thời)
  - Người dùng quản lý phải đổi mật khẩu lần đầu khi đăng nhập
  - Customer và User có thể có cùng email nhưng là 2 tài khoản riêng biệt
  - **RBAC Module:**
    - Quản lý roles như Domain Entities với CRUD operations
    - Quản lý permissions như Value Objects (catalog được seed sẵn)
    - Role có relationship many-to-many với Permission
    - Role có field `is_super_admin` để đánh dấu role mặc định
    - Cung cấp ports để User module gán roles/permissions
    - Guards và decorators nằm trong `common/guards` và `common/decorators`
    - Permissions được seed sẵn và không có CRUD
    - Super Admin role (`is_super_admin = true`) tự động có full permissions, không thể xóa
    - Permissions được check real-time từ database (không cần đăng nhập lại)

### 2.1.2. Quên mật khẩu (Password Reset)

**Phạm vi:**
- Áp dụng cho cả tài khoản quản lý (Users: Super Admin, Owner, Manager, Staff) và khách hàng (Customers).
- Endpoint phân tách theo loại tài khoản (`/v1/auth/user/...` vs `/v1/auth/customers/...`) nhưng logic giống nhau.

**Luồng nghiệp vụ chi tiết:**
1. Người dùng gửi email tới endpoint `password/forgot`.
2. Hệ thống luôn trả `202 Accepted`. Nếu email hợp lệ và tài khoản đang hoạt động:
   - Sinh OTP 6 chữ số và token dài (48 bytes → hex) → chỉ xuất hiện dạng plaintext trong email, lưu ở DB dạng SHA-256 hash.
   - Tạo bản ghi `password_reset_requests` với trạng thái `pending`, `attempt_count = 0`, `max_attempts = 5`, metadata (`requested_ip`, `requested_user_agent`).
   - OTP hết hạn sau **10 phút**, token hết hạn sau **60 phút** (có thể override qua config `auth.passwordReset.*`).
   - Gửi email chứa **OTP** và **link reset** (`?requestId=...&token=...&type=...`).
   - Nếu cùng tài khoản đã có request ở trạng thái `pending/otp_verified`, request cũ bị `revoked`.
3. Người dùng nhập OTP → hệ thống:
   - Tra bản ghi theo `requestId`.
   - So khớp hash OTP, kiểm tra chưa hết hạn và chưa vượt quá 5 lần thử.
   - Nếu trùng khớp: chuyển trạng thái `otp_verified`, lưu `verified_at`.
   - Nếu sai: tăng `attempt_count`, ghi `last_attempt_at`. Đủ 5 lần → `revoked`.
4. Người dùng click link và gửi `requestId + token + newPassword`:
   - Token hash phải khớp và request phải ở trạng thái `otp_verified`.
   - Hash mật khẩu mới bằng `PASSWORD_HASHER`, gọi tới module User/Customer để cập nhật.
   - Đánh dấu request `completed`, lưu `completed_at`, revoke tất cả refresh session của tài khoản để buộc đăng nhập lại.

**Quy tắc bảo mật & audit:**
- Không bao giờ trả OTP/token plaintext qua API (chỉ email).
- Thông báo lỗi luôn dùng thông điệp chung “Invalid or expired …” để tránh suy đoán.
- Chỉ tối đa 1 request active cho mỗi tài khoản; request mới tự động revoke request cũ.
- Ghi log đầy đủ IP, user-agent, thời gian tạo/attempt để hỗ trợ điều tra.
- Sau khi reset thành công bắt buộc đăng nhập lại do toàn bộ session bị revoke.

### 2.2. Quản lý thông tin Homestay

**Nghiệp vụ:**
- Owner (được Super Admin tạo) tạo mới homestay với thông tin:
  - Tên homestay
  - Loại hình lưu trú: Homestay
  - Địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)
  - Tọa độ GPS (latitude, longitude) để hiển thị trên bản đồ
  - Mô tả chi tiết (HTML/text)
  - Danh sách tiện ích (wifi, điều hòa, bếp, bãi đỗ xe, hồ bơi, v.v.)
  - Chính sách (check-in/check-out, hủy phòng, v.v.)
  - Hình ảnh (tối thiểu 3 ảnh, tối đa 20 ảnh)
- Chỉnh sửa thông tin homestay đã tạo
- Tạm ngưng/hoạt động lại homestay
- Xóa homestay (chỉ khi không có booking đang diễn ra hoặc sắp diễn ra)

**Quy tắc:**
- Owner có thể quản lý nhiều homestay
- Manager có thể tạo homestay nếu được Owner cấp quyền
- Homestay sẽ hoạt động ngay sau khi tạo (status = active)
- Khi tạm ngưng, homestay không hiển thị trong kết quả tìm kiếm nhưng vẫn hiển thị booking đã đặt
- Không thể xóa homestay nếu có bất kỳ booking nào ở trạng thái `pending_payment` hoặc `confirmed` trong tương lai. Phải hủy hoặc đợi booking hoàn thành mới được xóa.

### 2.2.1. Quản lý thông tin Hotel (Khách sạn)

**Nghiệp vụ:**
- Owner (được Super Admin tạo) tạo mới hotel với thông tin:
  - Tên khách sạn
  - Loại hình lưu trú: Hotel
  - Hạng sao (1-5 sao)
  - Địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)
  - Tọa độ GPS (latitude, longitude) để hiển thị trên bản đồ
  - Mô tả chi tiết (HTML/text)
  - Số tầng, số phòng tổng cộng
  - Năm xây dựng, năm cải tạo gần nhất
  - Danh sách tiện ích chung:
    - Tiện ích cơ bản: wifi, điều hòa, bãi đỗ xe, thang máy
    - Dịch vụ: nhà hàng, bar, spa, gym, hồ bơi, hội trường, business center
    - Dịch vụ bổ sung: dịch vụ giặt ủi, dịch vụ phòng 24/7, concierge, shuttle bus
  - Chính sách (check-in/check-out, hủy phòng, trẻ em, thú cưng, v.v.)
  - Hình ảnh (tối thiểu 5 ảnh, tối đa 50 ảnh):
    - Ảnh ngoại thất
    - Ảnh sảnh, khu vực chung
    - Ảnh phòng
    - Ảnh dịch vụ (nhà hàng, spa, gym, v.v.)
  - Thông tin liên hệ: số điện thoại, email, website
  - Giờ check-in/check-out mặc định
- Chỉnh sửa thông tin hotel đã tạo
- Tạm ngưng/hoạt động lại hotel (có thể tạm ngưng từng tầng)
- Xóa hotel (chỉ khi không có booking đang diễn ra hoặc sắp diễn ra)

**Quy tắc:**
- Owner có thể quản lý nhiều hotel
- Manager có thể tạo hotel nếu được Owner cấp quyền
- Hotel sẽ hoạt động ngay sau khi tạo (status = active)
- Hạng sao phải được xác nhận bởi cơ quan có thẩm quyền (Super Admin có thể xác nhận)
- Khi tạm ngưng, hotel không hiển thị trong kết quả tìm kiếm nhưng vẫn hiển thị booking đã đặt
- Không thể xóa hotel nếu có bất kỳ booking nào ở trạng thái `pending_payment` hoặc `confirmed` trong tương lai.
- Hotel phải có ít nhất 10 phòng

### 2.2.2. Quản lý tầng (Floors) - Chỉ áp dụng cho Hotel

**Nghiệp vụ:**
- Tạo và quản lý các tầng trong hotel:
  - Số tầng, tên tầng (ví dụ: Tầng 1, Tầng VIP, Tầng hồ bơi)
  - **Loại tầng (Floor Type):**
    - `room_floor`: Tầng phòng (chứa phòng nghỉ)
    - `restaurant_floor`: Tầng nhà hàng
    - `spa_floor`: Tầng spa/wellness
    - `gym_floor`: Tầng gym/fitness
    - `pool_floor`: Tầng hồ bơi
    - `meeting_floor`: Tầng hội trường/phòng họp
    - `business_floor`: Tầng business center
    - `mixed_floor`: Tầng hỗn hợp (có cả phòng và dịch vụ)
    - `lobby_floor`: Tầng sảnh
  - Mô tả tầng (tùy chọn)
  - Tiện ích của tầng (tùy chọn)
  - Trạng thái (active, maintenance, closed)
- Gán phòng vào tầng cụ thể (thông qua room_number hoặc gán trực tiếp)
- Gán dịch vụ vào tầng cụ thể (nhà hàng, spa, gym, etc.)
- Quản lý trạng thái tầng (có thể block để bảo trì)

**Quy tắc:**
- Mỗi phòng phải thuộc một tầng loại `room_floor` hoặc `mixed_floor`
- Mỗi dịch vụ (nhà hàng, spa, gym, etc.) có thể thuộc một tầng cụ thể
- Khi block tầng, tất cả phòng và dịch vụ trong tầng đó không thể sử dụng
- Tầng được quản lý như một phần của hotel, không phải aggregate riêng
- Có thể bỏ qua quản lý tầng nếu hotel nhỏ hoặc không cần thiết

### 2.3. Quản lý phòng (Rooms)

**Nghiệp vụ cho Homestay:**
- Tạo mới phòng với thông tin:
  - Tên phòng
  - Loại phòng (phòng đơn, phòng đôi, phòng gia đình, dormitory, v.v.)
  - Diện tích (m²)
  - Số lượng giường và loại giường
  - Số lượng khách tối đa
  - Mô tả chi tiết
  - Hình ảnh phòng (tối thiểu 2 ảnh, tối đa 10 ảnh)
  - Tiện ích trong phòng (TV, tủ lạnh, ban công, v.v.)
- Chỉnh sửa thông tin phòng
- Xóa phòng (chỉ khi không có booking nào trong tương lai)
- Quản lý số lượng phòng (inventory): số phòng có sẵn của mỗi loại

**Nghiệp vụ cho Hotel:**
- Tạo mới loại phòng (Room Type) với thông tin:
  - Tên loại phòng (ví dụ: Deluxe Double, Suite, Presidential Suite)
  - Loại phòng (phòng đơn, phòng đôi, phòng gia đình, suite, penthouse, v.v.)
  - Diện tích (m²)
  - Số lượng giường và loại giường (giường đơn, giường đôi, giường king, sofa bed, v.v.)
  - Số lượng khách tối đa (người lớn, trẻ em)
  - Hướng phòng (hướng biển, hướng núi, hướng thành phố, v.v.)
  - Mô tả chi tiết
  - Hình ảnh phòng (tối thiểu 3 ảnh, tối đa 20 ảnh):
    - Ảnh tổng quan
    - Ảnh giường
    - Ảnh phòng tắm
    - Ảnh view từ phòng
  - Tiện ích trong phòng:
    - Cơ bản: TV, tủ lạnh, minibar, két sắt, điều hòa
    - Phòng tắm: bồn tắm, vòi sen, đồ vệ sinh cá nhân
    - Khác: ban công, cửa sổ lớn, bàn làm việc, sofa
  - Số lượng phòng của loại này (inventory)
  - Tầng (nếu áp dụng, optional)
- Quản lý từng phòng cụ thể (Room Management):
  - Số phòng (room number): ví dụ 101, 205, Suite 301
  - Gán vào loại phòng (room type)
  - Gán vào tầng (optional)
  - Trạng thái phòng: available, occupied, maintenance, out of order
  - Ghi chú đặc biệt cho từng phòng
- Chỉnh sửa thông tin loại phòng
- Xóa loại phòng (chỉ khi không có booking nào trong tương lai và không có phòng nào đang sử dụng)
- Block/unblock phòng cụ thể để bảo trì

**Quy tắc:**
- Mỗi homestay/hotel có thể có nhiều loại phòng khác nhau
- Số lượng khách tối đa phải >= 1
- Không thể xóa phòng đang có booking chưa hoàn thành
- Đối với hotel: mỗi loại phòng có thể có nhiều phòng cụ thể (ví dụ: 20 phòng Deluxe Double)
- Đối với hotel: khi đặt phòng, hệ thống sẽ tự động gán phòng cụ thể từ loại phòng đã chọn (hoặc cho phép chọn phòng cụ thể nếu có)

### 2.4. Quản lý giá cả (Pricing)

**Nghiệp vụ:**
- Thiết lập giá cơ bản cho từng loại phòng (giá/đêm)
- Thiết lập giá theo mùa (high season, low season)
- Thiết lập giá theo ngày trong tuần (cuối tuần có thể cao hơn)
- Thiết lập giá theo số lượng khách (phụ thu thêm khách)
- Thiết lập giá khuyến mãi (promotion) với thời gian áp dụng
- Xem lịch sử thay đổi giá

**Quy tắc:**
- Giá phải > 0
- Giá khuyến mãi phải < giá gốc
- Không thể thay đổi giá cho các ngày đã có booking
- Giá theo mùa có thể override giá cơ bản
- Giá theo ngày trong tuần có thể override giá theo mùa
- Giá khuyến mãi có độ ưu tiên cao nhất

**Công thức tính giá:**
```
Giá cuối cùng = (PromotionPrice ?? WeeklyPrice ?? SeasonalPrice ?? BasePrice) + ExtraGuestCharge

*Logic ưu tiên (Priority Chain):*
1. **Promotion Price**: Nếu có khuyến mãi áp dụng, dùng giá khuyến mãi.
2. **Weekly Price**: Nếu không có khuyến mãi, kiểm tra giá ngày trong tuần (cuối tuần/ngày thường).
3. **Seasonal Price**: Nếu không có giá tuần, kiểm tra giá theo mùa.
4. **Base Price**: Nếu không có các giá trên, dùng giá cơ bản.
```

### 2.5. Quản lý lịch đặt phòng (Calendar)

**Nghiệp vụ:**
- Xem lịch đặt phòng theo tháng/năm
- Xem trạng thái phòng: available, booked, blocked
- Block phòng (tạm thời không cho đặt) cho các ngày cụ thể
- Unblock phòng
- Xem chi tiết booking cho từng ngày
- Đối với hotel: xem lịch theo tầng hoặc loại phòng

**Quy tắc:**
- Phòng đã được đặt không thể block
- Có thể block phòng trước để bảo trì hoặc sửa chữa
- Đối với hotel: có thể block cả tầng

### 2.6. Quản lý dịch vụ khách sạn (Hotel Services) - Chỉ áp dụng cho Hotel

**Nghiệp vụ:**
- Quản lý các dịch vụ của hotel:
  - **Nhà hàng:**
    - Tên nhà hàng, loại ẩm thực
    - Tầng (floor_id) - tầng nào chứa nhà hàng
    - Giờ mở cửa (opening_hours)
    - Sức chứa (capacity)
    - Menu và giá từng món
    - Hình ảnh
    - **Booking riêng:** Khách có thể đặt bàn trước (reservation)
    - **Quản lý bàn:** Số lượng bàn, loại bàn (2 người, 4 người, VIP, etc.)
    - **Lịch đặt bàn:** Xem lịch đặt bàn theo ngày/giờ
  - **Spa & Wellness:**
    - Tên spa, loại dịch vụ
    - Tầng (floor_id)
    - Danh sách dịch vụ spa (massage, facial, body treatment, etc.)
    - Giá từng dịch vụ
    - Thời gian mỗi dịch vụ (duration)
    - Số phòng/spa room
    - Hình ảnh
    - **Booking riêng:** Khách có thể đặt lịch spa trước
    - **Lịch đặt lịch:** Xem lịch trống theo ngày/giờ/phòng
    - **Nhân viên spa:** Gán nhân viên cho từng booking
  - **Gym/Fitness Center:**
    - Tên phòng gym
    - Tầng (floor_id)
    - Thiết bị có sẵn (danh sách)
    - Giờ mở cửa (opening_hours)
    - Sức chứa tối đa (max_capacity)
    - Quy định sử dụng
    - Hình ảnh
    - **Booking riêng:** Khách có thể đặt slot thời gian (nếu có giới hạn)
    - **Miễn phí hoặc tính phí:** Có thể miễn phí cho khách lưu trú hoặc tính phí
  - **Hồ bơi:**
    - Tên hồ bơi
    - Tầng (floor_id) - thường là tầng trên cùng hoặc tầng riêng
    - Kích thước, độ sâu
    - Giờ mở cửa (opening_hours)
    - Sức chứa tối đa (max_capacity)
    - Quy định sử dụng
    - Hình ảnh
    - **Booking riêng:** Khách có thể đặt slot thời gian (nếu có giới hạn)
    - **Miễn phí hoặc tính phí:** Thường miễn phí cho khách lưu trú
  - **Hội trường/Phòng họp:**
    - Tên phòng họp/hội trường
    - Tầng (floor_id)
    - Sức chứa (capacity)
    - Thiết bị có sẵn (projector, sound system, whiteboard, wifi, etc.)
    - Giá thuê theo giờ/ngày
    - Hình ảnh
    - **Booking riêng:** Khách có thể đặt phòng họp trước (không cần đặt phòng nghỉ)
    - **Lịch đặt phòng:** Xem lịch trống theo ngày/giờ
    - **Dịch vụ kèm:** Có thể đặt thêm dịch vụ (catering, coffee break, etc.)
  - **Business Center:**
    - Tên business center
    - Tầng (floor_id)
    - Dịch vụ có sẵn (máy in, fax, photocopy, máy tính, internet, etc.)
    - Giá từng dịch vụ
    - Giờ mở cửa
    - **Booking riêng:** Khách có thể đặt sử dụng dịch vụ trước
  - **Dịch vụ khác:**
    - **Dịch vụ giặt ủi:** Đặt dịch vụ giặt ủi (thường không cần booking riêng, chỉ cần yêu cầu)
    - **Dịch vụ phòng 24/7:** Room service (không cần booking riêng)
    - **Concierge:** Dịch vụ hỗ trợ khách (không cần booking riêng)
    - **Shuttle bus:** Đặt xe đưa đón sân bay (có thể cần booking riêng)
    - **Valet parking:** Dịch vụ đỗ xe (có thể cần booking riêng)

- Tạo gói dịch vụ (Service Packages):
  - Tên gói
  - Bao gồm các dịch vụ gì
  - Giá gói
  - Thời gian áp dụng

- **Quản lý đặt dịch vụ (Service Booking):**
  - **Đặt kèm khi đặt phòng:**
    - Khách có thể chọn dịch vụ khi đặt phòng (bữa sáng, spa, etc.)
    - Tính phí dịch vụ vào tổng tiền booking
  - **Đặt riêng sau (Standalone Booking):**
    - Khách có thể đặt dịch vụ mà không cần đặt phòng nghỉ
    - Ví dụ: Đặt bàn nhà hàng, đặt spa, đặt phòng họp
    - Yêu cầu thông tin: tên, email, số điện thoại
    - Thanh toán riêng cho dịch vụ
    - Nhận mã booking riêng cho dịch vụ
  - **Đặt trong thời gian lưu trú:**
    - Khách đang ở hotel có thể đặt thêm dịch vụ
    - Tính phí vào hóa đơn khi check-out hoặc thanh toán ngay

- **Quản lý lịch đặt dịch vụ:**
  - Xem lịch đặt của từng dịch vụ theo ngày/giờ
  - Quản lý capacity (sức chứa) cho từng slot thời gian
  - Xác nhận/hủy đặt dịch vụ
  - Gửi thông báo nhắc nhở

**Quy tắc:**
- Một số dịch vụ có thể miễn phí cho khách lưu trú (ví dụ: wifi, gym, hồ bơi)
- Một số dịch vụ tính phí riêng (ví dụ: spa, nhà hàng, phòng họp)
- Dịch vụ có thể được đặt kèm khi đặt phòng, đặt riêng (standalone), hoặc đặt trong thời gian lưu trú
- Dịch vụ có lịch (spa, nhà hàng, phòng họp) phải đặt trước ít nhất 2 giờ
- Có thể hủy đặt dịch vụ trước 1 giờ (hoặc theo chính sách của hotel)
- Phí dịch vụ được tính vào hóa đơn khi check-out (nếu đặt trong thời gian lưu trú) hoặc thanh toán riêng (nếu đặt standalone)
- Mỗi dịch vụ có thể thuộc một tầng cụ thể (floor_id)

## 3. Booking đặt phòng

### 3.1. Tìm kiếm và lọc homestay/hotel

**Nghiệp vụ:**
- Khách hàng tìm kiếm homestay/hotel theo:
  - Loại hình lưu trú: Homestay, Hotel, hoặc Tất cả
  - Địa điểm (tỉnh/thành phố, quận/huyện)
  - Ngày check-in, check-out
  - Số lượng khách
  - Số lượng phòng
  - Khoảng giá
  - Tiện ích (wifi, điều hòa, bếp, hồ bơi, spa, gym, v.v.)
  - Đánh giá (sao)
  - Đối với hotel: hạng sao (1-5 sao)
  - Đối với hotel: có dịch vụ cụ thể (nhà hàng, spa, hội trường, v.v.)
- Sắp xếp kết quả theo: giá tăng dần, giá giảm dần, đánh giá cao nhất, mới nhất, hạng sao (đối với hotel)
- Xem bản đồ để tìm homestay/hotel theo vị trí
- Lọc nâng cao:
  - Khoảng cách từ điểm đến (ví dụ: gần sân bay, gần trung tâm)
  - Đánh giá tối thiểu
  - Có bữa sáng miễn phí
  - Có thể hủy miễn phí

**Quy tắc:**
- Chỉ hiển thị homestay/hotel đang hoạt động
- Chỉ hiển thị phòng còn trống trong khoảng thời gian tìm kiếm
- Ngày check-out phải sau ngày check-in ít nhất 1 ngày
- Kết quả tìm kiếm có thể hiển thị cả homestay và hotel, hoặc lọc theo loại

### 3.2. Xem chi tiết homestay/hotel và phòng

**Nghiệp vụ cho Homestay:**
- Xem thông tin chi tiết homestay:
  - Thông tin cơ bản, địa chỉ, bản đồ
  - Hình ảnh gallery
  - Danh sách phòng và giá
  - Tiện ích
  - Chính sách
  - Đánh giá và nhận xét từ khách hàng
- Xem chi tiết từng loại phòng:
  - Thông tin, hình ảnh
  - Giá theo ngày
  - Tiện ích trong phòng
- Kiểm tra tính khả dụng (availability) theo ngày

**Nghiệp vụ cho Hotel:**
- Xem thông tin chi tiết hotel:
  - Thông tin cơ bản, hạng sao, địa chỉ, bản đồ
  - Hình ảnh gallery (ngoại thất, sảnh, phòng, dịch vụ)
  - Danh sách loại phòng và giá
  - Tiện ích chung của hotel
  - Danh sách dịch vụ (nhà hàng, spa, gym, hồ bơi, v.v.)
  - Chính sách (check-in/check-out, hủy phòng, trẻ em, thú cưng)
  - Đánh giá và nhận xét từ khách hàng
  - Thông tin tầng (nếu có)
- Xem chi tiết từng loại phòng:
  - Thông tin, hình ảnh (tổng quan, giường, phòng tắm, view)
  - Giá theo ngày
  - Tiện ích trong phòng
  - Số phòng còn trống của loại này
  - Đối với hotel: có thể xem danh sách phòng cụ thể và chọn phòng (nếu cho phép)
- Kiểm tra tính khả dụng (availability) theo ngày
- Xem thông tin dịch vụ:
  - Chi tiết từng dịch vụ (nhà hàng, spa, gym, v.v.)
  - Giá dịch vụ
  - Tầng chứa dịch vụ
  - Lịch trống (availability) cho dịch vụ có booking
  - Có thể đặt dịch vụ kèm khi đặt phòng hoặc đặt riêng (standalone)

**Quy tắc:**
- Hiển thị giá real-time dựa trên ngày check-in/check-out đã chọn
- Hiển thị số phòng còn trống
- Đối với hotel: có thể hiển thị số phòng cụ thể còn trống của từng loại

### 3.3. Đặt phòng (Booking)

**Nghiệp vụ:**
- Khách hàng chọn:
  - Homestay/Hotel
  - Loại phòng
  - Ngày check-in, check-out
  - Số lượng phòng
  - Số lượng khách (người lớn, trẻ em)
  - Thông tin liên hệ: họ tên, email, số điện thoại
  - Yêu cầu đặc biệt (nếu có)
  - Đối với hotel: có thể chọn phòng cụ thể (nếu cho phép)
  - Đối với hotel: có thể đặt dịch vụ kèm (bữa sáng, spa, v.v.)
- Xem tổng tiền:
  - Giá phòng (theo số đêm)
  - Phụ thu thêm khách (nếu có)
  - Phí dịch vụ (service fee) - % của tổng tiền phòng
  - Thuế VAT (nếu có)
  - Giảm giá (nếu có mã khuyến mãi)
  - Đối với hotel: phí dịch vụ đã chọn (bữa sáng, spa, v.v.)
  - Tổng cộng
- Xác nhận đặt phòng

**Quy tắc:**
- Phải đăng nhập hoặc cung cấp thông tin liên hệ để đặt phòng
- Số lượng khách không được vượt quá số khách tối đa của phòng
- Phải có đủ phòng trống trong khoảng thời gian đã chọn
- Giá được tính và giữ cố định tại thời điểm đặt phòng
- Booking có thời gian giữ chỗ (hold time): 15 phút để thanh toán, sau đó tự động hủy nếu chưa thanh toán
- Đối với hotel: nếu chọn phòng cụ thể, phòng đó phải available trong khoảng thời gian đã chọn

**Trạng thái booking:**
- `pending_payment`: Đã đặt, chờ thanh toán (trong thời gian hold)
- `confirmed`: Đã thanh toán, xác nhận đặt phòng
- `cancelled`: Đã hủy
- `completed`: Đã hoàn thành (đã check-out)
- `no_show`: Khách không đến

### 3.4. Đặt dịch vụ riêng (Standalone Service Booking)

**Nghiệp vụ:**
- Khách hàng có thể đặt dịch vụ mà không cần đặt phòng nghỉ:
  - **Đặt bàn nhà hàng:**
    - Chọn hotel và nhà hàng
    - Chọn ngày, giờ
    - Chọn số lượng người
    - Chọn loại bàn (2 người, 4 người, VIP, etc.)
    - Thông tin liên hệ: tên, email, số điện thoại
    - Yêu cầu đặc biệt (nếu có)
    - Xem menu và giá (nếu có)
  - **Đặt spa:**
    - Chọn hotel và spa
    - Chọn dịch vụ spa (massage, facial, body treatment, etc.)
    - Chọn ngày, giờ
    - Chọn phòng spa (nếu có nhiều phòng)
    - Chọn nhân viên (nếu cho phép)
    - Thông tin liên hệ
    - Xem giá dịch vụ
  - **Đặt phòng họp/hội trường:**
    - Chọn hotel và phòng họp
    - Chọn ngày, giờ bắt đầu, giờ kết thúc
    - Chọn số lượng người
    - Chọn dịch vụ kèm (catering, coffee break, equipment, etc.)
    - Thông tin liên hệ
    - Xem giá thuê phòng và dịch vụ
  - **Đặt gym/hồ bơi:**
    - Chọn hotel và dịch vụ
    - Chọn ngày, slot thời gian (nếu có giới hạn)
    - Thông tin liên hệ
    - Xem giá (nếu tính phí) hoặc miễn phí
  - **Đặt business center:**
    - Chọn hotel và dịch vụ cần sử dụng
    - Chọn ngày, giờ
    - Thông tin liên hệ
    - Xem giá dịch vụ

- Xem tổng tiền và xác nhận đặt dịch vụ
- Thanh toán ngay hoặc thanh toán tại cơ sở (tùy chính sách)
- Nhận mã booking riêng cho dịch vụ

**Quy tắc:**
- Không cần đăng nhập để đặt dịch vụ (nhưng đăng nhập sẽ có lợi ích)
- Phải cung cấp thông tin liên hệ (tên, email, số điện thoại)
- Dịch vụ có lịch phải đặt trước ít nhất 2 giờ
- Phải có slot trống trong thời gian đã chọn
- Giá được tính và giữ cố định tại thời điểm đặt
- Booking dịch vụ có thời gian giữ chỗ (hold time): 15 phút để thanh toán
- Có thể hủy đặt dịch vụ trước 1 giờ (hoặc theo chính sách)

**Trạng thái booking dịch vụ:**
- `pending_payment`: Đã đặt, chờ thanh toán
- `confirmed`: Đã thanh toán, xác nhận đặt dịch vụ
- `cancelled`: Đã hủy
- `completed`: Đã hoàn thành
- `no_show`: Khách không đến

### 3.5. Quản lý booking của khách hàng

**Nghiệp vụ:**
- **Quản lý booking phòng:**
  - Xem danh sách booking phòng của mình
  - Xem chi tiết booking:
    - Thông tin homestay, phòng
    - Ngày check-in/check-out
    - Số lượng khách, phòng
    - Tổng tiền, trạng thái thanh toán
    - Mã booking (booking code)
  - Hủy booking (theo chính sách hủy)
  - In/tải voucher booking
  - Liên hệ Owner/Manager qua hệ thống

- **Quản lý booking dịch vụ:**
  - Xem danh sách booking dịch vụ của mình (bao gồm cả standalone và đặt kèm)
  - Xem chi tiết booking dịch vụ:
    - Thông tin hotel và dịch vụ
    - Loại dịch vụ (nhà hàng, spa, phòng họp, etc.)
    - Ngày, giờ đặt
    - Số lượng người/slot
    - Tổng tiền, trạng thái thanh toán
    - Mã booking dịch vụ
    - Yêu cầu đặc biệt
  - Hủy booking dịch vụ (trước 1 giờ hoặc theo chính sách)
  - In/tải voucher booking dịch vụ
  - Liên hệ hotel qua hệ thống

**Quy tắc:**
- **Booking phòng:**
  - Chỉ có thể hủy booking theo chính sách hủy của homestay/hotel
  - Nếu hủy trong thời gian cho phép, tiền sẽ được hoàn lại (theo chính sách)
  - Booking đã completed không thể hủy
- **Booking dịch vụ:**
  - Có thể hủy booking dịch vụ trước 1 giờ (hoặc theo chính sách của hotel)
  - Nếu hủy trong thời gian cho phép, tiền sẽ được hoàn lại
  - Booking đã completed không thể hủy

### 3.6. Quản lý booking của Owner/Manager

**Nghiệp vụ:**
- **Quản lý booking phòng:**
  - Xem danh sách booking của homestay/hotel:
    - Lọc theo trạng thái, ngày check-in, loại phòng
    - Tìm kiếm theo tên khách, mã booking
    - Đối với hotel: lọc theo tầng
  - Xem chi tiết booking:
    - Thông tin khách hàng
    - Thông tin phòng đã đặt
    - Đối với hotel: số phòng cụ thể (nếu đã gán)
    - Đối với hotel: dịch vụ đã đặt kèm
    - Tổng tiền, trạng thái thanh toán
  - Xác nhận check-in (đánh dấu khách đã đến):
    - Đối với hotel: gán phòng cụ thể cho khách (nếu chưa gán)
    - Đối với hotel: cấp thẻ phòng, hướng dẫn đến phòng
  - Xác nhận check-out (đánh dấu khách đã rời):
    - Đối với hotel: kiểm tra phòng, tính phí phát sinh (nếu có)
    - Đối với hotel: thu thẻ phòng
  - Đánh dấu no-show (khách không đến)
  - Gửi thông báo cho khách hàng
  - Đối với hotel: quản lý dịch vụ phát sinh:
    - Thêm dịch vụ trong thời gian lưu trú (minibar, dịch vụ phòng, v.v.)
    - Tính phí vào hóa đơn

- **Quản lý booking dịch vụ (Service Booking):**
  - Xem danh sách booking dịch vụ:
    - Lọc theo loại dịch vụ (nhà hàng, spa, phòng họp, etc.)
    - Lọc theo trạng thái, ngày, giờ
    - Tìm kiếm theo tên khách, mã booking
    - Lọc theo tầng (nếu dịch vụ thuộc tầng)
  - Xem chi tiết booking dịch vụ:
    - Thông tin khách hàng
    - Loại dịch vụ và chi tiết (bàn, phòng spa, phòng họp, etc.)
    - Ngày, giờ đặt
    - Số lượng người/slot
    - Tổng tiền, trạng thái thanh toán
    - Yêu cầu đặc biệt
  - Xác nhận/hủy booking dịch vụ:
    - Xác nhận khi khách đến
    - Hủy nếu khách không đến hoặc yêu cầu hủy
    - Đánh dấu no-show
  - Quản lý lịch đặt dịch vụ:
    - Xem lịch đặt của từng dịch vụ theo ngày/giờ
    - Xem capacity (sức chứa) còn lại
    - Block slot thời gian (bảo trì, sự kiện đặc biệt)
  - Gửi thông báo nhắc nhở cho khách (1 giờ trước)
  - Đối với spa: gán nhân viên cho booking
  - Đối với nhà hàng: gán bàn cụ thể cho booking

**Quy tắc:**
- Chỉ có thể check-in sau ngày check-in
- Check-out phải sau check-in
- No-show chỉ có thể đánh dấu sau ngày check-in
- Đối với hotel: phải gán phòng cụ thể khi check-in (nếu chưa gán khi đặt)
- Đối với hotel: phòng được gán phải available và thuộc loại phòng đã đặt

## 4. Thanh toán online

### 4.1. Phương thức thanh toán

**Các phương thức hỗ trợ:**
- Thanh toán qua thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
- Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay)
- Chuyển khoản ngân hàng (Bank transfer)
- Thanh toán tại cơ sở (Pay at property) - chỉ áp dụng cho một số homestay/hotel
- Đối với hotel: có thể thanh toán một phần trước, phần còn lại khi check-in/check-out

**Quy tắc:**
- Thanh toán online là phương thức mặc định và được khuyến khích
- Thanh toán tại cơ sở chỉ áp dụng khi Owner/Manager cho phép và khách đặt trước ít nhất 24h
- Mỗi booking chỉ thanh toán 1 lần (hoặc chia làm nhiều lần nếu hotel cho phép)
- Đối với hotel: có thể yêu cầu đặt cọc (deposit) khi đặt phòng, thanh toán phần còn lại khi check-in

### 4.2. Quy trình thanh toán

**Nghiệp vụ:**
1. Sau khi đặt phòng, khách hàng được chuyển đến trang thanh toán
2. Chọn phương thức thanh toán
3. Nhập thông tin thanh toán (tùy phương thức):
   - Thẻ: số thẻ, tên chủ thẻ, ngày hết hạn, CVV
   - Ví điện tử: quét QR hoặc chuyển hướng đến app
   - Chuyển khoản: hiển thị thông tin tài khoản
4. Xác nhận thanh toán
5. Xử lý thanh toán:
   - Gọi API của cổng thanh toán
   - Nhận kết quả (thành công/thất bại)
   - Cập nhật trạng thái booking
   - Gửi email xác nhận cho khách hàng và Owner/Manager

**Quy tắc:**
- Thời gian giữ chỗ (hold time) là 15 phút
- Nếu thanh toán thành công trong thời gian hold, booking được xác nhận
- Nếu hết thời gian hold mà chưa thanh toán, booking tự động hủy
- Thanh toán thất bại: cho phép thử lại (tối đa 3 lần)

### 4.3. Xử lý giao dịch thanh toán

**Nghiệp vụ:**
- Lưu trữ thông tin giao dịch:
  - Mã giao dịch (transaction ID)
  - Phương thức thanh toán
  - Số tiền
  - Trạng thái (pending, success, failed, refunded)
  - Thời gian giao dịch
  - Thông tin từ cổng thanh toán (response)
- Xử lý webhook từ cổng thanh toán để cập nhật trạng thái
- Xử lý hoàn tiền (refund) khi hủy booking

**Quy tắc:**
- Mỗi booking có thể có nhiều giao dịch (nếu thanh toán thất bại và thử lại)
- Chỉ giao dịch thành công mới xác nhận booking
- Hoàn tiền phải tuân theo chính sách hủy của homestay
- Thời gian hoàn tiền: 3-7 ngày làm việc (tùy phương thức)

### 4.4. Chia sẻ doanh thu (Revenue Sharing)

**Nghiệp vụ:**
- Hệ thống tính phí dịch vụ (commission) từ mỗi booking thành công
- Phí dịch vụ: % của tổng tiền phòng (không bao gồm phụ thu, thuế)
- Số tiền Owner nhận được = Tổng tiền booking - Phí dịch vụ - Phí giao dịch (nếu có)
- Quản lý thanh toán cho Owner:
  - Tích lũy số tiền chờ thanh toán
  - Thanh toán định kỳ (hàng tuần/tháng) hoặc theo yêu cầu
  - Lịch sử thanh toán

**Quy tắc:**
- Phí dịch vụ mặc định: 10-15% (có thể thay đổi theo thỏa thuận)
- Chỉ thanh toán cho Owner sau khi booking completed (khách đã check-out)
- Nếu booking bị hủy và đã hoàn tiền, không tính phí dịch vụ

## 5. Đánh giá và nhận xét (Reviews)

### 5.1. Đánh giá từ khách hàng

**Nghiệp vụ:**
- Sau khi check-out, khách hàng có thể đánh giá:
  - Số sao (1-5 sao)
  - Nhận xét chi tiết
  - Đánh giá theo tiêu chí: vị trí, giá trị, vệ sinh, dịch vụ, tiện ích
  - Upload ảnh (tùy chọn)
- Chỉnh sửa/xóa đánh giá của mình (trong vòng 7 ngày sau khi đánh giá)
- Phản hồi đánh giá từ Owner/Manager

**Quy tắc:**
- Chỉ có thể đánh giá sau khi booking completed
- Mỗi booking chỉ được đánh giá 1 lần
- Đánh giá phải được duyệt (hoặc tự động hiển thị sau 24h)

### 5.2. Phản hồi từ Owner/Manager

**Nghiệp vụ:**
- Owner/Manager có thể phản hồi đánh giá của khách hàng
- Xem thống kê đánh giá: điểm trung bình, số lượng đánh giá, phân bố sao

## 6. Thông báo và liên lạc

### 6.1. Thông báo hệ thống

**Nghiệp vụ:**
- Gửi email thông báo:
  - Xác nhận đặt phòng
  - Xác nhận thanh toán
  - Nhắc nhở check-in (1 ngày trước)
  - Xác nhận check-in/check-out
  - Thông báo hủy booking
  - Thông báo hoàn tiền
- Gửi SMS (tùy chọn, có phí)
- Thông báo trong app/web (in-app notification)

**Kiến trúc NotificationModule (event-driven):**
- Mỗi nghiệp vụ phát sự kiện (CQRS hoặc Kafka topic) khi cần gửi thông báo, ví dụ `notification.password-reset`.
- `NotificationModule` subscribe Kafka topic tương ứng (hoặc nhận trực tiếp qua EventEmitter) → mapping vào aggregate `Notification`, ghi log vào bảng `notification_logs`.
- `NotificationService` quyết định channel (hiện hỗ trợ email, future: sms/push), chọn template, truyền payload (OTP, link, booking info).
- Provider email (SendGrid/Mailgun/SES…) được trừu tượng hóa; có thể cấu hình fallback hoặc logger provider cho dev.
- Lưu retry metadata (`status`, `attempts`, `last_attempt_at`, `error_message`) để theo dõi SLA và tái gửi nếu provider lỗi.
- Có thể kích hoạt chế độ đồng bộ (call trực tiếp NotificationService) cho case OTP, đồng thời vẫn publish event để đảm bảo audit.

### 6.2. Tin nhắn giữa khách hàng và Owner/Manager

**Nghiệp vụ:**
- Khách hàng và Owner/Manager có thể nhắn tin với nhau qua hệ thống
- Tin nhắn liên quan đến booking cụ thể
- Thông báo khi có tin nhắn mới

## 7. Quản lý khuyến mãi (Promotions)

### 7.1. Mã giảm giá (Coupon/Discount Code)

**Nghiệp vụ:**
- Tạo mã giảm giá:
  - Mã code (duy nhất)
  - Loại giảm giá: % hoặc số tiền cố định
  - Giá trị giảm
  - Số lần sử dụng tối đa
  - Thời gian hiệu lực
  - Điều kiện áp dụng (số tiền tối thiểu, loại phòng, v.v.)
- Áp dụng mã khi đặt phòng
- Quản lý mã đã sử dụng

**Quy tắc:**
- Mỗi mã chỉ sử dụng 1 lần cho 1 booking
- Mã có thể có giới hạn số lần sử dụng tổng cộng
- Mã có thể chỉ áp dụng cho một số homestay cụ thể

### 7.2. Chương trình khuyến mãi

**Nghiệp vụ:**
- Tạo chương trình khuyến mãi:
  - Giảm giá cho homestay/phòng cụ thể
  - Giảm giá theo mùa
  - Flash sale (giảm giá trong thời gian ngắn)
- Tự động áp dụng hoặc yêu cầu mã code

## 8. Báo cáo và thống kê

### 8.1. Báo cáo cho Owner/Manager

**Nghiệp vụ:**
- Thống kê doanh thu:
  - Theo ngày/tuần/tháng/năm
  - Theo loại phòng
  - So sánh các kỳ
  - Đối với hotel: doanh thu từ dịch vụ (nhà hàng, spa, v.v.)
  - Đối với hotel: doanh thu theo tầng
- Thống kê booking:
  - Số lượng booking, tỷ lệ hủy
  - Tỷ lệ lấp đầy (occupancy rate)
  - Thời gian đặt trung bình
  - Đối với hotel: tỷ lệ lấp đầy theo loại phòng, theo tầng
  - Đối với hotel: thời gian lưu trú trung bình (ADR - Average Daily Rate)
  - Đối với hotel: RevPAR (Revenue Per Available Room)
- Thống kê đánh giá:
  - Điểm trung bình
  - Số lượng đánh giá
  - Phân tích xu hướng
  - Đối với hotel: đánh giá theo tiêu chí (vị trí, giá trị, vệ sinh, dịch vụ, tiện ích)
- Đối với hotel: thống kê dịch vụ:
  - Số lượng đặt dịch vụ (tổng, theo loại, theo ngày/tuần/tháng)
  - Doanh thu từng loại dịch vụ (nhà hàng, spa, phòng họp, etc.)
  - Doanh thu từ booking standalone vs đặt kèm
  - Dịch vụ phổ biến nhất
  - Tỷ lệ lấp đầy (occupancy rate) cho từng dịch vụ
  - Thống kê theo tầng (dịch vụ ở tầng nào có doanh thu cao nhất)
  - Thống kê booking dịch vụ: tỷ lệ hủy, no-show, completed

### 8.2. Báo cáo cho Super Admin

**Nghiệp vụ:**
- Tổng quan hệ thống:
  - Tổng số homestay/hotel, booking, doanh thu
  - Tổng số người dùng theo vai trò (Owner, Manager, Staff, Customer)
  - Tỷ lệ tăng trưởng
  - Phân tích theo loại hình lưu trú (homestay vs hotel)
  - Phân tích theo địa điểm
- Quản lý người dùng:
  - Số lượng người dùng theo vai trò
  - Hoạt động của người dùng
  - Tỷ lệ người dùng hoạt động
  - Danh sách người dùng
  - Quản lý tài khoản Super Admin
- Quản lý giao dịch:
  - Tổng giao dịch, tỷ lệ thành công/thất bại
  - Doanh thu phí dịch vụ (commission)
  - Phân tích theo phương thức thanh toán
- Quản lý cơ sở lưu trú:
  - Danh sách homestay/hotel chờ duyệt
  - Danh sách homestay/hotel đã duyệt
  - Danh sách homestay/hotel bị từ chối
  - Thống kê theo hạng sao (đối với hotel)
  - Đánh giá chất lượng cơ sở lưu trú
- Quản lý hệ thống:
  - Cấu hình phí dịch vụ (commission rate)
  - Cấu hình hệ thống chung
  - Quản lý log và audit trail
  - Quản lý backup và recovery

## 9. Quy tắc nghiệp vụ quan trọng

### 9.1. Tính khả dụng phòng (Room Availability)

- Phòng được coi là available khi:
  - Không có booking confirmed trong khoảng thời gian đó
  - Không bị block bởi Owner/Manager
  - Số lượng phòng available > 0
- Khi có booking pending_payment, phòng vẫn available cho booking khác (trong thời gian hold)
- Sau khi booking confirmed, phòng không còn available trong khoảng thời gian đó

### 9.2. Chính sách hủy (Cancellation Policy)

**Các loại chính sách:**
- `flexible`: Hủy miễn phí trước 1 ngày check-in, hoàn 100% tiền
- `moderate`: Hủy miễn phí trước 7 ngày check-in, hoàn 100% tiền; hủy trong 7 ngày, hoàn 50%
- `strict`: Hủy miễn phí trước 14 ngày check-in, hoàn 100% tiền; hủy trong 14 ngày, không hoàn tiền
- `non_refundable`: Không hoàn tiền dù hủy sớm

**Quy tắc:**
- Owner/Manager chọn chính sách khi tạo homestay/hotel
- Áp dụng chính sách khi khách hủy booking
- Thời gian hoàn tiền: 3-7 ngày làm việc

### 9.3. Tính giá động (Dynamic Pricing)

- Giá có thể thay đổi theo:
  - Mùa (high/low season)
  - Ngày trong tuần
  - Sự kiện đặc biệt
  - Số lượng phòng còn lại (last minute pricing)
- Giá tại thời điểm đặt phòng được giữ cố định cho booking đó

### 9.4. Xử lý overbooking

- Hệ thống không cho phép overbooking (đặt quá số phòng có sẵn)
- Khi có nhiều người cùng đặt phòng cuối cùng:
  - Ưu tiên booking thanh toán thành công trước
  - Booking pending_payment có thể bị hủy nếu phòng đã hết

### 9.5. Bảo mật và quyền riêng tư

- Thông tin thanh toán được mã hóa, không lưu trữ thông tin thẻ đầy đủ
- Tuân thủ PCI DSS cho xử lý thanh toán
- Bảo vệ thông tin cá nhân của người dùng theo quy định

## 10. Luồng nghiệp vụ chính

### 10.1. Luồng đặt phòng và thanh toán

```
1. Khách hàng tìm kiếm homestay/hotel
2. Chọn homestay/hotel và phòng
   - Đối với hotel: có thể chọn phòng cụ thể (nếu cho phép)
   - Đối với hotel: có thể chọn dịch vụ kèm (bữa sáng, spa, v.v.)
3. Nhập thông tin đặt phòng
4. Xem tổng tiền và xác nhận
5. Tạo booking với trạng thái pending_payment
6. Chuyển đến trang thanh toán
7. Chọn phương thức thanh toán
8. Thực hiện thanh toán
9. Nếu thành công:
   - Cập nhật booking thành confirmed
   - Đối với hotel: gán phòng cụ thể (nếu đã chọn) hoặc giữ để gán khi check-in
   - Gửi email xác nhận
   - Trừ số phòng available
10. Nếu thất bại:
    - Cho phép thử lại (tối đa 3 lần)
    - Sau 15 phút nếu chưa thanh toán, hủy booking
```

### 10.2. Luồng check-in/check-out

```
1. Đến ngày check-in:
   - Hệ thống gửi email nhắc nhở (1 ngày trước)
   - Khách đến homestay/hotel
2. Owner/Manager xác nhận check-in trong hệ thống:
   - Đối với hotel: gán phòng cụ thể cho khách (nếu chưa gán)
   - Đối với hotel: cấp thẻ phòng, hướng dẫn đến phòng
3. Trong thời gian lưu trú:
   - Khách và Owner/Manager có thể nhắn tin
   - Đối với hotel: khách có thể đặt thêm dịch vụ (spa, nhà hàng, v.v.)
   - Đối với hotel: quản lý phí phát sinh (minibar, dịch vụ phòng, v.v.)
4. Đến ngày check-out:
   - Khách rời homestay/hotel
   - Đối với hotel: kiểm tra phòng, tính phí phát sinh
   - Owner/Manager xác nhận check-out
   - Đối với hotel: thu thẻ phòng
5. Sau check-out:
   - Booking chuyển sang trạng thái completed
   - Khách có thể đánh giá
   - Tính toán và thanh toán cho Owner
   - Đối với hotel: giải phóng phòng để có thể đặt lại
```

### 10.3. Luồng hủy booking và hoàn tiền

```
1. Khách hàng yêu cầu hủy booking
2. Hệ thống kiểm tra chính sách hủy
3. Tính toán số tiền hoàn lại (nếu có)
4. Cập nhật booking thành cancelled
5. Cập nhật số phòng available
6. Nếu có hoàn tiền:
   - Tạo giao dịch refund
   - Gọi API cổng thanh toán để hoàn tiền
   - Cập nhật trạng thái giao dịch
   - Gửi email thông báo hoàn tiền
7. Điều chỉnh doanh thu Owner (nếu đã thanh toán)
```

## 11. Tích hợp bên ngoài

### 11.1. Cổng thanh toán (Payment Gateway)

- Tích hợp các cổng thanh toán phổ biến:
  - VNPay
  - MoMo
  - ZaloPay
  - Stripe (cho thẻ quốc tế)
- Xử lý webhook để cập nhật trạng thái giao dịch
- Hỗ trợ nhiều cổng thanh toán, khách hàng chọn khi thanh toán

### 11.2. Bản đồ (Maps)

- Tích hợp Google Maps hoặc Mapbox để:
  - Hiển thị vị trí homestay/hotel
  - Tìm kiếm theo vị trí
  - Tính khoảng cách, chỉ đường
  - Tìm kiếm gần các điểm đến (sân bay, trung tâm thành phố, bãi biển, v.v.)

### 11.3. Email Service

- Tích hợp email service (SendGrid, Mailgun, AWS SES) để gửi email
- Template email cho các loại thông báo khác nhau

### 11.4. SMS Service (Tùy chọn)

- Tích hợp SMS service để gửi OTP, thông báo quan trọng

## 12. Yêu cầu kỹ thuật

### 12.1. Hiệu năng

- Thời gian phản hồi tìm kiếm < 2 giây
- Hỗ trợ đồng thời nhiều người đặt phòng cùng lúc
- Cache kết quả tìm kiếm phổ biến
- Tối ưu hóa query database

### 12.2. Bảo mật

- Mã hóa thông tin nhạy cảm
- Xác thực 2 lớp (2FA) cho tài khoản Owner/Manager
- Rate limiting để chống spam, DDoS
- Logging và monitoring các hoạt động nghi ngờ

### 12.3. Khả năng mở rộng

- Kiến trúc microservices hoặc modular
- Hỗ trợ horizontal scaling
- Database sharding nếu cần
- Message queue cho xử lý bất đồng bộ

### 12.4. Backup và Recovery

- Backup database định kỳ (hàng ngày)
- Backup dữ liệu quan trọng (booking, giao dịch)
- Có kế hoạch disaster recovery

---

## 13. Nghiệp vụ đặc thù của Hotel

### 13.1. Quản lý nhân viên và phân quyền

**Nghiệp vụ:**
- **Tạo tài khoản nhân viên:**
  - Super Admin có thể tạo tài khoản nhân viên
  - Owner có thể tạo tài khoản nhân viên
  - Manager có thể tạo tài khoản nhân viên (nếu được Owner cấp quyền)
  - Nhân viên không thể tự đăng ký, phải được tạo bởi người có quyền
- **Các loại nhân viên có thể tạo:**
  - **Manager:** quản lý một hoặc nhiều hotel/homestay được gán
  - **Receptionist (Lễ tân):** check-in/check-out, quản lý booking, xem lịch đặt phòng
  - **Housekeeping (Nhân viên phục vụ):** cập nhật trạng thái phòng (clean, dirty, maintenance), xem lịch dọn phòng
  - **Service Staff (Nhân viên dịch vụ):** quản lý đặt dịch vụ (spa, nhà hàng), xác nhận/hủy đặt dịch vụ
  - **Accountant (Kế toán):** xem báo cáo, quản lý hóa đơn, xem thống kê doanh thu
- **Quy trình tạo tài khoản nhân viên:**
  - Người có quyền nhập thông tin: email, họ tên, số điện thoại, vai trò
  - Hệ thống tự động tạo mật khẩu tạm thời
  - Gửi email cho nhân viên với thông tin đăng nhập
  - Nhân viên phải đổi mật khẩu lần đầu khi đăng nhập
  - Gán quyền chi tiết cho từng nhân viên (thông qua RBAC module):
    - Chọn vai trò (role) từ catalog hoặc tạo role mới (chỉ Super Admin)
    - Mỗi role có thể gán nhiều permissions
    - User có thể có nhiều roles
    - User có thể có permissions trực tiếp (ngoài permissions từ roles)
    - Permissions được quản lý bởi RBAC module, không nằm trong User module
    - Permissions từ roles được merge với permissions trực tiếp khi check quyền (real-time)
    - Gán vào homestay/hotel cụ thể (nếu Owner quản lý nhiều homestay/hotel)
- **Quản lý ca làm việc (shift management):**
  - Tạo ca làm việc
  - Gán nhân viên vào ca
  - Xem lịch làm việc của nhân viên
- **Quản lý thông tin nhân viên:**
  - Cập nhật thông tin cá nhân
  - Vô hiệu hóa/kích hoạt tài khoản
  - Xóa tài khoản (chỉ khi không có hoạt động liên quan)
  - Đặt lại mật khẩu (gửi email với mật khẩu mới)

**Quy tắc:**
- **Tạo tài khoản:**
  - Nhân viên không thể tự đăng ký, phải được tạo bởi Super Admin, Owner hoặc Manager
  - Khi tạo, hệ thống tự động tạo mật khẩu tạm thời và gửi email
  - Nhân viên phải đổi mật khẩu lần đầu khi đăng nhập
  - User phải có ít nhất 1 role
- **Phân quyền (thông qua RBAC module):**
  - Nhân viên chỉ có quyền truy cập dữ liệu trong phạm vi được gán
  - Không thể tạo nhân viên với quyền cao hơn người tạo
  - Manager chỉ có thể quản lý nhân viên nếu được Owner cấp quyền
  - **Role là Domain Entity:**
    - Role có CRUD operations (chỉ Super Admin mới có thể tạo/sửa/xóa roles)
    - Role có field `is_super_admin` để đánh dấu role mặc định
    - Role có relationship many-to-many với Permission
    - Super Admin role (`is_super_admin = true`) không thể xóa
  - **Super Admin:** Tự động có full permissions (check `is_super_admin` flag), không cần gán permissions cụ thể
  - **Các role khác:** Phải được gán permissions cụ thể hoặc wildcard permissions
  - **Permission format:** `module:action` (ví dụ: `user:manage`, `booking:read`)
  - **Wildcard permissions:**
    - `*:manage`: Full access to all modules
    - `module:*`: Full access to all actions in a module
  - **User có roles và permissions độc lập:**
    - User có thể có nhiều roles
    - User có thể có permissions trực tiếp (ngoài permissions từ roles)
    - Permissions từ roles được merge với permissions trực tiếp khi check quyền (real-time từ database)
  - Chỉ Super Admin mới có thể gán roles và permissions cho User
  - Chỉ Super Admin mới có thể tạo/sửa/xóa roles
  - Permissions chỉ áp dụng cho User (admin/staff), không áp dụng cho Customer
  - Permissions được check real-time từ database (không cần đăng nhập lại khi gán permissions mới cho role)
- **Bảo mật:**
  - Owner không thể bị xóa hoặc vô hiệu hóa bởi Manager hoặc Staff
  - Hoạt động của tất cả nhân viên được ghi log để theo dõi và audit
  - Khi vô hiệu hóa nhân viên, tài khoản vẫn tồn tại nhưng không thể đăng nhập
  - Nhân viên bị xóa sẽ không thể truy cập hệ thống nhưng dữ liệu lịch sử vẫn được giữ lại
  - Guards (`RolesGuard`, `PermissionsGuard`) chỉ áp dụng cho User, không áp dụng cho Customer

### 13.2. Quản lý trạng thái phòng (Room Status Management)

**Nghiệp vụ:**
- Quản lý trạng thái phòng cụ thể:
  - `available`: Phòng sẵn sàng, có thể đặt
  - `occupied`: Phòng đang có khách
  - `dirty`: Phòng cần dọn dẹp sau khi khách check-out
  - `clean`: Phòng đã dọn dẹp, sẵn sàng
  - `maintenance`: Phòng đang bảo trì, không thể đặt
  - `out_of_order`: Phòng hỏng, không thể sử dụng
- Cập nhật trạng thái phòng:
  - Tự động khi check-in/check-out
  - Thủ công bởi nhân viên housekeeping
- Xem dashboard trạng thái phòng theo tầng hoặc theo loại

**Quy tắc:**
- Chỉ phòng có trạng thái `available` hoặc `clean` mới có thể đặt
- Phòng `dirty` phải được dọn dẹp trước khi chuyển sang `clean`
- Phòng `maintenance` hoặc `out_of_order` không thể đặt

### 13.3. Quản lý đặt dịch vụ (Service Booking)

**Nghiệp vụ:**
- Khách có thể đặt dịch vụ:
  - Trước khi đến (khi đặt phòng hoặc sau khi đặt phòng)
  - Trong thời gian lưu trú
- Các loại dịch vụ có thể đặt:
  - Dịch vụ có lịch (spa, nhà hàng): chọn thời gian cụ thể
  - Dịch vụ không cần lịch (minibar, dịch vụ phòng): đặt và phục vụ ngay
- Quản lý lịch đặt dịch vụ:
  - Xem lịch đặt của từng dịch vụ
  - Xác nhận/hủy đặt dịch vụ
  - Gửi thông báo nhắc nhở

**Quy tắc:**
- Dịch vụ có lịch phải đặt trước ít nhất 2 giờ
- Có thể hủy đặt dịch vụ trước 1 giờ
- Phí dịch vụ được tính vào hóa đơn khi check-out

### 13.4. Quản lý hóa đơn (Invoice Management)

**Nghiệp vụ:**
- Tạo hóa đơn khi check-out:
  - Tiền phòng (đã thanh toán trước)
  - Phí dịch vụ phát sinh (minibar, dịch vụ phòng, spa, nhà hàng)
  - Phí phát sinh khác (nếu có)
  - Tổng tiền cần thanh toán
- In hóa đơn
- Gửi hóa đơn qua email
- Quản lý lịch sử hóa đơn

**Quy tắc:**
- Hóa đơn phải bao gồm tất cả phí phát sinh
- Có thể thanh toán bằng nhiều phương thức khi check-out
- Hóa đơn được lưu trữ để tra cứu sau

### 13.5. Quản lý khách hàng thân thiết (Loyalty Program)

**Nghiệp vụ:**
- Tạo chương trình khách hàng thân thiết:
  - Tích điểm khi đặt phòng
  - Đổi điểm lấy voucher, giảm giá
  - Hạng thành viên (Bronze, Silver, Gold, Platinum)
- Quản lý điểm tích lũy:
  - Tự động tích điểm khi booking completed
  - Xem lịch sử tích điểm
  - Đổi điểm
- Ưu đãi cho khách hàng thân thiết:
  - Giảm giá theo hạng
  - Ưu tiên nâng cấp phòng (nếu có)
  - Dịch vụ miễn phí (bữa sáng, wifi, v.v.)

**Quy tắc:**
- Điểm tích lũy có thời hạn (ví dụ: 1 năm)
- Điểm không thể chuyển nhượng
- Có thể áp dụng cho cả homestay và hotel, hoặc riêng từng loại

---

**Lưu ý:** Tài liệu này mô tả các nghiệp vụ cơ bản của hệ thống quản lý homestay và hotel booking. Trong quá trình phát triển, có thể bổ sung hoặc điều chỉnh các nghiệp vụ dựa trên yêu cầu thực tế.

