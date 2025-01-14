import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { messageservice } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [messageservice],
})
export class MessageModule {}
