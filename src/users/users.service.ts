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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getUserInfo(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['user_id', 'email', 'password'],
    });
  }

  async createUser(
    is_admin: boolean,
    email: string,
    nick_name: string,
    password: string,
  ) {
    const existUser = await this.getUserInfo(email);
    if (!_.isNil(existUser)) {
      throw new ConflictException(
        `e메일이 이미 사용 중입니다. email: ${email}`,
      );
    }

    const insertResult = await this.userRepository.insert({
      is_admin,
      email,
      nick_name,
      password,
    });

    const payload = {
      id: insertResult.identifiers[0].id,
      nick_name: insertResult.identifiers[0].nick_name,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const refresh_token_payload = {};
    const refresh_token = await this.jwtService.signAsync(
      refresh_token_payload,
      { expiresIn: '1d' },
    );

    return { accessToken, refresh_token };
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
        id: userConfirm.user_id,
        nick_name: userConfirm.nick_name,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user_id: number, password: string, newPassword: string) {
    const confirmUserPass = await this.userRepository.findOne({
      where: { user_id },
      select: ['password'],
    });
    if (!confirmUserPass && password !== confirmUserPass.password) {
      throw new UnauthorizedException('User password is not corresponded');
    }
    return this.userRepository.update(user_id, { password: newPassword });
  }
}
