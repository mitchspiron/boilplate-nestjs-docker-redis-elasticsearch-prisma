import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GlobalResponseType } from '../../utils/type';
import { User } from '../../shared/decorators';
import { messageservice } from './message.service';
import {
  AddMessageDto,
  DeleteMessageDto,
  EditMessageDto,
} from './dto';
import { users as UserEntity } from '@prisma/client';

@Controller('message')
export class MessageController {
  constructor(private readonly messageservice: messageservice) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createMessage(
    @User() user: UserEntity,
    @Body() dto: AddMessageDto,
  ): GlobalResponseType {
    return await this.messageservice.createMessage(user, dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async editMessage(
    @User() user: UserEntity,
    @Body() dto: EditMessageDto,
  ): GlobalResponseType {
    return await this.messageservice.editMessage(user, dto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async deleteMessageById(
    @User() user: UserEntity,
    @Body() dto: DeleteMessageDto,
  ): GlobalResponseType {
    return await this.messageservice.deleteMessageById(user, dto);
  }

  @Post('chat/:id')
  @HttpCode(HttpStatus.OK)
  async getAllMessageByChatId(
    @User() user: UserEntity,
    @Param('id') chat: string,
  ): GlobalResponseType {
    return await this.messageservice.getAllMessageByChatId(user, chat);
  }

  @Get('user-chat')
  @HttpCode(HttpStatus.OK)
  async getAllUserchatsByUserId(@User() user: UserEntity): GlobalResponseType {
    return await this.messageservice.getAllUserchatsByUserId(user);
  }

  @Get('user-not-chat')
  @HttpCode(HttpStatus.OK)
  async getAllusersNotChatedByUser(
    @User() user: UserEntity,
  ): GlobalResponseType {
    return await this.messageservice.getAllusersNotChatedByUser(user);
  }

  @Post('to-seen/:id')
  @HttpCode(HttpStatus.OK)
  async updateAllMessageToSeenByChatId(
    @User() user: UserEntity,
    @Param('id') chat: string,
  ): GlobalResponseType {
    return await this.messageservice.updateAllMessageToSeenByChatId(user, chat);
  }
}
