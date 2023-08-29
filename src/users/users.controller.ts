import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response, response } from 'express';
import { UpdateUserDto } from './dto/update.user.dto';
import { DeleteUserDto } from './dto/delete.user.dto';
<<<<<<< HEAD
import { request } from 'http';
import { Code } from 'typeorm';
=======
// import { NaverAuthGuard } from 'src/auth/utils/naver.auth-guard';
// import { AuthService } from 'src/auth/auth.service';
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f

interface RequestWithLocals extends Request {
  locals: {
    user: {
      id: number;
      nick_name: string;
    };
  };
}
@ApiTags('users')
@Controller('users')
export class UsersController {
  jwtService: any;
  constructor(
    private readonly userService: UsersService, // private readonly authservice: AuthService,
  ) {}

<<<<<<< HEAD
=======
  // @ApiOperation({
  //   summary: '네이버 로그인',
  //   description: '네이버 로그인 APi',
  // })
  // @UseGuards(NaverAuthGuard)
  // @Get('/naver')
  // async naverlogin() {
  //   return;
  // }

  // @ApiOperation({
  //   summary: '네이버 로그인 콜백',
  //   description: '네이버 로그인 콜백 라우터',
  // })
  // @UseGuards(NaverAuthGuard)
  // @Get('naver/callback')
  // async callback(@Req() req, @Res() res: Response): Promise<any> {
  //   if (req.user.type === 'login') {
  //     console.log('여긴 몇번째로 찍히나? 여긴 1번');
  //   } else {
  //   }
  //   console.log('여긴 몇번째로 찍히나? 여긴 2번');
  //   res.redirect('http://localhost:3000/users/naver/callback');
  //   res.end;
  // }

  // 인증번호 전송 엔드포인트
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
  @Post('/send-code')
  async mailSend(@Body('email') email: string, code: string) {
    await this.userService.mailSend(email, code);
    return { message: '인증번호가 전송되었습니다.' };
  }

<<<<<<< HEAD
  // 메일 인증 확인하는 코드 로직
  // 얘도 회원가입 밖에 생성(엔드포인트가 필요함)
  // 컨트롤러
=======
  // 메일 인증 확인 엔드포인트
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
  @Post('/verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    await this.userService.verifyCode(email, code);
    return { message: '이메일이 인증되었습니다.' };
  }

  // @Post('/verify-code')
  // async verifyCode(@Body('code') code: string, @Req() request: Request) {
  //   const token = request.cookies['verificationToken'];

  //   if (!token) {
  //     return { message: '인증 토큰이 없습니다.' };
  //   }

  //   const isVerified = await this.userService.verifyCode(token, code);
  //   console.log('컨트롤러 토큰', token, '컨트롤러코드', code);

  //   if (isVerified) {
  //     return { message: '인증이 완료되었습니다.' };
  //   } else {
  //     return { message: '인증 코드가 유효하지 않습니다.' };
  //   }
  // }

<<<<<<< HEAD
=======
  // 회원가입
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
  @Post('/sign')
  async createUser(@Body() data: CreateUserDto) {
    const { refresh_token } = await this.userService.createUser(
      data.is_admin,
      data.email,
      data.nick_name,
      data.password,
    );
    return { refresh_token };
  }

  //로그인
  @Post('/login')
  async login(
    @Body() data: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authentication = await this.userService.login(
      data.email,
      data.password,
    );
    response.cookie('Authentication', 'Bearer ' + authentication);
    return { message: '로그인 성공' };
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
<<<<<<< HEAD
        data.password,
        data.newPassword,
      );
      return { message: '비밀번호가 정상적으로 수정되었습니다.' };
=======
        data.nick_name,
        data.newNick_name,
        data.password,
        data.newPassword,
      );
      return { message: '닉네임, 비밀번호가 정상적으로 수정되었습니다.' };
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //회원삭제(회원탈퇴)
  @Delete('/quit')
  DeleteUser(@Body() data: DeleteUserDto, @Req() request: RequestWithLocals) {
    const auth = request.locals.user;
    return this.userService.deleteUser(
      auth.id,
      data.password,
      data.passwordConfirm,
    );
  }
}