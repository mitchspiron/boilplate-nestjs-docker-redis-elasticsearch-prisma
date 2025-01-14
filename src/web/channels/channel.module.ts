import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { channelservice } from './channel.service';

@Module({
  controllers: [ChannelController],
  providers: [channelservice],
})
export class ChannelModule {}
