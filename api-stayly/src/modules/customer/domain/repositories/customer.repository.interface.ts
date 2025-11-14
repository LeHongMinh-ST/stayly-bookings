/**
 * ICustomerRepository provides persistence contract for customer aggregate
 */
import { Customer } from "../entities/customer.entity";
import { CustomerId } from "../value-objects/customer-id.vo";
import { Email } from "../../../../common/domain/value-objects/email.vo";

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByEmail(email: Email): Promise<Customer | null>;
}

export const CUSTOMER_REPOSITORY = "CUSTOMER_REPOSITORY";
