import { IsNotEmpty, IsString } from 'class-validator';
import { CHANNEL_STATUS } from '../../../utils/enum';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  status: CHANNEL_STATUS;
}

export class JoinChannelDto {
  @IsNotEmpty()
  @IsString()
  channelId: string;
}

export class AddUserInChannelDto extends JoinChannelDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class EditChannelDto extends CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  channelId: string;
}

export class DeleteChannelDto {
  @IsNotEmpty()
  @IsString()
  channelId: string;
}

export class LeaveChannelDto extends DeleteChannelDto {}
export class GetAllMessageByChannelDto extends DeleteChannelDto {}
export class GetAllChannelusersByChannelDto extends DeleteChannelDto {}
