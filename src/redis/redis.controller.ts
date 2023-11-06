import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import Cache from 'cache-manager';

@Controller('redis')
export class RedisController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @Get('/cache')
  async getCache(@Query('id') id: string) {}
}
