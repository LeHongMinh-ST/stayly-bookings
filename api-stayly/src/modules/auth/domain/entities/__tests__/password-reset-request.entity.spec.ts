import { PasswordResetRequest } from "../password-reset-request.entity";
import { PasswordResetRequestId } from "../../value-objects/password-reset-request-id.vo";

const buildRequest = () =>
  PasswordResetRequest.create({
    id: PasswordResetRequestId.create("aaaaaaaa-1111-4111-b111-111111111111"),
    subjectId: "user-123",
    subjectType: "user",
    tokenHash: "token-hash",
    otpHash: "otp-hash",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    maxAttempts: 3,
    plainToken: "plain-token",
    plainOtp: "123456",
  });

describe("PasswordResetRequest aggregate", () => {
  it("verifies OTP and transitions to otp_verified", () => {
    const request = buildRequest();
    request.markOtpVerified(new Date());
    expect(request.getStatus()).toBe("otp_verified");
    expect(request.getVerifiedAt()).toBeInstanceOf(Date);
  });

  it("revokes request after exceeding max OTP attempts", () => {
    const request = buildRequest();
    request.registerFailedOtpAttempt(new Date());
    request.registerFailedOtpAttempt(new Date());
    request.registerFailedOtpAttempt(new Date());
    expect(request.getStatus()).toBe("revoked");
  });

  it("completes reset after OTP verification", () => {
    const request = buildRequest();
    request.markOtpVerified(new Date());
    request.markCompleted(new Date());
    expect(request.getStatus()).toBe("completed");
    expect(request.getCompletedAt()).toBeInstanceOf(Date);
  });

  it("prevents completion before OTP verification", () => {
    const request = buildRequest();
    expect(() => request.markCompleted(new Date())).toThrow();
  });
});
