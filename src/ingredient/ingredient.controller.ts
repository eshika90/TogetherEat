import {
  Controller,
  Body,
  Delete,
  Get,
  Post,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { Request } from 'express';
import { createIngredientDto } from './dto/create.ingredient.dto';
import { updateIngredientDto } from './dto/update.ingredient.dto';
import { deleteIngredientDto } from './dto/delete.ingredient.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

interface RequestWithLocals extends Request {
  locals: {
    user: {
      id: number;
      nick_name: string;
    };
  };
}

@Controller('ingredient')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  //재료 생성
  @Post('/')
  async createIngredient(
    @Body() data: createIngredientDto,
    @Req() request: RequestWithLocals,
  ) {
    const user = request.locals.user;
    await this.ingredientService.createIngredient(
      user.id,
      data.ingredient_name,
    );
    return { message: '재료 생성완료' };
  }
  //재료 수정
  @Patch('/:ingredient_id')
  async updateIngredient(
    @Body() data: updateIngredientDto,
    @Req() request: RequestWithLocals,
    @Param('ingredient_id') ingredient_id: number,
  ) {
    const user = request.locals.user;
    await this.ingredientService.updateIngredient(
      user.id,
      ingredient_id,
      data.ingredient_name,
    );
    return { message: '카테고리 수정완료' };
  }

  //재료 상세
  @Get('/:ingredient_id')
  async getIngredient(@Param('ingredient_id') ingredient_id: number) {
    return this.ingredientService.getIngredient(ingredient_id);
  }

  //재료 전체조회
  @Get('/')
  async getIngredientAll() {
    // return this.ingredientService.getIngredientAll();
    return this.ingredientService.getIngredientAllcache();
  }

  @Get('/test')
  async getIngredientAllcache() {
    return this.ingredientService.getIngredientAllcache();
  }

  //재료 삭제
  @Delete('/:ingredient_id')
  async deleteIngredient(
    @Req() request: RequestWithLocals,
    @Param('ingredient_id') ingredient_id: number,
  ) {
    console.log('con', ingredient_id);
    await this.ingredientService.deleteIngredient(ingredient_id);
    return { message: '카테고리 삭제 완료.' };
  }
}
