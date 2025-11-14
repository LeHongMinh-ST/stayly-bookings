/**
 * DefaultCustomersSeedService provides seeding logic for sample customer
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import type { ICustomerRepository } from "../../../domain/repositories/customer.repository.interface";
import { CUSTOMER_REPOSITORY } from "../../../domain/repositories/customer.repository.interface";
import type { PasswordHasher } from "../../../../../common/application/interfaces/password-hasher.interface";
import { PASSWORD_HASHER } from "../../../../../common/application/interfaces/password-hasher.interface";
import { Email } from "../../../../../common/domain/value-objects/email.vo";
import { PasswordHash } from "../../../../../common/domain/value-objects/password-hash.vo";
import { Customer } from "../../../domain/entities/customer.entity";
import { CustomerId } from "../../../domain/value-objects/customer-id.vo";

@Injectable()
export class DefaultCustomersSeedService {
  private readonly logger = new Logger(DefaultCustomersSeedService.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Seeds sample customer account if not exists
   */
  async seed(): Promise<void> {
    const email =
      this.configService.get<string>("seeds.sampleCustomerEmail") ??
      "customer@stayly.dev";
    const password =
      this.configService.get<string>("seeds.sampleCustomerPassword") ??
      "Customer123!";
    const fullName =
      this.configService.get<string>("seeds.sampleCustomerName") ??
      "Sample Customer";
    const phone =
      this.configService.get<string>("seeds.sampleCustomerPhone") ??
      "+84000000000";

    const emailVo = Email.create(email);
    const existing = await this.customerRepository.findByEmail(emailVo);
    if (existing) {
      this.logger.log(`Sample customer already exists (${email})`);
      return;
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const customer = Customer.register({
      id: CustomerId.create(randomUUID()),
      email: emailVo,
      fullName,
      passwordHash: PasswordHash.create(hashedPassword),
      phone,
    });

    await this.customerRepository.save(customer);
    this.logger.log(
      `Seeded sample customer account (${email}). Password should be rotated in production.`,
    );
  }
}
