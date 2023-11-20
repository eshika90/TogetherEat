import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  check: boolean;
  accessToken: string;
  private http: HttpService;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.check = false;
    this.http = new HttpService();
    this.accessToken = '';
  }
  signIn(email, password) {}

  async generateAccessToken(payload: string) {
    const access_Token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
    });
    return access_Token;
  }

  async oauthLogin(url: string, headers: any) {
    // server가 받은 code를 가지고 owner의 정보를 다시 전달
    const response = await lastValueFrom(this.http.post(url, '', { headers }));
    const authData = response.data;
    const userResponse = await lastValueFrom(
      this.http.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      }),
    );
    const userData = userResponse.data;
    const userInfo = {
      nickname: userData.kakao_account.profile.nickname,
      email: userData.kakao_account.email,
    };
    return await this.usersService.createKakaoUser(userInfo);
  }
}
