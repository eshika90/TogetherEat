import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtConfigService } from 'src/config/jwt.config.service';
import { JwtKakaoStrategy } from 'src/config/jwt.social.kakao.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport.jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useClass: JwtConfigService,
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    MailService,
    JwtKakaoStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
