import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import _, { remove } from 'lodash';
import { Repository } from 'typeorm';
import { User } from 'src/entity/user.entity';
import { MailService } from 'src/mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
let isEmailVerified: Record<string, boolean> = {};
let codeObject: Record<string, string> = {};


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private mailservice: MailService,
  ) {}

  async findUser(email: string) {
    return await this.userRepository.findOne({
      where: { email, deletedAt: null },
      select: ['id', 'nick_name', 'password', 'refresh_token'],
    });
  }

  async findUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id, deletedAt: null },
      select: ['id', 'nick_name'],
    });
  }

  async getUserNickName(user_id: number) {
    return await this.userRepository.findOne({
      where: { id: user_id },
      select: ['nick_name'],
    });
  }

  // node-mailer 로직
  async mailSend(email: string, code: string) {
    const existUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 메일 전송 및 랜덤 코드 생성 및 저장
    const verificationCode = this.generateVerificationCode();
    await this.mailservice.sendVerificationCode(
      email,
      verificationCode.toString(),
    );
    // 캐시로 랜덤 코드 저장하기
    const setCode = await this.cacheManager.set(email, verificationCode, 180);
    console.log('data set to cache', setCode);
    return '메일로 코드가 전송되었습니다.';
  }

  // 메일 인증 확인하는 코드 로직이 필요
  async verifyCode(email: string, code: string) {
    const getCacheCode = await this.cacheManager.get(email);
    console.log('data get to cache', getCacheCode);
    if (!email || getCacheCode != code) {
      throw new ConflictException(
        '인증 코드 및 인증 이메일이 유효하지 않습니다.',
      );
    } else {
      return '인증이 완료되었습니다.';
    }
  }

  async createUser(
    is_admin: number,
    email: string,
    nick_name: string,
    password: string,
    // 회원가입 로직에서 중복이메일을 한번 더 체크
  ) {
    if (password.length < 6 || password.length > 10) {
      throw new BadRequestException(
        '비밀번호는 6자리 이상, 10자리 이하여야 합니다.',
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const existUser = await this.findUser(email);
    if (!_.isNil(existUser)) {
      throw new ConflictException(
        `e메일이 이미 사용 중입니다. email: ${email}`,
      );
    }
    const insertResult = await this.userRepository.insert({
      is_admin,
      email,
      nick_name,
      password: hashedPassword,
    });

    const payload = {
      id: insertResult.identifiers[0].id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
    });

    const refreshPayload = {
      accessToken: accessToken,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    await this.userRepository.update(insertResult.identifiers[0].id, {
      refresh_token: refreshToken,
    });
    return { access_Token: accessToken, refresh_Token: refreshToken };
  }

  async login(email: string, password: string) {
    const userConfirm = await this.findUser(email);
    if (!userConfirm) {
      throw new NotFoundException(
        `e메일을 찾을 수 없습니다. user email: ${email}`,
      );
    }
    const matchedPassward = await bcrypt.compare(
      password,
      userConfirm.password,
    );
    if (!matchedPassward) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      id: userConfirm.id,
      nick_name: userConfirm.nick_name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
    });

    const refreshPayload = {
      id: userConfirm.id,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    console.log('새로 발급된 token', refreshToken);
    await this.userRepository.update(userConfirm.id, {
      refresh_token: refreshToken,
    });
    return { accessToken, refreshToken };
  }

  async updateUser(
    id: number,
    newNick_name: string,
    password: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['password', 'nick_name'],
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    // 새로운 비밀번호를 해시화하여 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 데이터베이스를 업데이트
    return this.userRepository.update(id, {
      nick_name: newNick_name,
      password: hashedNewPassword,
    });
  }

  // 비밀번호 일치로직 안돌아서 이부분 해결해야함
  async deleteUser(id: number, password: string, passwordConfirm: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['password'],
    });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    return this.userRepository.softDelete(id);
  }

  private generateVerificationCode(): number {
    // 4자리 인증번호 생성 로직
    return Math.floor(1000 + Math.random() * 9000);
  }

  async createGoogleUser(data: any) {
    const existUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existUser) {
      throw new ConflictException(`이미 가입된 회원입니다.`);
    }

    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async transfer(is_admin: number) {
    const userToUpdate = await this.userRepository.findOne({
      where: { is_admin: 0 }, // is_admin이 0인 사용자를 찾습니다.
    });

    if (userToUpdate) {
      // is_admin 값을 1로 업데이트합니다.
      userToUpdate.is_admin = 1;
      await this.userRepository.save(userToUpdate); // 변경 사항을 저장합니다.
    }
  }

  // 관리자 판별
  async getUserAdmin(user_id: number) {
    return await this.userRepository.findOne({
      where: { id: user_id },
      select: ['is_admin'],
    });
  }

  async createKakaoUser(user) {
    this.userRepository.insert({
      email: user.email,
      nick_name: user.nickName,
    });
  }
}
