import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Payload } from './security/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.Authorization;
        }, // 옵셔널 체이닝 객체에 있으면 바로 해당 값 반환 없으면
      ]), // 에러를 띄우는게아닌 undefined 반환
      ignoreExpiration: false, // jwt 보증을 passport 모듈에 위임. 만료된 경우 res 401
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }
  async validate(payload: Payload, done: VerifiedCallback): Promise<any> {
    const user = await this.authService.tokenValidateUser(payload);
    if (!user) {
      return done(
        new UnauthorizedException({ message: 'user does not exist' }),
      );
    }
    return done(null, user);
  }
}
