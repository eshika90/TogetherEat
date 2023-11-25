import {
  Controller,
  Get,
  Header,
  Query,
  Req,
  Res,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
} from '@nestjs/common';
import { AuthGuard } from './security/auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
interface OauthUser {
  user: {
    nickName: string;
    email: string;
    password: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // auth guard 사용 로직
  @HttpCode(HttpStatus.OK)
  @Post('/auth-login')
  async signIn(@Body() data, @Res({ passthrough: true }) res: Response) {
    const jwtToken = await this.authService.signIn(data.email, data.password);
    res.cookie('Authorization', 'Bearer ' + jwtToken.accessToken);
    return { message: 'auth-login 테스트 완료' };
  }

  @Get('/user-info')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: Request): any {
    const user: any = req.user;
    return user;
  }
  //------------------카카오 로그인 페이지----------------------------//
  @Get('kakaoLogin')
  @Header('Content-Type', 'text/html')
  getKakaoLoginPage(): string {
    return `
      <div>
        <h1>카카오 로그인</h1>
        <form action="http://localhost:3000/auth/kakaoLoginLogic" method="GET">
          <input type="submit" value="카카오 로그인" />
        </form>
        <form action="/kakaoLogout" method="GET">
          <input type="submit" value="카카오 로그아웃" />
        </form>
      </div>
    `;
  }
  //------------------카카오 로그인 --------------------------//
  @Get('kakaoLoginLogic')
  @Header('Content-Type', 'text/html')
  kakaoLoginLogic(@Res() res): void {
    const _hostName = 'https://kauth.kakao.com';
    const _restApiKey = this.configService.get('KAKAO_API_KEY');
    const _redirectUrl = this.configService.get('KAKAO_CALLBACK_URL');
    const url = `${_hostName}/oauth/authorize?client_id=${_restApiKey}&redirect_uri=${_redirectUrl}&response_type=code`;
    console.log(url); // owner에게 허가를 받은 뒤 server에 client 정보를 담아 요청
    return res.redirect(url);
  }
  //----------------카카오 서버에서 받아오는 요청 ---------------//
  @Get('kakao/callback')
  @Header('Content-Type', 'text/html')
  async kakaoLoginLogicRedirect(@Query() qs, @Res() res) {
    console.log(qs.code); // server가 code를 줌
    const _restApiKey = this.configService.get('KAKAO_API_KEY');
    const _redirect_uri = this.configService.get('KAKAO_CALLBACK_URL');
    const _hostName = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${_restApiKey}&redirect_uri=${_redirect_uri}&code=${qs.code}`;
    const _headers = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    }; // client가 code를 server에 보내서 요청
    const serverResult = await this.authService.oauthLogin(_hostName, _headers);
    // server는 owner가 허용한 client인지 검증
    return res.send(`
        <div>
          <h2>카카오 로그인 성공</h2>
        </div>
      `);
  }
}
