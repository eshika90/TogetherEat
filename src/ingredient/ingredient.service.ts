import { Injectable, Inject } from '@nestjs/common';
import _ from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from 'src/entity/ingredient.entity';
import { User } from 'src/entity/user.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  //재료 생성
  async createIngredient(user_id: number, ingredient_name: string) {
    const confirmAdmin = await this.userRepository.findOne({
      where: { id: user_id },
      select: ['is_admin'],
    });
    return this.ingredientRepository.insert({
      ingredient_name,
    });
  }

  //재료 수정
  async updateIngredient(
    user_id: number,
    ingredient_id: number,
    ingredient_name: string,
  ) {
    const confirmAdmin = await this.userRepository.findOne({
      where: { id: user_id },
      select: ['is_admin'],
    });

    const updateIngre = await this.ingredientRepository.update(ingredient_id, {
      ingredient_name,
    });
    if (updateIngre) {
      const ingredientInformation = await this.ingredientRepository.find();
      await this.cacheService.set(
        'ingredient_information',
        ingredientInformation,
        180,
      );
    }
  }

  //재료 상세조회
  async getIngredient(ingredient_id) {
    return await this.ingredientRepository.query(
      `select * from ingredient where id = ${ingredient_id}`,
    );
  }

  //재료 전체 조회
  async getIngredientAll() {
    return await this.ingredientRepository.query(`select * from ingredient;`);
  }

  //재료 캐시 전체 조회
  async getIngredientAllcache() {
    const cachedData = await this.cacheService.get('/ingredient/');
    return cachedData;
  }

  //재료 삭제
  async deleteIngredient(id: number) {
    await this.ingredientRepository.delete({ id });
  }
}
