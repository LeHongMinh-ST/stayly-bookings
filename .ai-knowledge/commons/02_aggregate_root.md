# Phân tích Aggregate Root theo Domain-Driven Design (DDD)

## 1. Tổng quan

Dựa trên nghiệp vụ hệ thống quản lý homestay và hotel booking, tài liệu này phân tích và xác định các Aggregate Root theo nguyên tắc DDD.

**Nguyên tắc xác định Aggregate Root:**
- Aggregate Root là entry point duy nhất để truy cập vào aggregate
- Aggregate Root đảm bảo tính nhất quán (consistency) của toàn bộ aggregate
- Mỗi aggregate có boundary rõ ràng, độc lập với các aggregate khác
- Aggregate Root có identity duy nhất và quản lý lifecycle của các entity bên trong

## 2. Các Aggregate Root

### 2.1. User Aggregate

**Aggregate Root:** `User`

**Mô tả:**
- Quản lý tài khoản quản lý hệ thống (Super Admin, Owner, Manager, Staff)
- Tách biệt hoàn toàn với Customer
- Đăng nhập vào Admin Panel
- **Lưu ý:** Roles và Permissions được quản lý bởi RBAC module (xem 2.14. RBAC Aggregate)

**Entities:**
- `User` (Aggregate Root)
  - `id`: Unique identifier
  - `email`: Email đăng nhập (unique)
  - `password`: Mật khẩu (hashed)
  - `full_name`: Họ tên
  - `phone`: Số điện thoại
  - `status`: Trạng thái (active, inactive, suspended)
  - `email_verified_at`: Thời gian xác thực email
  - `password_changed_at`: Thời gian đổi mật khẩu lần cuối
  - `created_by`: Người tạo (User ID)
  - `roles`: Danh sách roles (tham chiếu đến RBAC module qua ID)
  - `permissions`: Danh sách permissions (tham chiếu đến RBAC module qua ID)
  - `created_at`, `updated_at`

- `UserAssignment` (Entity) - Gán User vào homestay/hotel
  - `id`
  - `user_id`: Foreign key to User
  - `accommodation_id`: Foreign key to Accommodation
  - `role`: Vai trò tại accommodation này (manager, receptionist, etc.)
  - `created_at`, `updated_at`

**Value Objects:**
- `Email`: Email address với validation
- `Password`: Mật khẩu với encryption
- `UserStatus`: Enum (active, inactive, suspended)
- `Role`: Value object từ RBAC module (super_admin, owner, manager, staff)
- `Permission`: Value object từ RBAC module (user:manage, booking:read, etc.)

**Business Rules:**
- Email phải unique trong hệ thống
- Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số
- User phải đổi mật khẩu lần đầu khi đăng nhập
- Owner không thể bị xóa bởi Manager hoặc Staff
- Không thể tạo User với quyền cao hơn người tạo
- User chỉ có thể truy cập Admin Panel
- Roles và Permissions được quản lý bởi RBAC module, User aggregate chỉ tham chiếu qua ID
- User phải có ít nhất 1 role
- Super Admin tự động có full permissions (không cần gán permissions cụ thể)

**Repository:** `UserRepository`

**Domain Services:**
- `UserCreationService`: Tạo User mới với validation và gửi email
- `PasswordResetService`: Đặt lại mật khẩu

**Dependencies:**
- Phụ thuộc vào RBAC module để:
  - Validate roles và permissions khi tạo/cập nhật User
  - Load roles và permissions khi hydrate User aggregate
  - Gán roles và permissions cho User (thông qua RBAC module ports)

---

### 2.2. Customer Aggregate

**Aggregate Root:** `Customer`

**Mô tả:**
- Quản lý tài khoản khách hàng
- Tách biệt hoàn toàn với User
- Chỉ đăng nhập vào Frontend (giao diện khách hàng)
- Không thể truy cập Admin Panel

**Entities:**
- `Customer` (Aggregate Root)
  - `id`: Unique identifier
  - `email`: Email đăng nhập (unique)
  - `password`: Mật khẩu (hashed)
  - `full_name`: Họ tên
  - `phone`: Số điện thoại
  - `date_of_birth`: Ngày sinh (optional)
  - `status`: Trạng thái (active, inactive, suspended)
  - `email_verified_at`: Thời gian xác thực email
  - `created_at`, `updated_at`

- `CustomerPaymentMethod` (Entity)
  - `id`
  - `customer_id`: Foreign key to Customer
  - `type`: Loại (credit_card, e_wallet, bank_account)
  - `provider`: Nhà cung cấp (visa, momo, vnpay, etc.)
  - `token`: Token từ payment gateway (encrypted)
  - `is_default`: Mặc định
  - `created_at`, `updated_at`

- `LoyaltyPoint` (Entity) - Điểm tích lũy
  - `id`
  - `customer_id`: Foreign key to Customer
  - `points`: Số điểm
  - `expires_at`: Thời gian hết hạn
  - `created_at`, `updated_at`

**Value Objects:**
- `Email`: Email address với validation
- `Password`: Mật khẩu với encryption
- `CustomerStatus`: Enum (active, inactive, suspended)
- `LoyaltyTier`: Enum (bronze, silver, gold, platinum)

**Business Rules:**
- Email phải unique trong hệ thống (có thể trùng với User nhưng là tài khoản riêng)
- Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số
- Phải xác thực email trước khi có thể đặt phòng
- Customer không thể truy cập Admin Panel
- Customer tự đăng ký, không được tạo bởi User

**Repository:** `CustomerRepository`

**Domain Services:**
- `CustomerRegistrationService`: Đăng ký Customer mới
- `LoyaltyPointService`: Quản lý điểm tích lũy

---

### 2.3. Accommodation Aggregate

**Aggregate Root:** `Accommodation`

**Mô tả:**
- Quản lý thông tin homestay và hotel
- Sử dụng Single Table Inheritance hoặc Class Table Inheritance
- Quản lý trạng thái, duyệt, tạm ngưng

**Entities:**
- `Accommodation` (Aggregate Root - Abstract)
  - `id`: Unique identifier
  - `type`: Loại (homestay, hotel)
  - `name`: Tên
  - `status`: Trạng thái (pending, approved, rejected, active, suspended)
  - `owner_id`: Foreign key to User (Owner)
  - `address`: Địa chỉ (Value Object)
  - `location`: Tọa độ GPS (Value Object)
  - `description`: Mô tả
  - `images`: Danh sách hình ảnh
  - `amenities`: Danh sách tiện ích
  - `policies`: Chính sách (Value Object)
  - `cancellation_policy`: Chính sách hủy (Value Object)
  - `approved_by`: User ID duyệt (Super Admin)
  - `approved_at`: Thời gian duyệt
  - `created_at`, `updated_at`

- `Homestay` (Entity - extends Accommodation)
  - Kế thừa tất cả từ Accommodation
  - Không có thêm trường đặc biệt

- `Hotel` (Entity - extends Accommodation)
  - `star_rating`: Hạng sao (1-5)
  - `total_floors`: Số tầng
  - `total_rooms`: Số phòng tổng cộng
  - `year_built`: Năm xây dựng
  - `year_renovated`: Năm cải tạo gần nhất
  - `contact_phone`: Số điện thoại
  - `contact_email`: Email
  - `website`: Website
  - `check_in_time`: Giờ check-in mặc định
  - `check_out_time`: Giờ check-out mặc định

- `AccommodationImage` (Entity)
  - `id`
  - `accommodation_id`: Foreign key to Accommodation
  - `url`: URL hình ảnh
  - `type`: Loại (exterior, lobby, room, service, etc.)
  - `order`: Thứ tự hiển thị
  - `created_at`, `updated_at`

- `Floor` (Entity) - Chỉ cho Hotel
  - `id`: Unique identifier
  - `hotel_id`: Foreign key to Accommodation (Hotel)
  - `floor_number`: Số tầng
  - `name`: Tên tầng (Tầng 1, Tầng VIP, Tầng hồ bơi)
  - `floor_type`: Loại tầng (room_floor, restaurant_floor, spa_floor, gym_floor, pool_floor, meeting_floor, business_floor, mixed_floor, lobby_floor)
  - `description`: Mô tả (optional)
  - `amenities`: Tiện ích của tầng (optional)
  - `status`: Trạng thái (active, maintenance, closed)
  - `created_at`, `updated_at`

**Value Objects:**
- `Address`: Địa chỉ chi tiết
  - `street`: Số nhà, đường
  - `ward`: Phường/xã
  - `district`: Quận/huyện
  - `province`: Tỉnh/thành phố
  - `country`: Quốc gia

- `Location`: Tọa độ GPS
  - `latitude`: Vĩ độ
  - `longitude`: Kinh độ

- `AccommodationStatus`: Enum (pending, approved, rejected, active, suspended)

- `CancellationPolicy`: Chính sách hủy
  - `type`: Loại (flexible, moderate, strict, non_refundable)
  - `free_cancellation_days`: Số ngày hủy miễn phí
  - `refund_percentage`: % hoàn tiền

- `Policies`: Chính sách
  - `check_in_time`: Giờ check-in
  - `check_out_time`: Giờ check-out
  - `children_allowed`: Cho phép trẻ em
  - `pets_allowed`: Cho phép thú cưng
  - `smoking_allowed`: Cho phép hút thuốc

- `FloorStatus`: Enum (active, maintenance, closed)

- `FloorType`: Enum (room_floor, restaurant_floor, spa_floor, gym_floor, pool_floor, meeting_floor, business_floor, mixed_floor, lobby_floor)

**Business Rules:**
- Accommodation phải được Super Admin duyệt trước khi hiển thị công khai
- Không thể xóa Accommodation có booking trong vòng 30 ngày tới
- Khi tạm ngưng, không hiển thị trong tìm kiếm nhưng vẫn hiển thị booking đã đặt
- Hotel phải có ít nhất 10 phòng
- Homestay tối thiểu 3 ảnh, tối đa 20 ảnh
- Hotel tối thiểu 5 ảnh, tối đa 50 ảnh
- Floor chỉ áp dụng cho Hotel (không áp dụng cho Homestay)
- Mỗi phòng phải thuộc một tầng loại `room_floor` hoặc `mixed_floor`
- Mỗi dịch vụ có thể thuộc một tầng cụ thể (thông qua floor_id trong Service)
- Khi block Floor (status = maintenance/closed), tất cả Room và Service trong Floor đó không thể sử dụng
- Floor là optional, có thể bỏ qua nếu hotel nhỏ hoặc không cần thiết

**Repository:** `AccommodationRepository`

**Domain Services:**
- `AccommodationApprovalService`: Duyệt/từ chối Accommodation
- `AccommodationStatusService`: Quản lý trạng thái (active, suspended)
- `FloorManagementService`: Quản lý Floor (chỉ cho Hotel)

---

### 2.4. Room Aggregate

**Aggregate Root:** `Room` (cho Homestay) hoặc `RoomType` (cho Hotel)

**Mô tả:**
- Quản lý phòng cho Homestay: mỗi phòng là một instance cụ thể
- Quản lý phòng cho Hotel: RoomType (loại phòng) và Room (phòng cụ thể)

**Entities cho Homestay:**
- `Room` (Aggregate Root)
  - `id`: Unique identifier
  - `accommodation_id`: Foreign key to Accommodation (Homestay)
  - `name`: Tên phòng
  - `type`: Loại phòng (single, double, family, dormitory, etc.)
  - `area`: Diện tích (m²)
  - `max_guests`: Số khách tối đa
  - `bed_count`: Số lượng giường
  - `bed_type`: Loại giường
  - `description`: Mô tả
  - `amenities`: Tiện ích trong phòng
  - `images`: Danh sách hình ảnh
  - `inventory`: Số lượng phòng có sẵn (thường = 1 cho homestay)
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`

**Entities cho Hotel:**
- `RoomType` (Aggregate Root)
  - `id`: Unique identifier
  - `hotel_id`: Foreign key to Accommodation (Hotel)
  - `name`: Tên loại phòng (Deluxe Double, Suite, etc.)
  - `type`: Loại phòng (single, double, suite, penthouse, etc.)
  - `area`: Diện tích (m²)
  - `max_adults`: Số người lớn tối đa
  - `max_children`: Số trẻ em tối đa
  - `bed_count`: Số lượng giường
  - `bed_type`: Loại giường (single, double, king, sofa bed, etc.)
  - `view_direction`: Hướng phòng (sea, mountain, city, etc.)
  - `description`: Mô tả
  - `amenities`: Tiện ích trong phòng
  - `images`: Danh sách hình ảnh
  - `inventory`: Số lượng phòng của loại này
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`

- `Room` (Entity - thuộc RoomType)
  - `id`: Unique identifier
  - `room_type_id`: Foreign key to RoomType
  - `room_number`: Số phòng (101, 205, Suite 301)
  - `floor_id`: Foreign key to Floor (optional, có thể suy ra từ room_number)
  - `status`: Trạng thái (available, occupied, dirty, clean, maintenance, out_of_order)
  - `notes`: Ghi chú đặc biệt
  - `created_at`, `updated_at`

**Value Objects:**
- `RoomStatus`: Enum (available, occupied, dirty, clean, maintenance, out_of_order)
- `RoomType`: Enum (single, double, family, suite, penthouse, dormitory, etc.)
- `BedType`: Enum (single, double, king, queen, sofa_bed, etc.)

**Business Rules:**
- Số lượng khách tối đa phải >= 1
- Không thể xóa Room/RoomType đang có booking chưa hoàn thành
- Đối với Hotel: mỗi Room phải thuộc một RoomType
- Đối với Hotel: mỗi Room phải có room_number unique trong hotel
- Chỉ Room có status `available` hoặc `clean` mới có thể đặt
- Room `dirty` phải được dọn dẹp trước khi chuyển sang `clean`
- Room có thể có floor_id (optional), có thể suy ra từ room_number (ví dụ: 101 → tầng 1)
- Nếu Floor bị block (maintenance/closed), Room trong Floor đó không thể đặt

**Repository:** 
- `RoomRepository` (cho Homestay)
- `RoomTypeRepository` (cho Hotel)
- `RoomRepository` (cho Hotel - phòng cụ thể)

**Domain Services:**
- `RoomAvailabilityService`: Kiểm tra tính khả dụng của phòng
- `RoomStatusService`: Quản lý trạng thái phòng (cho Hotel)

---

### 2.5. Pricing Aggregate

**Aggregate Root:** `Pricing`

**Mô tả:**
- Quản lý giá cả cho Room/RoomType
- Hỗ trợ dynamic pricing (giá theo mùa, ngày trong tuần, promotion)

**Entities:**
- `Pricing` (Aggregate Root)
  - `id`: Unique identifier
  - `room_id`: Foreign key to Room (Homestay) hoặc RoomType (Hotel)
  - `base_price`: Giá cơ bản (per night)
  - `currency`: Đơn vị tiền tệ (VND, USD, etc.)
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`

- `SeasonalPrice` (Entity)
  - `id`
  - `pricing_id`: Foreign key to Pricing
  - `season`: Mùa (high_season, low_season)
  - `start_date`: Ngày bắt đầu
  - `end_date`: Ngày kết thúc
  - `price`: Giá trong mùa
  - `created_at`, `updated_at`

- `WeeklyPrice` (Entity)
  - `id`
  - `pricing_id`: Foreign key to Pricing
  - `day_of_week`: Ngày trong tuần (0-6, 0=Sunday)
  - `price`: Giá cho ngày đó
  - `created_at`, `updated_at`

- `PromotionPrice` (Entity)
  - `id`
  - `pricing_id`: Foreign key to Pricing
  - `name`: Tên khuyến mãi
  - `start_date`: Ngày bắt đầu
  - `end_date`: Ngày kết thúc
  - `price`: Giá khuyến mãi
  - `created_at`, `updated_at`

- `ExtraGuestCharge` (Entity)
  - `id`
  - `pricing_id`: Foreign key to Pricing
  - `guest_count`: Số khách
  - `charge_per_night`: Phụ thu mỗi đêm
  - `created_at`, `updated_at`

**Value Objects:**
- `Money`: Tiền tệ
  - `amount`: Số tiền
  - `currency`: Đơn vị tiền tệ

- `Season`: Enum (high_season, low_season)

**Business Rules:**
- Giá phải > 0
- Giá khuyến mãi phải < giá gốc
- Không thể thay đổi giá cho các ngày đã có booking
- Độ ưu tiên: PromotionPrice > WeeklyPrice > SeasonalPrice > base_price
- Công thức tính giá:
  ```
  Final Price = MAX(PromotionPrice, WeeklyPrice, SeasonalPrice, base_price) + ExtraGuestCharge
  ```

**Repository:** `PricingRepository`

**Domain Services:**
- `PriceCalculationService`: Tính giá cuối cùng dựa trên ngày và số khách
- `PriceValidationService`: Kiểm tra tính hợp lệ của giá

---

### 2.6. Booking Aggregate

**Aggregate Root:** `Booking`

**Mô tả:**
- Quản lý đặt phòng
- Quản lý lifecycle của booking (pending_payment -> confirmed -> completed/cancelled)
- Quản lý check-in/check-out

**Entities:**
- `Booking` (Aggregate Root)
  - `id`: Unique identifier
  - `booking_code`: Mã booking (unique, generated)
  - `customer_id`: Foreign key to Customer (có thể null nếu guest checkout)
  - `accommodation_id`: Foreign key to Accommodation
  - `room_id`: Foreign key to Room (Homestay) hoặc RoomType (Hotel)
  - `room_number`: Số phòng cụ thể (cho Hotel, có thể null nếu chưa gán)
  - `check_in_date`: Ngày check-in
  - `check_out_date`: Ngày check-out
  - `number_of_nights`: Số đêm
  - `number_of_rooms`: Số lượng phòng
  - `number_of_adults`: Số người lớn
  - `number_of_children`: Số trẻ em
  - `guest_name`: Tên khách (nếu không đăng nhập)
  - `guest_email`: Email khách (nếu không đăng nhập)
  - `guest_phone`: Số điện thoại khách
  - `special_requests`: Yêu cầu đặc biệt
  - `status`: Trạng thái (pending_payment, confirmed, cancelled, completed, no_show)
  - `total_amount`: Tổng tiền
  - `room_price`: Giá phòng
  - `extra_guest_charge`: Phụ thu thêm khách
  - `service_fee`: Phí dịch vụ (%)
  - `tax`: Thuế VAT
  - `discount_amount`: Số tiền giảm giá
  - `cancellation_policy`: Chính sách hủy áp dụng
  - `hold_until`: Thời gian hết hạn hold (15 phút)
  - `checked_in_at`: Thời gian check-in
  - `checked_out_at`: Thời gian check-out
  - `created_at`, `updated_at`

- `BookingService` (Entity) - Dịch vụ đặt kèm
  - `id`
  - `booking_id`: Foreign key to Booking
  - `service_id`: Foreign key to Service
  - `quantity`: Số lượng
  - `price`: Giá
  - `scheduled_time`: Thời gian đặt (cho dịch vụ có lịch)
  - `created_at`, `updated_at`

- `BookingGuest` (Entity) - Danh sách khách
  - `id`
  - `booking_id`: Foreign key to Booking
  - `name`: Tên khách
  - `age`: Tuổi (optional)
  - `created_at`, `updated_at`

**Value Objects:**
- `BookingStatus`: Enum (pending_payment, confirmed, cancelled, completed, no_show)
- `BookingCode`: Mã booking (generated, unique)
- `DateRange`: Khoảng thời gian
  - `check_in_date`: Ngày check-in
  - `check_out_date`: Ngày check-out
  - `number_of_nights`: Số đêm (calculated)

- `BookingAmount`: Tổng tiền
  - `room_price`: Giá phòng
  - `extra_guest_charge`: Phụ thu
  - `service_fee`: Phí dịch vụ
  - `tax`: Thuế
  - `discount_amount`: Giảm giá
  - `total_amount`: Tổng cộng

**Business Rules:**
- Booking code phải unique
- Check-out date phải sau check-in date ít nhất 1 ngày
- Số lượng khách không được vượt quá max_guests của phòng
- Phải có đủ phòng trống trong khoảng thời gian đã chọn
- Giá được tính và giữ cố định tại thời điểm đặt phòng
- Hold time là 15 phút, sau đó tự động hủy nếu chưa thanh toán
- Không thể hủy booking đã completed
- Check-in chỉ có thể thực hiện sau check_in_date
- Check-out phải sau check-in

**Repository:** `BookingRepository`

**Domain Services:**
- `BookingCreationService`: Tạo booking mới với validation
- `BookingCancellationService`: Hủy booking và tính hoàn tiền
- `BookingCheckInService`: Xử lý check-in
- `BookingCheckOutService`: Xử lý check-out
- `BookingAvailabilityService`: Kiểm tra tính khả dụng

**Domain Events:**
- `BookingCreated`: Booking được tạo
- `BookingConfirmed`: Booking được xác nhận (thanh toán thành công)
- `BookingCancelled`: Booking bị hủy
- `BookingCheckedIn`: Khách đã check-in
- `BookingCheckedOut`: Khách đã check-out
- `BookingHoldExpired`: Thời gian hold hết hạn

---

### 2.7. Payment Aggregate

**Aggregate Root:** `Payment`

**Mô tả:**
- Quản lý giao dịch thanh toán
- Hỗ trợ nhiều phương thức thanh toán
- Xử lý refund

**Entities:**
- `Payment` (Aggregate Root)
  - `id`: Unique identifier
  - `transaction_id`: Mã giao dịch từ payment gateway (unique)
  - `payment_type`: Loại thanh toán (room_booking, service_booking)
  - `booking_id`: Foreign key to Booking (optional, null nếu service_booking)
  - `service_booking_id`: Foreign key to ServiceBooking (optional, null nếu room_booking)
  - `customer_id`: Foreign key to Customer (có thể null nếu guest)
  - `amount`: Số tiền
  - `currency`: Đơn vị tiền tệ
  - `payment_method`: Phương thức thanh toán (credit_card, e_wallet, bank_transfer, pay_at_property)
  - `payment_provider`: Nhà cung cấp (vnpay, momo, zalopay, stripe, etc.)
  - `status`: Trạng thái (pending, processing, success, failed, refunded, partially_refunded)
  - `payment_data`: Dữ liệu từ payment gateway (encrypted)
  - `gateway_response`: Response từ payment gateway
  - `paid_at`: Thời gian thanh toán thành công
  - `refunded_at`: Thời gian hoàn tiền
  - `refund_amount`: Số tiền đã hoàn
  - `created_at`, `updated_at`

- `PaymentAttempt` (Entity) - Lịch sử thử thanh toán
  - `id`
  - `payment_id`: Foreign key to Payment
  - `attempt_number`: Số lần thử
  - `status`: Trạng thái (success, failed)
  - `error_message`: Thông báo lỗi
  - `attempted_at`: Thời gian thử
  - `created_at`, `updated_at`

**Value Objects:**
- `PaymentType`: Enum (room_booking, service_booking)
- `PaymentStatus`: Enum (pending, processing, success, failed, refunded, partially_refunded)
- `PaymentMethod`: Enum (credit_card, e_wallet, bank_transfer, pay_at_property)
- `PaymentProvider`: Enum (vnpay, momo, zalopay, stripe, etc.)
- `Money`: Tiền tệ (amount, currency)

**Business Rules:**
- Mỗi booking (room hoặc service) có thể có nhiều Payment (nếu thanh toán thất bại và thử lại)
- Chỉ Payment có status `success` mới xác nhận booking
- Payment phải có booking_id hoặc service_booking_id (không thể có cả hai null)
- Tối đa 3 lần thử thanh toán
- Refund phải tuân theo cancellation policy (cho room booking) hoặc chính sách hủy dịch vụ (cho service booking)
- Thời gian hoàn tiền: 3-7 ngày làm việc

**Repository:** `PaymentRepository`

**Domain Services:**
- `PaymentProcessingService`: Xử lý thanh toán
- `PaymentRefundService`: Xử lý hoàn tiền
- `PaymentGatewayService`: Tích hợp với payment gateway

**Domain Events:**
- `PaymentInitiated`: Bắt đầu thanh toán
- `PaymentSucceeded`: Thanh toán thành công (trigger confirm booking hoặc service booking)
- `PaymentFailed`: Thanh toán thất bại
- `PaymentRefunded`: Đã hoàn tiền

---

### 2.8. Review Aggregate

**Aggregate Root:** `Review`

**Mô tả:**
- Quản lý đánh giá và nhận xét từ khách hàng
- Gắn liền với Booking

**Entities:**
- `Review` (Aggregate Root)
  - `id`: Unique identifier
  - `booking_id`: Foreign key to Booking (unique, 1 booking = 1 review)
  - `customer_id`: Foreign key to Customer
  - `accommodation_id`: Foreign key to Accommodation
  - `rating`: Điểm đánh giá (1-5 sao)
  - `comment`: Nhận xét chi tiết
  - `location_rating`: Đánh giá vị trí (1-5)
  - `value_rating`: Đánh giá giá trị (1-5)
  - `cleanliness_rating`: Đánh giá vệ sinh (1-5)
  - `service_rating`: Đánh giá dịch vụ (1-5)
  - `amenities_rating`: Đánh giá tiện ích (1-5)
  - `status`: Trạng thái (pending, approved, rejected)
  - `approved_at`: Thời gian duyệt
  - `owner_response`: Phản hồi từ Owner/Manager
  - `owner_response_at`: Thời gian phản hồi
  - `created_at`, `updated_at`

- `ReviewImage` (Entity)
  - `id`
  - `review_id`: Foreign key to Review
  - `url`: URL hình ảnh
  - `order`: Thứ tự
  - `created_at`, `updated_at`

**Value Objects:**
- `Rating`: Điểm đánh giá (1-5)
- `ReviewStatus`: Enum (pending, approved, rejected)

**Business Rules:**
- Chỉ có thể đánh giá sau khi booking completed
- Mỗi booking chỉ được đánh giá 1 lần
- Review phải được duyệt (hoặc tự động hiển thị sau 24h)
- Có thể chỉnh sửa/xóa review trong vòng 7 ngày sau khi đánh giá

**Repository:** `ReviewRepository`

**Domain Services:**
- `ReviewCreationService`: Tạo review với validation
- `ReviewApprovalService`: Duyệt review

**Domain Events:**
- `ReviewCreated`: Review được tạo
- `ReviewApproved`: Review được duyệt
- `ReviewResponded`: Owner phản hồi review

---

### 2.9. Promotion Aggregate

**Aggregate Root:** `Promotion`

**Mô tả:**
- Quản lý khuyến mãi, mã giảm giá
- Có thể áp dụng cho Accommodation, Room, hoặc toàn hệ thống

**Entities:**
- `Promotion` (Aggregate Root)
  - `id`: Unique identifier
  - `code`: Mã khuyến mãi (unique, optional)
  - `name`: Tên khuyến mãi
  - `type`: Loại (coupon, seasonal, flash_sale)
  - `discount_type`: Loại giảm giá (percentage, fixed_amount)
  - `discount_value`: Giá trị giảm
  - `min_amount`: Số tiền tối thiểu để áp dụng
  - `max_discount`: Giảm giá tối đa (nếu percentage)
  - `start_date`: Ngày bắt đầu
  - `end_date`: Ngày kết thúc
  - `max_uses`: Số lần sử dụng tối đa (null = unlimited)
  - `used_count`: Số lần đã sử dụng
  - `max_uses_per_customer`: Số lần sử dụng tối đa mỗi khách (null = unlimited)
  - `applicable_to`: Áp dụng cho (all, specific_accommodation, specific_room_type)
  - `accommodation_ids`: Danh sách accommodation ID (nếu applicable_to = specific_accommodation)
  - `room_type_ids`: Danh sách room type ID (nếu applicable_to = specific_room_type)
  - `status`: Trạng thái (active, inactive, expired)
  - `created_by`: User ID tạo
  - `created_at`, `updated_at`

- `PromotionUsage` (Entity) - Lịch sử sử dụng
  - `id`
  - `promotion_id`: Foreign key to Promotion
  - `booking_id`: Foreign key to Booking
  - `customer_id`: Foreign key to Customer
  - `discount_amount`: Số tiền đã giảm
  - `used_at`: Thời gian sử dụng
  - `created_at`, `updated_at`

**Value Objects:**
- `PromotionType`: Enum (coupon, seasonal, flash_sale)
- `DiscountType`: Enum (percentage, fixed_amount)
- `PromotionStatus`: Enum (active, inactive, expired)
- `PromotionCode`: Mã khuyến mãi (unique, generated)

**Business Rules:**
- Mỗi mã chỉ sử dụng 1 lần cho 1 booking
- Mã có thể có giới hạn số lần sử dụng tổng cộng
- Mã có thể chỉ áp dụng cho một số accommodation/room cụ thể
- Không thể sử dụng mã đã hết hạn hoặc đã hết lượt sử dụng
- Discount value phải > 0

**Repository:** `PromotionRepository`

**Domain Services:**
- `PromotionValidationService`: Kiểm tra tính hợp lệ của promotion
- `PromotionApplicationService`: Áp dụng promotion vào booking

**Domain Events:**
- `PromotionCreated`: Promotion được tạo
- `PromotionUsed`: Promotion được sử dụng
- `PromotionExpired`: Promotion hết hạn

---

### 2.10. Service Aggregate (Chỉ cho Hotel)

**Aggregate Root:** `Service`

**Mô tả:**
- Quản lý dịch vụ của hotel (nhà hàng, spa, gym, hồ bơi, phòng họp, etc.)
- Chỉ áp dụng cho Hotel
- Hỗ trợ booking riêng (standalone) - khách có thể đặt dịch vụ mà không cần đặt phòng nghỉ
- Mỗi dịch vụ có thể thuộc một tầng cụ thể (floor_id)

**Entities:**
- `Service` (Aggregate Root)
  - `id`: Unique identifier
  - `hotel_id`: Foreign key to Accommodation (Hotel)
  - `floor_id`: Foreign key to Floor (optional, tầng chứa dịch vụ)
  - `name`: Tên dịch vụ
  - `type`: Loại dịch vụ (restaurant, spa, gym, pool, meeting_room, business_center, laundry, room_service, concierge, shuttle, valet_parking)
  - `description`: Mô tả
  - `is_free`: Miễn phí cho khách lưu trú
  - `requires_booking`: Cần đặt trước
  - `supports_standalone_booking`: Hỗ trợ đặt riêng (không cần đặt phòng)
  - `booking_advance_hours`: Số giờ đặt trước tối thiểu
  - `opening_hours`: Giờ mở cửa
  - `capacity`: Sức chứa (nếu có)
  - `images`: Danh sách hình ảnh
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`
  
  **Chi tiết theo loại dịch vụ:**
  - **Nhà hàng (restaurant):**
    - `cuisine_type`: Loại ẩm thực
    - `table_count`: Số lượng bàn
    - `table_types`: Loại bàn (2 người, 4 người, VIP, etc.)
  - **Spa (spa):**
    - `room_count`: Số phòng spa
    - `staff_assignable`: Có thể gán nhân viên
  - **Phòng họp (meeting_room):**
    - `equipment`: Thiết bị có sẵn
    - `rental_type`: Loại thuê (theo giờ, theo ngày)
  - **Gym/Hồ bơi:**
    - `equipment_list`: Danh sách thiết bị (cho gym)
    - `dimensions`: Kích thước (cho hồ bơi)

- `ServiceItem` (Entity) - Mục dịch vụ (ví dụ: menu nhà hàng, dịch vụ spa)
  - `id`
  - `service_id`: Foreign key to Service
  - `name`: Tên mục
  - `description`: Mô tả
  - `price`: Giá
  - `currency`: Đơn vị tiền tệ
  - `duration`: Thời gian (cho spa, etc.)
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`

- `RestaurantTable` (Entity) - Bàn nhà hàng (chỉ cho restaurant service)
  - `id`
  - `service_id`: Foreign key to Service (restaurant)
  - `table_number`: Số bàn
  - `table_type`: Loại bàn (2_person, 4_person, 6_person, vip, etc.)
  - `capacity`: Sức chứa (số người)
  - `status`: Trạng thái (available, reserved, occupied, maintenance)
  - `created_at`, `updated_at`

- `SpaRoom` (Entity) - Phòng spa (chỉ cho spa service)
  - `id`
  - `service_id`: Foreign key to Service (spa)
  - `room_number`: Số phòng spa
  - `room_type`: Loại phòng (single, couple, vip, etc.)
  - `status`: Trạng thái (available, occupied, maintenance)
  - `created_at`, `updated_at`

- `ServicePackage` (Entity) - Gói dịch vụ
  - `id`
  - `hotel_id`: Foreign key to Accommodation (Hotel)
  - `name`: Tên gói
  - `description`: Mô tả
  - `service_ids`: Danh sách service ID trong gói
  - `price`: Giá gói
  - `start_date`: Ngày bắt đầu áp dụng
  - `end_date`: Ngày kết thúc
  - `status`: Trạng thái (active, inactive)
  - `created_at`, `updated_at`

- `ServiceBooking` (Entity) - Đặt dịch vụ
  - `id`
  - `service_booking_code`: Mã booking dịch vụ (unique, generated)
  - `service_id`: Foreign key to Service
  - `booking_id`: Foreign key to Booking (optional, null nếu standalone booking)
  - `service_item_id`: Foreign key to ServiceItem (optional)
  - `customer_id`: Foreign key to Customer (optional, null nếu guest)
  - `guest_name`: Tên khách (nếu không đăng nhập)
  - `guest_email`: Email khách (nếu không đăng nhập)
  - `guest_phone`: Số điện thoại khách
  - `booking_type`: Loại booking (attached_to_room, standalone)
  - `scheduled_date`: Ngày đặt
  - `scheduled_time`: Thời gian đặt (cho dịch vụ có lịch)
  - `quantity`: Số lượng
  - `number_of_people`: Số lượng người (cho nhà hàng, phòng họp)
  - `price`: Giá
  - `total_amount`: Tổng tiền
  - `status`: Trạng thái (pending_payment, confirmed, cancelled, completed, no_show)
  - `special_requests`: Yêu cầu đặc biệt
  - `assigned_staff_id`: Foreign key to User (optional, cho spa)
  - `assigned_table_id`: Foreign key to RestaurantTable (optional, cho nhà hàng)
  - `assigned_spa_room_id`: Foreign key to SpaRoom (optional, cho spa)
  - `hold_until`: Thời gian hết hạn hold (15 phút)
  - `completed_at`: Thời gian hoàn thành
  - `created_at`, `updated_at`

**Value Objects:**
- `ServiceType`: Enum (restaurant, spa, gym, pool, meeting_room, business_center, laundry, room_service, concierge, shuttle, valet_parking)
- `ServiceStatus`: Enum (active, inactive)
- `ServiceBookingType`: Enum (attached_to_room, standalone)
- `ServiceBookingStatus`: Enum (pending_payment, confirmed, cancelled, completed, no_show)
- `ServiceBookingCode`: Mã booking dịch vụ (generated, unique)
- `TableType`: Enum (2_person, 4_person, 6_person, 8_person, vip, etc.)
- `TableStatus`: Enum (available, reserved, occupied, maintenance)
- `SpaRoomType`: Enum (single, couple, vip, etc.)
- `SpaRoomStatus`: Enum (available, occupied, maintenance)

**Business Rules:**
- Dịch vụ có lịch phải đặt trước ít nhất 2 giờ
- Có thể hủy đặt dịch vụ trước 1 giờ (hoặc theo chính sách của hotel)
- Phí dịch vụ được tính vào hóa đơn khi check-out (nếu đặt trong thời gian lưu trú) hoặc thanh toán riêng (nếu standalone)
- Một số dịch vụ miễn phí cho khách lưu trú (ví dụ: wifi, gym, hồ bơi)
- Service booking có thể là:
  - **Attached to room:** Đặt kèm khi đặt phòng hoặc đặt trong thời gian lưu trú
  - **Standalone:** Đặt riêng, không cần đặt phòng nghỉ
- Standalone booking yêu cầu thông tin liên hệ (tên, email, số điện thoại)
- Standalone booking có thời gian giữ chỗ (hold time): 15 phút để thanh toán
- Service booking code phải unique
- Nếu Floor bị block (maintenance/closed), Service trong Floor đó không thể đặt
- Đối với spa: có thể gán nhân viên và phòng spa cụ thể cho booking
- Đối với nhà hàng: có thể gán bàn cụ thể cho booking
- Đối với phòng họp: có thể đặt dịch vụ kèm (catering, coffee break, equipment)
- Service booking phải kiểm tra capacity (sức chứa) trước khi xác nhận

**Repository:** `ServiceRepository`

**Domain Services:**
- `ServiceBookingService`: Đặt dịch vụ với validation (cả attached và standalone)
- `ServiceAvailabilityService`: Kiểm tra tính khả dụng của dịch vụ
- `StandaloneServiceBookingService`: Xử lý đặt dịch vụ riêng (standalone)
- `ServiceBookingCancellationService`: Hủy booking dịch vụ và tính hoàn tiền

**Domain Events:**
- `ServiceBooked`: Dịch vụ được đặt (attached hoặc standalone)
- `ServiceBookingConfirmed`: Booking dịch vụ được xác nhận (thanh toán thành công)
- `ServiceBookingCancelled`: Hủy đặt dịch vụ
- `ServiceBookingCompleted`: Hoàn thành dịch vụ
- `ServiceBookingHoldExpired`: Thời gian hold hết hạn (cho standalone booking)

---

### 2.11. Invoice Aggregate (Chỉ cho Hotel)

**Aggregate Root:** `Invoice`

**Mô tả:**
- Quản lý hóa đơn khi check-out
- Tổng hợp tất cả phí phát sinh

**Entities:**
- `Invoice` (Aggregate Root)
  - `id`: Unique identifier
  - `invoice_number`: Số hóa đơn (unique, generated)
  - `booking_id`: Foreign key to Booking
  - `hotel_id`: Foreign key to Accommodation (Hotel)
  - `customer_id`: Foreign key to Customer
  - `room_amount`: Tiền phòng (đã thanh toán trước)
  - `service_amount`: Tổng phí dịch vụ phát sinh
  - `other_charges`: Phí phát sinh khác
  - `total_amount`: Tổng tiền cần thanh toán
  - `currency`: Đơn vị tiền tệ
  - `status`: Trạng thái (draft, issued, paid, cancelled)
  - `issued_at`: Thời gian phát hành
  - `paid_at`: Thời gian thanh toán
  - `created_at`, `updated_at`

- `InvoiceItem` (Entity) - Chi tiết hóa đơn
  - `id`
  - `invoice_id`: Foreign key to Invoice
  - `description`: Mô tả
  - `quantity`: Số lượng
  - `unit_price`: Đơn giá
  - `amount`: Thành tiền
  - `type`: Loại (room, service, other)
  - `created_at`, `updated_at`

**Value Objects:**
- `InvoiceNumber`: Số hóa đơn (generated, unique)
- `InvoiceStatus`: Enum (draft, issued, paid, cancelled)
- `Money`: Tiền tệ (amount, currency)

**Business Rules:**
- Invoice phải bao gồm tất cả phí phát sinh
- Có thể thanh toán bằng nhiều phương thức khi check-out
- Invoice được lưu trữ để tra cứu sau
- Invoice chỉ được tạo khi check-out

**Repository:** `InvoiceRepository`

**Domain Services:**
- `InvoiceGenerationService`: Tạo hóa đơn khi check-out
- `InvoicePaymentService`: Xử lý thanh toán hóa đơn

**Domain Events:**
- `InvoiceIssued`: Hóa đơn được phát hành
- `InvoicePaid`: Hóa đơn đã thanh toán

---

### 2.12. Revenue Aggregate

**Aggregate Root:** `Revenue`

**Mô tả:**
- Quản lý doanh thu và chia sẻ doanh thu (commission)
- Tính toán số tiền Owner nhận được

**Entities:**
- `Revenue` (Aggregate Root)
  - `id`: Unique identifier
  - `booking_id`: Foreign key to Booking
  - `accommodation_id`: Foreign key to Accommodation
  - `total_amount`: Tổng tiền booking
  - `commission_rate`: Tỷ lệ phí dịch vụ (%)
  - `commission_amount`: Số tiền phí dịch vụ
  - `transaction_fee`: Phí giao dịch (nếu có)
  - `owner_amount`: Số tiền Owner nhận được
  - `currency`: Đơn vị tiền tệ
  - `status`: Trạng thái (pending, paid, cancelled)
  - `paid_at`: Thời gian thanh toán cho Owner
  - `created_at`, `updated_at`

- `RevenuePayment` (Entity) - Lịch sử thanh toán cho Owner
  - `id`
  - `revenue_id`: Foreign key to Revenue
  - `amount`: Số tiền thanh toán
  - `payment_method`: Phương thức thanh toán
  - `payment_date`: Ngày thanh toán
  - `created_at`, `updated_at`

**Value Objects:**
- `RevenueStatus`: Enum (pending, paid, cancelled)
- `Money`: Tiền tệ (amount, currency)

**Business Rules:**
- Chỉ thanh toán cho Owner sau khi booking completed
- Nếu booking bị hủy và đã hoàn tiền, không tính phí dịch vụ
- Phí dịch vụ mặc định: 10-15% (có thể thay đổi theo thỏa thuận)
- Công thức: `owner_amount = total_amount - commission_amount - transaction_fee`

**Repository:** `RevenueRepository`

**Domain Services:**
- `RevenueCalculationService`: Tính toán doanh thu và commission
- `RevenuePaymentService`: Thanh toán cho Owner

**Domain Events:**
- `RevenueCalculated`: Doanh thu được tính toán
- `RevenuePaid`: Đã thanh toán cho Owner

---

### 2.13. Message Aggregate

**Aggregate Root:** `Message`

**Mô tả:**
- Quản lý tin nhắn giữa Customer và Owner/Manager
- Gắn liền với Booking

**Entities:**
- `Message` (Aggregate Root)
  - `id`: Unique identifier
  - `booking_id`: Foreign key to Booking
  - `sender_id`: ID người gửi (Customer ID hoặc User ID)
  - `sender_type`: Loại người gửi (customer, user)
  - `receiver_id`: ID người nhận
  - `receiver_type`: Loại người nhận (customer, user)
  - `content`: Nội dung tin nhắn
  - `is_read`: Đã đọc chưa
  - `read_at`: Thời gian đọc
  - `created_at`, `updated_at`

**Value Objects:**
- `MessageStatus`: Enum (sent, read)

**Business Rules:**
- Tin nhắn liên quan đến booking cụ thể
- Thông báo khi có tin nhắn mới

**Repository:** `MessageRepository`

**Domain Events:**
- `MessageSent`: Tin nhắn được gửi
- `MessageRead`: Tin nhắn được đọc

---

### 2.14. RBAC Aggregate

**Aggregate Root:** `Role` (Domain Entity)

**Mô tả:**
- Quản lý roles như Domain Entities với CRUD operations
- Quản lý permissions như Value Objects (catalog được seed sẵn)
- Cung cấp khả năng gán roles và permissions cho User
- Tách biệt hoàn toàn khỏi User module để tái sử dụng và quản lý độc lập
- Chỉ áp dụng cho User (admin/staff), không áp dụng cho Customer

**Entities:**
- `Role` (Domain Entity - Aggregate Root)
  - `id`: RoleId (Value Object)
  - `code`: Mã role (unique): super_admin, owner, manager, staff, hoặc role tùy chỉnh
  - `displayName`: Tên hiển thị
  - `isSuperAdmin`: Boolean flag để đánh dấu role mặc định (super_admin role)
  - `permissions`: Danh sách Permission value objects (many-to-many relationship)
  - `createdAt`, `updatedAt`
  - Methods:
    - `create()`: Tạo role mới
    - `rehydrate()`: Load từ database
    - `updateDisplayName()`: Cập nhật tên hiển thị
    - `assignPermissions()`: Gán permissions cho role
    - `removePermissions()`: Xóa permissions khỏi role
    - `canDelete()`: Check xem có thể xóa không (super_admin không thể xóa)

- `Permission` (Value Object - Catalog)
  - `value`: String theo format `module:action` (ví dụ: user:manage, booking:read)
  - Methods: `create()`, `getValue()`
  - Validation: Phải theo format `module:action`
  - Permissions được seed sẵn vào database, không có CRUD

**Value Objects:**
- `RoleId`: Value object cho Role ID (UUID validation)
- `Permission`: Value object đại diện cho permission (catalog)

**ORM Entities:**
- `RoleOrmEntity` (ORM Entity)
  - `id`: UUID
  - `code`: Mã role (unique)
  - `display_name`: Tên hiển thị
  - `is_super_admin`: Boolean flag
  - `permissions`: Many-to-many relationship với PermissionOrmEntity
  - `created_at`, `updated_at`

- `PermissionOrmEntity` (ORM Entity)
  - `id`: UUID
  - `code`: Mã permission (unique)
  - `description`: Mô tả quyền
  - `roles`: Many-to-many relationship với RoleOrmEntity (inverse side)
  - `created_at`, `updated_at`

**Business Rules:**
- **Role Management:**
  - Role là Domain Entity với CRUD operations
  - Role có field `is_super_admin` để đánh dấu role mặc định
  - Super Admin role (`is_super_admin = true`) không thể xóa
  - Các role khác có thể tạo mới, sửa, xóa (chỉ Super Admin)
  - Role có relationship many-to-many với Permission
  - Khi tạo role mới, có thể gán permissions sau (không bắt buộc khi tạo)
- **Permission Management:**
  - Permission là Value Object (catalog)
  - Permissions được seed sẵn vào database
  - Không có CRUD cho Permission (chỉ là catalog)
  - Permission format: `module:action` (ví dụ: `user:manage`, `booking:read`)
- **User-Role-Permission Relationship:**
  - User có thể có nhiều roles
  - User có thể có permissions trực tiếp (ngoài permissions từ roles)
  - Permissions từ roles được merge với permissions trực tiếp khi check quyền
  - Permissions được check real-time từ database (không cần đăng nhập lại)
- **Super Admin:**
  - Role `super_admin` có `is_super_admin = true`
  - Tự động có full permissions (bypass permission check)
  - Không thể xóa
- **Wildcard permissions:**
  - `*:manage`: Full access to all modules
  - `module:*`: Full access to all actions in a module
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
  - Wildcard: `*:manage` (full access)
- Chỉ Super Admin mới có thể gán roles và permissions cho User
- Chỉ Super Admin mới có thể tạo/sửa/xóa roles
- User phải có ít nhất 1 role
- Permissions chỉ áp dụng cho User (admin/staff), không áp dụng cho Customer

**Repositories:**
- `RoleRepository`: Quản lý Role Domain Entities
  - `findAll()`: Lấy tất cả roles với permissions
  - `findById()`: Tìm role theo ID
  - `findByCode()`: Tìm role theo code
  - `save()`: Lưu role entity
  - `delete()`: Xóa role (với check super_admin)
- `PermissionRepository`: Quản lý Permission catalog (Value Objects)

**Domain Services:**
- `RoleAssignmentService`: Gán roles cho User
- `PermissionAssignmentService`: Gán permissions cho User
- `RolePermissionValidationService`: Validate roles và permissions

**Ports (Application Interfaces):**
- `IRoleAssignmentPort`: Port để User module gán roles
- `IPermissionAssignmentPort`: Port để User module gán permissions
- `IRolePermissionValidationPort`: Port để User module validate roles/permissions

**Commands:**
- `CreateRoleCommand`: Tạo role mới
- `UpdateRoleCommand`: Cập nhật role
- `DeleteRoleCommand`: Xóa role (với check super_admin)
- `AssignPermissionsToRoleCommand`: Gán permissions cho role
- `AssignRolesToUserCommand`: Gán roles cho User
- `AssignPermissionsToUserCommand`: Gán permissions cho User

**Queries:**
- `GetRoleQuery`: Lấy role theo ID
- `ListRolesQuery`: Lấy danh sách tất cả roles
- `ListPermissionsQuery`: Lấy danh sách tất cả permissions

**Guards và Decorators:**
- `RolesGuard`: Kiểm tra roles (chỉ cho User, không cho Customer)
- `PermissionsGuard`: Kiểm tra permissions với logic real-time:
  - Load roles và permissions từ database khi check (real-time)
  - Merge permissions từ roles và permissions trực tiếp của user
  - Super Admin tự động có full permissions (check `is_super_admin` flag)
  - Hỗ trợ wildcard `*:manage` và `module:*`
  - Chỉ áp dụng cho User, không áp dụng cho Customer
- `@Roles()` decorator: Định nghĩa roles yêu cầu (optional, backward compatibility)
- `@Permissions()` decorator: Định nghĩa permissions yêu cầu (chính, quyền động từ database)

**Dependencies:**
- Phụ thuộc vào User module để:
  - Inject `USER_ROLE_PERMISSION_PORT` để cập nhật roles/permissions cho User
  - Truy cập User aggregate để cập nhật roles/permissions
- User module phụ thuộc vào RBAC module để:
  - Validate roles và permissions khi tạo/cập nhật User
  - Load permissions từ roles khi check quyền

**Lưu ý:**
- **Role là Domain Entity** với CRUD operations, không phải Value Object
- **Permission là Value Object** (catalog được seed sẵn), không có CRUD
- Role có relationship many-to-many với Permission
- User có roles và permissions độc lập (user có thể có permissions ngoài permissions của role)
- Permissions được check real-time từ database (không cần đăng nhập lại khi gán permissions mới cho role)
- Guards và decorators nằm trong `common/guards` và `common/decorators`, không nằm trong RBAC module
- `PermissionsGuard` inject `ROLE_REPOSITORY` để load permissions từ roles real-time

---

## 3. Quan hệ giữa các Aggregate

### 3.1. Sơ đồ quan hệ

```
RBAC (Authorization Context)
  ├──> Role (Domain Entity - Aggregate Root)
  │     ├──> Permissions (many-to-many relationship)
  │     └──> is_super_admin (flag)
  └──> Permission (Value Object - Catalog)
        └──> User (Aggregate Root) [via assignment]

User (Aggregate Root)
  ├──> Roles (many-to-many relationship với Role)
  ├──> Permissions (many-to-many relationship với Permission, độc lập với roles)
  └──> Accommodation (Aggregate Root)
        ├──> Floor (Entity) [Hotel only, optional]
        ├──> Room/RoomType (Aggregate Root)
        │     └──> Pricing (Aggregate Root)
        └──> Service (Aggregate Root) [Hotel only]

Customer (Aggregate Root)
  ├──> Booking (Aggregate Root)
  │     ├──> Payment (Aggregate Root)
  │     ├──> Review (Aggregate Root)
  │     ├──> ServiceBooking (Entity trong Service Aggregate - attached)
  │     └──> Invoice (Aggregate Root) [Hotel only]
  └──> ServiceBooking (Entity trong Service Aggregate - standalone)
        └──> Payment (Aggregate Root)

Booking (Aggregate Root)
  └──> Revenue (Aggregate Root)

Promotion (Aggregate Root)
  └──> Booking (Aggregate Root) [via discount]
```

### 3.2. Quy tắc tham chiếu giữa Aggregates

- **Chỉ tham chiếu qua ID:** Aggregates chỉ tham chiếu đến nhau qua ID, không tham chiếu trực tiếp đến object
- **Tính nhất quán cuối cùng:** Thay đổi trong một aggregate không ảnh hưởng ngay lập tức đến aggregate khác
- **Domain Events:** Sử dụng Domain Events để đồng bộ giữa các aggregates
- **Transaction Boundary:** Mỗi aggregate là một transaction boundary

### 3.3. Các Domain Events quan trọng

**Booking Events:**
- `BookingCreated` → Trigger: Tạo Payment, giữ phòng
- `BookingConfirmed` → Trigger: Cập nhật Room availability, tạo Revenue
- `BookingCancelled` → Trigger: Hoàn phòng, refund, hủy Revenue
- `BookingCheckedOut` → Trigger: Tạo Invoice, cho phép Review, thanh toán Revenue

**Payment Events:**
- `PaymentSucceeded` → Trigger: Confirm Booking (room) hoặc Confirm ServiceBooking
- `PaymentRefunded` → Trigger: Cancel Booking, hủy Revenue (cho room booking) hoặc Cancel ServiceBooking (cho service booking)

**Service Booking Events:**
- `ServiceBookingCreated` → Trigger: Tạo Payment (cho standalone)
- `ServiceBookingConfirmed` → Trigger: Cập nhật Service availability
- `ServiceBookingCancelled` → Trigger: Hoàn slot, refund (nếu đã thanh toán)

**Room Events:**
- `RoomBooked` → Trigger: Cập nhật availability
- `RoomReleased` → Trigger: Cập nhật availability sau check-out

---

## 4. Tóm tắt các Aggregate Root

| # | Aggregate Root | Mô tả | Bounded Context |
|---|----------------|-------|----------------|
| 1 | User | Quản lý tài khoản quản lý | User Management |
| 2 | Customer | Quản lý khách hàng | Customer Management |
| 3 | Accommodation | Quản lý homestay/hotel (bao gồm Floor Entity) | Accommodation Management |
| 4 | Room/RoomType | Quản lý phòng | Room Management |
| 5 | Pricing | Quản lý giá cả | Pricing Management |
| 6 | Booking | Quản lý đặt phòng | Booking Management |
| 7 | Payment | Quản lý thanh toán | Payment Management |
| 8 | Review | Quản lý đánh giá | Review Management |
| 9 | Promotion | Quản lý khuyến mãi | Promotion Management |
| 10 | Service | Quản lý dịch vụ (Hotel) | Service Management |
| 11 | Invoice | Quản lý hóa đơn (Hotel) | Invoice Management |
| 12 | Revenue | Quản lý doanh thu | Revenue Management |
| 13 | Message | Quản lý tin nhắn | Communication |
| 14 | RBAC | Quản lý roles (Domain Entity) và permissions (Value Object catalog) | Authorization/RBAC |

**Lưu ý:** 
- Floor không phải Aggregate Root riêng, mà là Entity trong Accommodation Aggregate (chỉ cho Hotel, optional).
- **Role là Domain Entity** với CRUD operations, có relationship many-to-many với Permission
- **Permission là Value Object** (catalog được seed sẵn), không có CRUD
- Role có field `is_super_admin` để đánh dấu role mặc định (super_admin role)
- Super Admin role không thể xóa
- User có roles và permissions độc lập (user có thể có permissions ngoài permissions của role)
- Permissions được check real-time từ database (không cần đăng nhập lại khi gán permissions mới cho role)

---

## 5. Lưu ý thiết kế

### 5.1. Single Responsibility
- Mỗi Aggregate Root có trách nhiệm rõ ràng và độc lập
- Không có aggregate quá lớn, dễ quản lý và maintain

### 5.2. Consistency Boundary
- Mỗi aggregate đảm bảo tính nhất quán trong boundary của nó
- Sử dụng Domain Events để đồng bộ giữa các aggregates

### 5.3. Transaction Management
- Mỗi aggregate là một transaction boundary
- Sử dụng Saga pattern cho các business process phức tạp (ví dụ: Booking → Payment → Revenue)

### 5.4. Performance
- Lazy loading cho các entity con trong aggregate
- Eager loading khi cần thiết
- Cache cho các aggregate thường xuyên truy cập

### 5.5. Scalability
- Có thể scale từng aggregate độc lập
- Sử dụng CQRS pattern nếu cần (tách Read và Write model)

---

**Lưu ý:** Thiết kế này dựa trên nghiệp vụ hiện tại. Trong quá trình phát triển, có thể điều chỉnh hoặc bổ sung các aggregate dựa trên yêu cầu thực tế.

