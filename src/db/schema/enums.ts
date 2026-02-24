import { nexusSchema } from './nexus-schema';

export const userRoleEnum = nexusSchema.enum('user_role', ['SUPER_ADMIN', 'ADMIN', 'SUPPORT']);
export const userStatusEnum = nexusSchema.enum('user_status', ['PENDING', 'ACTIVE', 'SUSPENDED']);
export const sessionTypeEnum = nexusSchema.enum('session_type', ['NEXUS', 'SET_PASSWORD']);

// TypeScript type exports for use in DTOs and services
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];

// Runtime enum value objects for use in code
export const UserRoleValues = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
  SUPPORT: 'SUPPORT' as const,
};

export const UserStatusValues = {
  PENDING: 'PENDING' as const,
  ACTIVE: 'ACTIVE' as const,
  SUSPENDED: 'SUSPENDED' as const,
};

export const SessionTypeValues = {
  NEXUS: 'NEXUS' as const,
  SET_PASSWORD: 'SET_PASSWORD' as const,
};
