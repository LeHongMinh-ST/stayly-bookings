/**
 * CustomersController exposes signup and profile endpoints for customers
 */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtCustomerGuard } from '../../../../common/guards/jwt-customer.guard';
import { RegisterCustomerDto } from '../../application/dto/request/register-customer.dto';
import { RegisterCustomerCommand } from '../../application/commands/register-customer.command';
import { CustomerResponseDto } from '../../application/dto/response/customer-response.dto';
import { GetCustomerProfileQuery } from '../../application/queries/get-customer-profile.query';

@ApiTags('customers')
@Controller('v1/customers')
export class CustomersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Registers a new customer account
   */
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiBody({ type: RegisterCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully registered',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async register(@Body() dto: RegisterCustomerDto): Promise<CustomerResponseDto> {
    const command = new RegisterCustomerCommand(
      dto.email,
      dto.password,
      dto.fullName,
      dto.phone,
    );
    return this.commandBus.execute(command);
  }

  /**
   * Returns profile for the currently authenticated customer
   */
  @Get('me')
  @UseGuards(JwtCustomerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns customer profile',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser('id') customerId: string): Promise<CustomerResponseDto> {
    return this.queryBus.execute(new GetCustomerProfileQuery(customerId));
  }
}
