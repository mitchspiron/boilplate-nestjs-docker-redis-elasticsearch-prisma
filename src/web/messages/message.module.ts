import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { messageservice } from './message.service';
import { RedisModule } from '../../redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [RedisModule, CacheModule.register()],
  controllers: [MessageController],
  providers: [messageservice],
})
export class MessageModule {}
