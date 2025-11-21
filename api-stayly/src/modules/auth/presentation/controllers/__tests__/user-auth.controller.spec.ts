import type { CommandBus } from "@nestjs/cqrs";
import type { Request } from "express";

import { UserAuthController } from "../auth.controller";
import { ForgotPasswordRequestDto } from "../../../application/dto/request/forgot-password-request.dto";
import { VerifyPasswordResetOtpDto } from "../../../application/dto/request/verify-password-reset-otp.dto";
import { CompletePasswordResetDto } from "../../../application/dto/request/complete-password-reset.dto";
import { PasswordResetRequestResponseDto } from "../../../application/dto/response/password-reset-request-response.dto";
import type { TokenService } from "../../../../../common/application/interfaces/token-service.interface";

describe("UserAuthController password reset endpoints", () => {
  let controller: UserAuthController;
  let executeMock: jest.Mock;
  let commandBus: CommandBus;
  let tokenService: TokenService;

  beforeEach(() => {
    executeMock = jest.fn();
    commandBus = { execute: executeMock } as unknown as CommandBus;
    tokenService = {
      verifyRefreshToken: jest.fn(),
    } as TokenService;
    controller = new UserAuthController(commandBus, tokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches password reset request command", async () => {
    const dto: ForgotPasswordRequestDto = { email: "admin@stayly.dev" };
    const req = {
      headers: { "user-agent": "jest" },
      ip: "127.0.0.1",
    } as Request;
    const mockResponse = new PasswordResetRequestResponseDto(
      "11111111-1111-4111-8111-111111111111",
      new Date(),
      new Date(),
    );
    executeMock.mockResolvedValue(mockResponse);

    const response = await controller.forgotPassword(dto, req);

    expect(executeMock).toHaveBeenCalled();
    expect(response).toBe(mockResponse);
  });

  it("dispatches OTP verification command", async () => {
    const dto: VerifyPasswordResetOtpDto = {
      requestId: "22222222-2222-4222-8222-222222222222",
      otp: "123456",
    };
    executeMock.mockResolvedValue(undefined);

    await controller.verifyPasswordResetOtp(dto);

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: dto.requestId,
        otp: dto.otp,
      }),
    );
  });

  it("dispatches completion command", async () => {
    const dto: CompletePasswordResetDto = {
      requestId: "33333333-3333-4333-8333-333333333333",
      token: "token",
      newPassword: "Secure123!",
    };
    executeMock.mockResolvedValue(undefined);

    await controller.completePasswordReset(dto);

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: dto.requestId,
        token: dto.token,
      }),
    );
  });
});
