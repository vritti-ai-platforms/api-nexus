import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dto/entity/user.dto';
import { CreateUserWebhookDto } from '../dto/request/create-user-webhook.dto';

export function ApiCreateUserWebhook() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create or update user from webhook',
      description:
        'Receives a user creation event from cloud-server and upserts the user in the nexus database. Idempotent — safe to call multiple times for the same externalId.',
    }),
    ApiBody({ type: CreateUserWebhookDto }),
    ApiResponse({ status: 201, description: 'User created or updated successfully.', type: UserDto }),
    ApiResponse({ status: 400, description: 'Invalid input data or validation error.' }),
  );
}
