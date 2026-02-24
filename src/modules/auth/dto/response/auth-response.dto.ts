import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiPropertyOptional({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Access token expiry in seconds',
    example: 900,
  })
  expiresIn?: number;

  @ApiPropertyOptional({
    description: 'Whether the user must set a password first',
    example: false,
  })
  requiresSetPassword?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user is authenticated',
    example: true,
  })
  isAuthenticated?: boolean;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
