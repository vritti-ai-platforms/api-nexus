import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigFactory } from '../../config/jwt.config';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { SessionRepository } from './repositories/session.repository';
import { AuthService } from './services/auth.service';
import { JwtAuthService } from './services/jwt.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfigFactory,
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, SessionService, SessionRepository],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
