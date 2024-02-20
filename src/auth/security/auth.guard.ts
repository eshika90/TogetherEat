import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies.Authorization.replace('Bearer ', '');

    const payload = jwt.verify(
      accessToken,
      this.configService.get('JWT_SECRET_KEY'),
    ) as jwt.JwtPayload;
    const user = await this.usersService.findUserById(payload.id);
    request.userInfo = user;
    return true;
  }
}
