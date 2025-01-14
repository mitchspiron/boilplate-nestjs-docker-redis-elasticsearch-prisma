import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { GlobalResponseType } from '../../utils/type';
import { User } from '../../shared/decorators';
import { users as UserEntity } from '@prisma/client';
import { channelservice } from './channel.service';
import {
  AddUserInChannelDto,
  CreateChannelDto,
  DeleteChannelDto,
  EditChannelDto,
  GetAllChannelusersByChannelDto,
  GetAllMessageByChannelDto,
  JoinChannelDto,
  LeaveChannelDto,
} from './dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelservice: channelservice) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createChannel(
    @User() user: UserEntity,
    @Body() dto: CreateChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.createChannel(user, dto);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinChannel(
    @User() user: UserEntity,
    @Body() dto: JoinChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.joinChannel(user, dto);
  }

  @Post('add-user')
  @HttpCode(HttpStatus.OK)
  async addUserInChannel(
    @User() user: UserEntity,
    @Body() dto: AddUserInChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.addUserInChannel(user, dto);
  }

  @Delete('leave')
  @HttpCode(HttpStatus.OK)
  async leaveChannel(
    @User() user: UserEntity,
    @Body() dto: LeaveChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.leaveChannel(user, dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async editChannel(
    @User() user: UserEntity,
    @Body() dto: EditChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.editChannel(user, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteChannel(
    @User() user: UserEntity,
    @Body() dto: DeleteChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.deleteChannel(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllChannel(@User() user: UserEntity): GlobalResponseType {
    return await this.channelservice.getAllChannel(user);
  }

  @Get('message')
  @HttpCode(HttpStatus.OK)
  async getAllMessageByChannelId(
    @User() user: UserEntity,
    @Body() dto: GetAllMessageByChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.getAllMessageByChannelId(user, dto);
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllChannelUserByChannelId(
    @Body() dto: GetAllChannelusersByChannelDto,
  ): GlobalResponseType {
    return await this.channelservice.getAllChannelUserByChannelId(dto);
  }

  @Get('belong')
  @HttpCode(HttpStatus.OK)
  async getAllChannelUserByUserId(
    @User() user: UserEntity,
  ): GlobalResponseType {
    return await this.channelservice.getAllChannelUserByUserId(user);
  }
}
