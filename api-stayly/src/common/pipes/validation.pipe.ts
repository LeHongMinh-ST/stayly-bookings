/**
 * Validation Pipe
 * Validates DTOs using class-validator
 */

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type ClassType<T = unknown> = new (...args: unknown[]) => T;

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const instance = plainToInstance(metatype as ClassType, value);
    const errors = await validate(instance as object);

    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .filter(Boolean);
      throw new BadRequestException(messages.join('; '));
    }

    return value;
  }

  private shouldValidate(metatype: ClassType | undefined): boolean {
    if (!metatype) {
      return false;
    }
    const nativeTypes: ClassType[] = [String, Boolean, Number, Array, Object];
    return !nativeTypes.includes(metatype);
  }
}
