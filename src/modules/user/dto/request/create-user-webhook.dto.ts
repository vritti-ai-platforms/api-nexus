import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRoleValues } from '@/db/schema';

export class CreateUserWebhookDto {
  @ApiProperty({ description: 'External user ID from cloud-server', example: 'usr_abc123' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: 'User role',
    example: 'SUPPORT',
    enum: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  })
  @IsEnum(UserRoleValues)
  @IsOptional()
  role?: string;
}
