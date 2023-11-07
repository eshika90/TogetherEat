import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      port: 6379,
      ttl: 5,
    }),
  ],
  controllers: [RedisController],
  providers: [RedisService],
})
export class RedisModule {}
