# Development Conventions - Git Commit & Pull Request

## 1. Tổng quan

Tài liệu này định nghĩa các conventions cho Git commits và Pull Requests, đảm bảo lịch sử commit rõ ràng, dễ theo dõi và quá trình code review hiệu quả.

**Nguyên tắc:**
- **Conventional Commits:** Tuân thủ [Conventional Commits Specification](https://www.conventionalcommits.org)
- **Clarity:** Commit messages rõ ràng, dễ hiểu
- **Consistency:** Nhất quán trong toàn bộ dự án
- **Traceability:** Dễ dàng trace changes và issues

---

## 2. Git Commit Conventions

### 2.1. Commit Message Format

**Cấu trúc:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Quy tắc:**
- **Type:** Bắt buộc, lowercase
- **Scope:** Optional, lowercase, mô tả phạm vi thay đổi
- **Description:** Bắt buộc, viết ở thể mệnh lệnh (imperative mood), không có dấu chấm cuối
- **Body:** Optional, giải thích chi tiết "what" và "why"
- **Footer:** Optional, breaking changes, issue references

### 2.2. Commit Types

**Standard Types:**

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | Thêm tính năng mới | `feat(booking): add booking cancellation feature` |
| `fix` | Sửa lỗi | `fix(payment): resolve payment gateway timeout` |
| `docs` | Thay đổi tài liệu | `docs(api): update API documentation` |
| `style` | Thay đổi format, không ảnh hưởng logic | `style: format code with prettier` |
| `refactor` | Tái cấu trúc code, không thêm feature hay fix bug | `refactor(booking): extract booking validation logic` |
| `perf` | Cải thiện performance | `perf(api): optimize database queries` |
| `test` | Thêm hoặc sửa tests | `test(booking): add unit tests for booking creation` |
| `chore` | Cập nhật build tools, dependencies, config | `chore: update dependencies` |
| `ci` | Thay đổi CI/CD configuration | `ci: add GitHub Actions workflow` |
| `build` | Thay đổi build system | `build: update webpack configuration` |
| `revert` | Revert một commit trước đó | `revert: revert "feat(booking): add cancellation"` |

**Breaking Changes:**
- Thêm `!` sau type/scope để đánh dấu breaking change
- Hoặc thêm `BREAKING CHANGE:` trong footer

**Examples:**
```
feat!(api): change authentication endpoint structure

BREAKING CHANGE: Authentication endpoint now requires different request format
```

### 2.3. Scope Conventions

**Backend Scopes:**
- `auth` - Authentication & Authorization
- `booking` - Booking management
- `payment` - Payment processing
- `accommodation` - Accommodation management
- `room` - Room management
- `service` - Service management (Hotel)
- `user` - User management
- `customer` - Customer management
- `review` - Review management
- `promotion` - Promotion management
- `pricing` - Pricing management
- `revenue` - Revenue management
- `invoice` - Invoice management (Hotel)
- `api` - API changes
- `database` - Database migrations
- `kafka` - Kafka integration
- `common` - Common/shared code

**Frontend Scopes:**
- `admin` - Admin Panel
- `customer` - Customer Frontend
- `ui` - UI components
- `api` - API client
- `auth` - Authentication
- `booking` - Booking features
- `search` - Search functionality
- `payment` - Payment integration
- `layout` - Layout components
- `hooks` - Custom hooks
- `store` - State management
- `config` - Configuration

**Examples:**
```
feat(booking): add booking cancellation feature
fix(payment): handle payment gateway timeout
refactor(admin): restructure admin dashboard components
docs(api): update authentication API documentation
```

### 2.4. Description Conventions

**Quy tắc:**
- Viết ở **thể mệnh lệnh** (imperative mood)
- Bắt đầu với chữ thường (trừ khi bắt đầu bằng tên riêng)
- Không có dấu chấm cuối
- Tối đa 72 ký tự
- Mô tả ngắn gọn, rõ ràng về thay đổi

**Examples:**
```
✅ CORRECT:
feat(booking): add booking cancellation feature
fix(payment): resolve payment gateway timeout
docs(api): update authentication endpoints

❌ WRONG:
feat(booking): Added booking cancellation feature.
fix(payment): Fixed payment gateway timeout issue
docs(api): Updates authentication endpoints documentation
```

### 2.5. Body Conventions

**Khi nào cần body:**
- Commit phức tạp cần giải thích thêm
- Breaking changes
- Multiple changes trong một commit

**Format:**
- Tách biệt với description bằng dòng trống
- Giải thích "what" và "why", không phải "how"
- Wrap text ở 72 ký tự
- Sử dụng bullet points nếu cần

**Examples:**
```
feat(booking): add booking cancellation feature

Add ability for customers to cancel their bookings based on
cancellation policy. This includes:
- Check cancellation policy rules
- Calculate refund amount
- Update booking status
- Send cancellation confirmation email

Closes #123
```

### 2.6. Footer Conventions

**Breaking Changes:**
```
feat(api)!: change authentication endpoint

BREAKING CHANGE: Authentication endpoint now requires JWT token
in Authorization header instead of query parameter.
```

**Issue References:**
```
fix(payment): resolve payment gateway timeout

Fixes #456
Closes #789
Refs #101
```

**Co-authors:**
```
feat(booking): add booking calendar

Co-authored-by: John Doe <john@example.com>
```

### 2.7. Commit Examples

**Simple Feature:**
```
feat(booking): add booking cancellation feature
```

**Feature with Body:**
```
feat(booking): add booking cancellation feature

Add ability for customers to cancel bookings based on
cancellation policy. Includes refund calculation and
email notification.

Closes #123
```

**Bug Fix:**
```
fix(payment): resolve payment gateway timeout

Increase timeout duration and add retry mechanism for
payment gateway requests.

Fixes #456
```

**Breaking Change:**
```
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: Authentication endpoint now requires different
request format. Old format is no longer supported.

Migration guide: https://docs.example.com/migration
```

**Refactoring:**
```
refactor(booking): extract booking validation logic

Move booking validation logic to separate service for
better testability and reusability.
```

**Documentation:**
```
docs(api): update authentication API documentation

Add examples for new authentication endpoints and update
error response formats.
```

**Multiple Changes:**
```
feat(booking): add booking cancellation and refund

- Add booking cancellation feature
- Implement refund calculation based on policy
- Add cancellation confirmation email
- Update booking status workflow

Closes #123, #124
```

---

## 3. Branch Naming Conventions

### 3.1. Branch Types

**Format:**
```
{type}/{description}
```

**Types:**
- `feature/` - New features
- `bugfix/` hoặc `fix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/changes
- `chore/` - Build/tool changes

### 3.2. Branch Naming Rules

**Quy tắc:**
- Lowercase
- Kebab-case (dash-separated)
- Descriptive và ngắn gọn
- Include scope nếu cần

**Examples:**
```
✅ CORRECT:
feature/booking-cancellation
bugfix/payment-gateway-timeout
hotfix/security-vulnerability
refactor/booking-validation
docs/api-authentication
test/booking-unit-tests

❌ WRONG:
Feature/BookingCancellation
bugfix/paymentGatewayTimeout
hotfix/security_vulnerability
```

### 3.3. Branch Examples

**Feature Branches:**
```
feature/booking-cancellation
feature/admin-dashboard-stats
feature/customer-search-filters
feature/hotel-service-booking
```

**Bug Fix Branches:**
```
bugfix/payment-gateway-timeout
bugfix/booking-calendar-display
bugfix/admin-sidebar-navigation
```

**Hotfix Branches:**
```
hotfix/security-vulnerability
hotfix/payment-processing-error
hotfix/critical-booking-bug
```

**Refactoring Branches:**
```
refactor/booking-validation-logic
refactor/api-client-structure
refactor/admin-components
```

---

## 4. Pull Request Conventions

### 4.1. PR Title Conventions

**Format:**
- Tuân theo commit message format
- Type và scope (nếu có)
- Description ngắn gọn

**Examples:**
```
feat(booking): add booking cancellation feature
fix(payment): resolve payment gateway timeout
refactor(admin): restructure dashboard components
docs(api): update authentication documentation
```

### 4.2. PR Description Template

**Template:**
```markdown
## 📋 Mô tả

<!-- Mô tả ngắn gọn về thay đổi trong PR này -->

## 🎯 Loại thay đổi

<!-- Chọn loại thay đổi (có thể chọn nhiều): -->
- [ ] ✨ Tính năng mới (non-breaking change)
- [ ] 🐛 Sửa lỗi (non-breaking change)
- [ ] 💥 Thay đổi phá vỡ (breaking change)
- [ ] 📝 Cập nhật tài liệu
- [ ] 🎨 Thay đổi UI/styling
- [ ] ♻️ Refactoring code
- [ ] ⚡️ Cải thiện performance
- [ ] ✅ Thêm/sửa tests
- [ ] 🔧 Công việc phụ trợ (chore)
- [ ] 🔒 Security fix

## 🔍 Thay đổi chi tiết

<!-- Mô tả chi tiết về các thay đổi: -->
- 
- 
- 

## 🧪 Đã kiểm tra

<!-- Mô tả các bước kiểm tra đã thực hiện: -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated
- [ ] No breaking changes (hoặc đã document breaking changes)

**Test scenarios:**
- 
- 
- 

## 📸 Screenshots (nếu có)

<!-- Thêm screenshots cho UI changes -->

## 🔗 Liên kết

<!-- Liên kết đến issues, documents, etc. -->
- Closes #<!-- issue number -->
- Related to #<!-- issue number -->
- Fixes #<!-- issue number -->

## 📝 Checklist

<!-- Checklist trước khi merge: -->
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No security vulnerabilities
- [ ] Performance tested (nếu cần)
- [ ] Accessibility checked (nếu UI changes)

## 🔄 Breaking Changes

<!-- Nếu có breaking changes, mô tả chi tiết: -->
- 
- 

**Migration guide:**
<!-- Hướng dẫn migration nếu có -->

## 📚 Ghi chú bổ sung

<!-- Thêm bất kỳ thông tin bổ sung nào nếu cần -->
```

### 4.3. PR Description Best Practices

**Mô tả rõ ràng:**
- Giải thích "what", "why", và "how"
- Include context và background
- Link to related issues
- Include screenshots cho UI changes

**Checklist:**
- Đảm bảo tất cả items trong checklist được check
- Self-review trước khi request review
- Update documentation nếu cần

**Breaking Changes:**
- Luôn document breaking changes
- Provide migration guide
- Update version number nếu cần

### 4.4. PR Review Guidelines

**For Authors:**
- Self-review trước khi request review
- Respond to review comments promptly
- Update PR description nếu có thay đổi
- Keep PR focused và small (nếu có thể)

**For Reviewers:**
- Review within 24-48 hours
- Provide constructive feedback
- Approve nếu code meets standards
- Request changes với clear explanation

**Review Checklist:**
- [ ] Code follows conventions
- [ ] Logic is correct
- [ ] Tests are adequate
- [ ] Performance is acceptable
- [ ] Security is considered
- [ ] Documentation is updated
- [ ] No breaking changes (hoặc properly documented)

---

## 5. Commit Workflow

### 5.1. Commit Frequency

**Best Practices:**
- Commit often, push regularly
- One logical change per commit
- Don't commit broken code
- Don't commit commented-out code
- Don't commit large binary files

### 5.2. Commit Size

**Guidelines:**
- Small, focused commits
- One feature/fix per commit
- Easy to review và revert
- Clear commit message

**Examples:**
```
✅ GOOD: Small, focused commits
feat(booking): add booking cancellation API endpoint
feat(booking): add cancellation policy validation
feat(booking): add refund calculation logic
test(booking): add cancellation unit tests

❌ BAD: Large, unfocused commit
feat(booking): add booking cancellation feature with API, validation, refund calculation, and tests
```

### 5.3. Commit History

**Best Practices:**
- Keep commit history clean
- Use interactive rebase để squash commits nếu cần
- Don't rewrite public history
- Write meaningful commit messages

### 5.4. Commit Message Examples by Scenario

**New Feature:**
```
feat(booking): add booking cancellation feature

Allow customers to cancel bookings based on cancellation
policy. Includes refund calculation and email notification.

Closes #123
```

**Bug Fix:**
```
fix(payment): resolve payment gateway timeout

Increase timeout duration from 5s to 30s and add retry
mechanism with exponential backoff.

Fixes #456
```

**Refactoring:**
```
refactor(booking): extract booking validation to service

Move booking validation logic from controller to
BookingValidationService for better testability.

No functional changes.
```

**Performance:**
```
perf(api): optimize accommodation search query

Add database indexes and optimize query to reduce
response time from 2s to 200ms.

Closes #789
```

**Documentation:**
```
docs(api): update authentication API documentation

Add examples for new JWT authentication endpoints and
update error response formats.
```

**Breaking Change:**
```
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: Authentication endpoint now requires
JWT token in Authorization header instead of query
parameter. Old format is no longer supported.

Migration guide: https://docs.example.com/migration/v2
```

---

## 6. Git Hooks & Automation

### 6.1. Pre-commit Hooks

**Recommended Checks:**
- Lint code (ESLint)
- Format code (Prettier)
- Run tests (nếu nhanh)
- Check commit message format
- Prevent committing secrets

### 6.2. Commit-msg Hook

**Validation:**
- Check commit message format
- Enforce conventional commits
- Reject invalid formats

### 6.3. Pre-push Hooks

**Recommended Checks:**
- Run full test suite
- Check for TypeScript errors
- Verify no secrets in code
- Check branch naming

---

## 7. Commit Message Validation

### 7.1. Validation Rules

**Format Validation:**
- Type is required và valid
- Description is required
- Description starts with lowercase (trừ tên riêng)
- Description doesn't end with period
- Description is max 72 characters
- Body lines are max 72 characters

### 7.2. Validation Tools

**Recommended:**
- `commitlint` - Validate commit messages
- `husky` - Git hooks
- `commitizen` - Interactive commit helper

**Configuration Example:**
```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci",
        "build",
        "revert"
      ]
    ],
    "scope-enum": [
      2,
      "always",
      [
        "auth",
        "booking",
        "payment",
        "accommodation",
        "room",
        "service",
        "user",
        "customer",
        "admin",
        "api",
        "ui"
      ]
    ]
  }
}
```

---

## 8. PR Template Files

### 8.1. GitHub PR Template

**File:** `.github/pull_request_template.md`

```markdown
## 📋 Mô tả

<!-- Mô tả ngắn gọn về thay đổi trong PR này -->

## 🎯 Loại thay đổi

- [ ] ✨ Tính năng mới (non-breaking change)
- [ ] 🐛 Sửa lỗi (non-breaking change)
- [ ] 💥 Thay đổi phá vỡ (breaking change)
- [ ] 📝 Cập nhật tài liệu
- [ ] 🎨 Thay đổi UI/styling
- [ ] ♻️ Refactoring code
- [ ] ⚡️ Cải thiện performance
- [ ] ✅ Thêm/sửa tests
- [ ] 🔧 Công việc phụ trợ (chore)
- [ ] 🔒 Security fix

## 🔍 Thay đổi chi tiết

<!-- Mô tả chi tiết về các thay đổi -->

## 🧪 Đã kiểm tra

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated
- [ ] No breaking changes (hoặc đã document breaking changes)

**Test scenarios:**
<!-- Mô tả các test scenarios đã thực hiện -->

## 📸 Screenshots (nếu có)

<!-- Thêm screenshots cho UI changes -->

## 🔗 Liên kết

- Closes #<!-- issue number -->
- Related to #<!-- issue number -->
- Fixes #<!-- issue number -->

## 📝 Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No security vulnerabilities
- [ ] Performance tested (nếu cần)
- [ ] Accessibility checked (nếu UI changes)

## 🔄 Breaking Changes

<!-- Nếu có breaking changes, mô tả chi tiết -->

**Migration guide:**
<!-- Hướng dẫn migration nếu có -->

## 📚 Ghi chú bổ sung

<!-- Thêm bất kỳ thông tin bổ sung nào nếu cần -->
```

### 8.2. GitLab Merge Request Template

**File:** `.gitlab/merge_request_templates/default.md`

```markdown
## 📋 Mô tả

<!-- Mô tả ngắn gọn về thay đổi trong MR này -->

## 🎯 Loại thay đổi

- [ ] ✨ Tính năng mới
- [ ] 🐛 Sửa lỗi
- [ ] 💥 Breaking change
- [ ] 📝 Documentation
- [ ] 🎨 UI/Styling
- [ ] ♻️ Refactoring
- [ ] ⚡️ Performance
- [ ] ✅ Tests
- [ ] 🔧 Chore

## 🔍 Thay đổi chi tiết

<!-- Mô tả chi tiết -->

## 🧪 Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 🔗 Related Issues

- Closes #<!-- issue number -->
- Related to #<!-- issue number -->

## 📝 Checklist

- [ ] Code follows conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 9. Best Practices Summary

### 9.1. Commit Best Practices

1. **Write clear, descriptive commit messages**
2. **One logical change per commit**
3. **Use conventional commits format**
4. **Include scope when relevant**
5. **Document breaking changes**
6. **Link to related issues**
7. **Keep commits small và focused**

### 9.2. PR Best Practices

1. **Write clear PR description**
2. **Include all relevant information**
3. **Add screenshots for UI changes**
4. **Complete checklist before requesting review**
5. **Respond to review comments promptly**
6. **Keep PR focused và small**
7. **Update documentation if needed**

### 9.3. Review Best Practices

1. **Review within 24-48 hours**
2. **Provide constructive feedback**
3. **Check code quality và conventions**
4. **Verify tests are adequate**
5. **Consider performance và security**
6. **Approve when standards are met**

---

## 10. Tools & Resources

### 10.1. Recommended Tools

**Commit Message:**
- `commitlint` - Validate commit messages
- `commitizen` - Interactive commit helper
- `conventional-changelog` - Generate changelog

**Git Hooks:**
- `husky` - Git hooks made easy
- `lint-staged` - Run linters on staged files

**PR Tools:**
- GitHub PR templates
- GitLab MR templates
- Code review tools

### 10.2. Resources

- [Conventional Commits](https://www.conventionalcommits.org)
- [Semantic Versioning](https://semver.org)
- [Keep a Changelog](https://keepachangelog.com)

---

## 11. Examples

### 11.1. Complete Commit Examples

**Feature with Breaking Change:**
```
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: Authentication endpoint now requires JWT token
in Authorization header instead of query parameter.

Old format:
GET /api/v1/auth/verify?token=xxx

New format:
GET /api/v1/auth/verify
Headers: Authorization: Bearer xxx

Migration guide: https://docs.example.com/migration/v2

Closes #123
```

**Bug Fix with Multiple Changes:**
```
fix(payment): resolve payment gateway timeout and retry logic

- Increase timeout duration from 5s to 30s
- Add retry mechanism with exponential backoff
- Improve error handling and logging
- Add timeout configuration to environment variables

Fixes #456
```

**Refactoring:**
```
refactor(booking): extract booking validation to service

Move booking validation logic from BookingController to
BookingValidationService for better:
- Testability: Easier to unit test validation logic
- Reusability: Can be used in other contexts
- Maintainability: Separation of concerns

No functional changes.
```

### 11.2. Complete PR Examples

**Feature PR:**
```markdown
## 📋 Mô tả

Thêm tính năng hủy booking cho khách hàng với tính toán refund
dựa trên cancellation policy.

## 🎯 Loại thay đổi

- [x] ✨ Tính năng mới (non-breaking change)

## 🔍 Thay đổi chi tiết

- Thêm API endpoint POST /api/v1/bookings/:id/cancel
- Implement cancellation policy validation
- Tính toán refund amount dựa trên policy
- Gửi email xác nhận hủy booking
- Update booking status workflow

## 🧪 Đã kiểm tra

- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing completed
- [x] Code review completed
- [x] Documentation updated

**Test scenarios:**
- Cancel booking within free cancellation period
- Cancel booking after free cancellation period
- Cancel booking with non-refundable policy
- Cancel already completed booking (should fail)

## 🔗 Liên kết

- Closes #123

## 📝 Checklist

- [x] Code follows project conventions
- [x] Self-review completed
- [x] Comments added for complex logic
- [x] Documentation updated
- [x] No console.logs or debug code
- [x] Tests added/updated
- [x] All tests passing
- [x] No TypeScript errors
- [x] No ESLint warnings
```

---

**Lưu ý:** Các conventions này sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới. Tất cả team members phải tuân thủ các conventions này để đảm bảo tính nhất quán trong dự án.

