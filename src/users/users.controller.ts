import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update.user.dto';
import { DeleteUserDto } from './dto/delete.user.dto';
import { AuthGuard } from 'src/auth/security/auth.guard';
interface RequestWithLocals extends Request {
  locals: {
    user: {
      id: number;
      nick_name: string;
    };
  };
}
interface AuthguardRequest extends Request {
  userInfo: {
    id: number;
    nickname: string;
  };
}

@Controller('users')
export class UsersController {
  jwtService: any;
  constructor(private readonly userService: UsersService) {}

  @Get('/find')
  @UseGuards(AuthGuard)
  async getUserEmail(@Req() request: AuthguardRequest) {
    const userInfo = request.userInfo;
    return userInfo.nickname;
  }

  // 인증번호 전송 엔드포인트
  @Post('/send-code')
  async mailSend(@Body('email') email: string, code: string) {
    await this.userService.mailSend(email, code);
    return { message: '인증번호가 전송되었습니다.' };
  }

  // 메일 인증 확인 엔드포인트
  @Post('/verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    const checkEmail = await this.userService.verifyCode(email, code);
    return { message: '이메일이 인증되었습니다.' };
  }

  // 회원가입
  @Post('/sign')
  async createUser(@Body() data: CreateUserDto) {
    const newUser = await this.userService.createUser(
      data.is_admin,
      data.email,
      data.nick_name,
      data.password,
    );

    return {
      AccessToken: 'Bearer ' + newUser.access_Token,
      RefreshToken: 'Bearer ' + newUser.refresh_Token,
    };
  }

  //로그인
  @Post('/login')
  async login(@Body() data: LoginUserDto) {
    const authentication = await this.userService.login(
      data.email,
      data.password,
    );
    return {
      AccessToken: 'Bearer ' + authentication.accessToken,
      RefreshToken: 'Bearer ' + authentication.refreshToken,
    };
  }

  // 서버 로그인
  @Post('/server-login')
  async serverLogin(
    @Body() data: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.userService.login(data.email, data.password);
    response.cookie('AccessToken', 'Bearer' + tokens.accessToken);
    response.cookie('RefreshToken', 'Bearer' + tokens.refreshToken);
    return { message: 'server-login 완료' };
  }

  // 서버 로그아웃
  @Post('/server-logout')
  serverLogout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('AccessToken');
    response.clearCookie('RefreshToken');
    return { message: 'server-logout 완료' };
  }

  //유저 정보 수정(닉네임, 패스워드)
  @Patch('/update')
  async updateUser(
    @Body() data: UpdateUserDto,
    @Req() request: RequestWithLocals,
  ) {
    const auth = request.locals.user;
    try {
      await this.userService.updateUser(
        auth.id,
        data.newNick_name,
        data.password,
        data.newPassword,
      );
      return { message: '닉네임, 비밀번호가 정상적으로 수정되었습니다.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //회원삭제(회원탈퇴)
  @Post('/quit')
  DeleteUser(@Body() data: DeleteUserDto, @Req() request: RequestWithLocals) {
    const auth = request.locals.user;
    return this.userService.deleteUser(
      auth.id,
      data.password,
      data.passwordConfirm,
    );
  }

  //어드민 변환
  @Post('admin')
  async transfer() {
    try {
      // UserService의 transfer 메서드를 호출하여 is_admin 값을 변경합니다.
      await this.userService.transfer(0); // is_admin 값을 0에서 1로 변경하려면 0을 전달합니다.
      return { message: '유저를 어드민으로 변환했습니다.' };
    } catch (error) {
      // 오류 처리
      return { error: 'is_admin 값을 변경하는 중 오류가 발생했습니다.' };
    }
  }

  //관리자 판별
  @Get('/findAdmin')
  async getUserAdmin(@Req() request: RequestWithLocals) {
    const auth = request.locals.user;
    const userInfo = await this.userService.getUserAdmin(auth.id);
    return userInfo.is_admin;
  }
}
