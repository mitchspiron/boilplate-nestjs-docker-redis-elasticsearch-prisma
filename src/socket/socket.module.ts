import { Module } from '@nestjs/common';
import { messagesocket } from './message.socket';

@Module({
  providers: [messagesocket],
})
export class SocketModule {}
