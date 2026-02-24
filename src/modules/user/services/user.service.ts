import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import { type User, UserRoleValues } from '@/db/schema';
import { CreateUserWebhookDto } from '../dto/request/create-user-webhook.dto';
import { UserDto } from '../dto/entity/user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  // Creates or updates a user from a cloud-server webhook payload
  async createFromWebhook(dto: CreateUserWebhookDto): Promise<UserDto> {
    const user = await this.userRepository.upsertByExternalId({
      externalId: dto.externalId,
      email: dto.email,
      fullName: dto.fullName,
      role: (dto.role as (typeof UserRoleValues)[keyof typeof UserRoleValues]) ?? UserRoleValues.SUPPORT,
      status: 'PENDING',
    });

    this.logger.log(`Upserted user from webhook: ${user.email} (${user.id})`);

    return UserDto.from(user);
  }

  // Finds a user by email for auth — returns entity (not DTO)
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(email);
  }

  // Finds a user by ID — returns entity (not DTO)
  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  // Finds a user by ID or throws NotFoundException
  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  // Updates the last login timestamp for a user
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  // Sets password hash and activates the user
  async setPassword(id: string, passwordHash: string): Promise<void> {
    await this.userRepository.setPassword(id, passwordHash);
    this.logger.log(`Password set for user: ${id}`);
  }
}
