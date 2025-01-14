import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class AddMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  channelId: string;
}

export class EditMessageDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  messageId: number;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class DeleteMessageDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  messageId: number;
}

export class GetAllMessageByChatDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;
}