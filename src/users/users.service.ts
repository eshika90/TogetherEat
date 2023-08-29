import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { Repository } from 'typeorm';
import { User } from 'src/entity/user.entity';
import { MailService } from 'src/mail/mail.service';
<<<<<<< HEAD

=======
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
let isEmailVerified: Record<string, boolean> = {};
let codeObject: Record<string, string> = {};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailservice: MailService,
  ) {}

  async getUserInfo(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  // 중복이메일 확인
  async mailSend(email: string, code: string) {
    const existUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 이메일 인증 상태 객체 초기화
    isEmailVerified['email'] = false; // 해당 이메일의 인증 상태를 false로 설정

    // 메일 전송 및 랜덤 코드 생성 및 저장
    const verificationCode = this.generateVerificationCode();
    await this.mailservice.sendVerificationCode(
      email,
      verificationCode.toString(),
    );

    // 랜덤 코드를 객체에 저장
    codeObject['code'] = verificationCode.toString();
    codeObject['email'] = email;
    // 일정 시간 후에 랜덤 코드를 삭제하도록 설정
    setTimeout(() => {
      delete codeObject['code'];
    }, 300000); // 5분 유지
  }

  // 메일 인증 확인하는 코드 로직이 필요
  async verifyCode(email: string, code: string) {
    if (codeObject['code'] !== code || codeObject['email'] !== email) {
      throw new ConflictException(
        '인증 코드 및 인증 이메일이 유효하지 않습니다.',
      );
    } else {
      isEmailVerified['email'] = true;
    }
  }

  // jwt로 해보려다가 포기한 로직
  // async verifyCode(token: string, code: string) {
  //   try {
  //     const decodedToken = this.jwtService.verify(token);
  //     console.log('디코드토큰', decodedToken);
  //     if (decodedToken.verificationCode === code) {
  //       console.log('서비스코드', code);
  //       // 인증 코드가 일치하면 인증 성공
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     return false;
  //   }
  // }

  async createUser(
    is_admin: number,
    email: string,
    nick_name: string,
    password: string,
    // 회원가입 로직에서 중복이메일을 한번 더 체크
  ) {
    const existUser = await this.getUserInfo(email);
    if (!_.isNil(existUser)) {
      throw new ConflictException(
        `e메일이 이미 사용 중입니다. email: ${email}`,
      );
    }

<<<<<<< HEAD
=======
    // 지금 테스트때문에 막아놨음
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
    // // 이메일이 인증된 이메일인지 확인한다.
    // if (!isEmailVerified[email] === true) {
    //   console.log('이메일확인용 콘솔', isEmailVerified);
    //   throw new ConflictException(`인증된 이메일이 아닙니다.`);
    // }

    const insertResult = await this.userRepository.insert({
      is_admin,
      email,
      nick_name,
      password,
    });

    // 로그인할때 액세스토큰을 발급하기 때문에, 회원가입할때는 액세스토큰을 발급하지 않는다.
    // const payload = {
    //   id: insertResult.identifiers[0].id,
    //   nick_name: insertResult.identifiers[0].nick_name,
    // };
    // const accessToken = await this.jwtService.signAsync(payload);

    const refresh_token_payload = {};
    const refresh_token = await this.jwtService.signAsync(
      refresh_token_payload,
      { expiresIn: '1d' },
    );

    delete isEmailVerified[email];

<<<<<<< HEAD
    return { accessToken, refresh_token };
=======
    return { refresh_token };
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
  }

  async login(email: string, password: string) {
    try {
      const userConfirm = await this.getUserInfo(email);
      if (_.isNil(userConfirm)) {
        throw new NotFoundException(
          `e메일을 찾을 수 없습니다. user email: ${email}`,
        );
      }
      if (userConfirm.password !== password) {
        throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
      }
      const payload = {
        id: userConfirm.id,
        nick_name: userConfirm.nick_name,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

<<<<<<< HEAD
  async updateUser(id: number, password: string, newPassword: string) {
=======
  async updateUser(
    id: number,
    nick_name: string,
    newNick_name: string,
    password: string,
    newPassword: string,
  ) {
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
    const confirmUserPass = await this.userRepository.findOne({
      where: { id },
      select: ['nick_name', 'password'],
    });

    if (!confirmUserPass) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (password !== confirmUserPass.password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return this.userRepository.update(id, {
<<<<<<< HEAD
=======
      nick_name: newNick_name,
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
      password: newPassword,
    });
  }

  async deleteUser(id: number, password: string, passwordConfirm: string) {
    const confirmUserPass = await this.userRepository.findOne({
      where: { id },
    });
    if (!confirmUserPass && password !== confirmUserPass.password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return this.userRepository.softDelete(id);
  }
  private generateVerificationCode(): number {
    // 4자리 인증번호 생성 로직
    return Math.floor(1000 + Math.random() * 9000);
  }
<<<<<<< HEAD
}
=======

  async createGoogleUser(data: any) {
    const existUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existUser) {
      throw new ConflictException(`이미 회원 가입된 유저입니다.`);
    }

    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }
}
>>>>>>> 4f63e9656fbd0269f1d24c4b36211bdacc127b8f
