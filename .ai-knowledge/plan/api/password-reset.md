## Password Reset Flow (User & Customer)

### 1. Request phase (`POST /v1/auth/{user|customers}/password/forgot`)
1. Controller nhận email + metadata (IP, UA) → `RequestPasswordResetCommand`.
2. Handler:
   - Tra cứu account theo `subjectType`.
   - Nếu hợp lệ → revoke request cũ (pending/otp_verified), sinh OTP + token, hash SHA-256, lưu `password_reset_requests`.
   - Emit notification adapter với payload { email, otp, token, requestId, expiresAt } để gửi email.
   - Trả `PasswordResetRequestResponseDto`.
3. Nếu email không hợp lệ → bỏ qua persistence/notification nhưng vẫn trả `202`.

### 2. OTP phase (`POST password/verify-otp`)
1. Controller nhận `{ requestId, otp }`.
2. Handler:
   - Load request bằng `requestId`, cross-check `subjectType`.
   - Hash OTP và so sánh.
   - Sai → `registerFailedOtpAttempt`, lưu `attempt_count`, revoke khi >=5.
   - Đúng → `markOtpVerified` → lưu `verified_at`, trạng thái `otp_verified`.

### 3. Completion (`POST password/reset`)
1. Controller nhận `{ requestId, token, newPassword }`.
2. Handler:
   - Hash token và tìm request (unique index), xác thực `requestId`, `subjectType`, `status = otp_verified`, token chưa hết hạn.
   - Hash mật khẩu mới qua `PASSWORD_HASHER`, gọi adapter User/Customer để cập nhật.
   - `markCompleted` request, revoke mọi refresh session của tài khoản để buộc đăng nhập lại.
   - Request cũ giữ lại cho audit (`completed_at`).

### 4. Persistence rules
- Table `auth_password_reset_requests` lưu:
  - `subject_id`, `subject_type`, `token_hash`, `otp_hash`, `status`, `attempt_count`, `max_attempts`, `expires_at`, `otp_expires_at`, `verified_at`, `completed_at`, `revoked_at`, `requested_ip`, `requested_user_agent`, `last_attempt_at`.
- Unique index `token_hash`, composite index `(subject_id, subject_type, status)` để revoke nhanh.
- Migration `1700000000006-create-password-reset-requests-table.ts`.

### 5. Configuration defaults
- `auth.passwordReset.tokenTtlMinutes` default 60.
- `auth.passwordReset.otpTtlMinutes` default 10.
- `auth.passwordReset.maxOtpAttempts` default 5.
- `auth.passwordReset.baseUrl` dùng để render link trong email (fallback `https://app.stayly.io/reset-password`).

