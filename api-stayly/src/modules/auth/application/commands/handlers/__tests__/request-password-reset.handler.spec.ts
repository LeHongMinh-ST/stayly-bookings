import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { RequestPasswordResetHandler } from "../request-password-reset.handler";
import { RequestPasswordResetCommand } from "../../request-password-reset.command";
import {
  USER_AUTHENTICATION_SERVICE,
  type IUserAuthenticationService,
} from "../../../interfaces/user-authentication.service.interface";
import {
  CUSTOMER_AUTHENTICATION_SERVICE,
  type ICustomerAuthenticationService,
} from "../../../interfaces/customer-authentication.service.interface";
import {
  PASSWORD_RESET_REQUEST_REPOSITORY,
  type IPasswordResetRequestRepository,
} from "../../../../domain/repositories/password-reset-request.repository.interface";
import { KafkaProducerService } from "../../../../../../common/infrastructure/kafka/kafka.producer.service";
describe("RequestPasswordResetHandler", () => {
  let handler: RequestPasswordResetHandler;
  let userAuthMock: jest.Mocked<IUserAuthenticationService>;
  let customerAuthMock: jest.Mocked<ICustomerAuthenticationService>;
  let repositoryMock: jest.Mocked<IPasswordResetRequestRepository>;
  let eventEmitterMock: jest.Mocked<EventEmitter2>;
  let kafkaProducerMock: jest.Mocked<KafkaProducerService>;
  let emitMock: jest.MockedFunction<EventEmitter2["emit"]>;
  let kafkaPublishMock: jest.MockedFunction<KafkaProducerService["publish"]>;

  const configGetMock = jest.fn();

  beforeEach(async () => {
    userAuthMock = {
      findForAuthentication: jest.fn(),
      updatePasswordHash: jest.fn(),
    };

    customerAuthMock = {
      findForAuthentication: jest.fn(),
      updatePasswordHash: jest.fn(),
    };

    repositoryMock = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findLatestBySubject: jest.fn(),
    };

    emitMock = jest.fn();
    eventEmitterMock = {
      emit: emitMock,
    } as unknown as jest.Mocked<EventEmitter2>;

    kafkaPublishMock = jest.fn();
    kafkaProducerMock = {
      publish: kafkaPublishMock,
      publishBatch: jest.fn(),
      onModuleInit: jest.fn(),
    } as unknown as jest.Mocked<KafkaProducerService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestPasswordResetHandler,
        {
          provide: USER_AUTHENTICATION_SERVICE,
          useValue: userAuthMock,
        },
        {
          provide: CUSTOMER_AUTHENTICATION_SERVICE,
          useValue: customerAuthMock,
        },
        {
          provide: PASSWORD_RESET_REQUEST_REPOSITORY,
          useValue: repositoryMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
        {
          provide: KafkaProducerService,
          useValue: kafkaProducerMock,
        },
        {
          provide: ConfigService,
          useValue: { get: configGetMock.mockReturnValue(undefined) },
        },
      ],
    }).compile();

    handler = module.get(RequestPasswordResetHandler);
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("creates password reset request for admin user", async () => {
    userAuthMock.findForAuthentication.mockResolvedValue({
      id: "user-1",
      email: "admin@stayly.dev",
      passwordHash: "hash",
      isActive: true,
    });

    const response = await handler.execute(
      new RequestPasswordResetCommand(
        "admin@stayly.dev",
        "user",
        "jest-agent",
        "127.0.0.1",
      ),
    );

    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(kafkaPublishMock).toHaveBeenCalledWith(
      "notification.password-reset",
      expect.objectContaining({
        email: "admin@stayly.dev",
        subjectType: "user",
      }),
    );
    expect(emitMock).toHaveBeenCalledWith(
      "notification.password-reset.requested",
      expect.any(Object),
    );
    expect(response.requestId).toEqual(expect.any(String));
  });

  it("skips persistence when account does not exist", async () => {
    userAuthMock.findForAuthentication.mockResolvedValue(null);

    const response = await handler.execute(
      new RequestPasswordResetCommand(
        "ghost@stayly.dev",
        "user",
        "jest-agent",
        "127.0.0.1",
      ),
    );

    expect(repositoryMock.save).not.toHaveBeenCalled();
    expect(kafkaPublishMock).not.toHaveBeenCalled();
    expect(emitMock).not.toHaveBeenCalled();
    expect(response.requestId).toEqual(expect.any(String));
  });

  it("creates reset request for customers", async () => {
    customerAuthMock.findForAuthentication.mockResolvedValue({
      id: "customer-1",
      email: "customer@stayly.dev",
      passwordHash: "hash",
      isActive: true,
    });

    await handler.execute(
      new RequestPasswordResetCommand(
        "customer@stayly.dev",
        "customer",
        null,
        null,
      ),
    );

    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    const savedRequest = repositoryMock.save.mock.calls[0][0];
    expect(savedRequest.getSubjectType()).toBe("customer");
  });
});
