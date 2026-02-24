import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@vritti/api-sdk';
import { UserDto } from '../dto/entity/user.dto';
import { CreateUserWebhookDto } from '../dto/request/create-user-webhook.dto';
import { ApiCreateUserWebhook } from '../docs/user.docs';
import { UserService } from '../services/user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // Receives user creation from cloud-server via webhook and upserts in nexus
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateUserWebhook()
  async createFromWebhook(@Body() dto: CreateUserWebhookDto): Promise<UserDto> {
    this.logger.log('POST /api/users/webhook');
    return this.userService.createFromWebhook(dto);
  }
}
