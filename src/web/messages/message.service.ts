import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddMessageDto,
  DeleteMessageDto,
  EditMessageDto,
  GetAllMessageByChatDto,
} from './dto';
import { GlobalResponseType, ResponseMap } from '../../utils/type';
import { messages, users } from '@prisma/client';
import { MESSAGE_STATUS } from 'src/utils/enum';

@Injectable()
export class messageservice {
  constructor(private prisma: PrismaService) {}

  async createMessage(user: users, dto: AddMessageDto): GlobalResponseType {
    try {
      const senderExists = await this.prisma.users.findUnique({
        where: { id: user.id },
      });

      if (!senderExists) {
        throw new BadRequestException(`Sender does not exist!`);
      }

      if (!dto.recipientId && !dto.channelId) {
        throw new BadRequestException(
          `Recipient and Chat or Channel is required!`,
        );
      }

      let newMessage: messages = null;
      if (dto.recipientId && !dto.channelId) {
        const recipientExists = await this.prisma.users.findUnique({
          where: { id: dto.recipientId },
        });

        if (!recipientExists) {
          throw new BadRequestException(`Recipient does not exist!`);
        }

        const sharedchats = await this.prisma.users_chats.findMany({
          where: {
            userId: user.id,
            chatId: {
              in: (
                await this.prisma.users_chats.findMany({
                  where: {
                    userId: dto.recipientId,
                  },
                  select: {
                    chatId: true,
                  },
                })
              ).map((uc) => uc.chatId),
            },
          },
          select: {
            chatId: true,
          },
        });

        if (sharedchats.length == 0) {
          const newChat = await this.prisma.chats.create({
            data: {
              userId: user.id,
            },
          });

          await this.prisma.users_chats.createMany({
            data: [
              {
                userId: user.id,
                chatId: newChat.id,
              },
              {
                userId: dto.recipientId,
                chatId: newChat.id,
              },
            ],
          });

          newMessage = await this.prisma.messages.create({
            data: {
              content: dto.content,
              senderId: user.id,
              recipientId: dto.recipientId,
              chatId: newChat.id,
            },
          });

          return ResponseMap(
            {
              message: newMessage,
            },
            'Message Added Successfully',
          );
        }

        const usersChat = await this.prisma.users_chats.findMany({
          where: {
            chatId: sharedchats[0].chatId,
          },
          select: {
            userId: true,
          },
        });

        const users = usersChat.map((obj) => obj.userId);

        let sender = user.id;
        let recipient;

        if (sender === users[0]) {
          recipient = users[1];
        } else if (sender === users[1]) {
          recipient = users[0];
        }

        newMessage = await this.prisma.messages.create({
          data: {
            content: dto.content,
            senderId: sender,
            recipientId: recipient,
            chatId: sharedchats[0].chatId,
          },
        });

        return ResponseMap(
          {
            message: newMessage,
          },
          'Message Added Successfully',
        );
      }

      if (!dto.recipientId && dto.channelId) {
        const channelExists = await this.prisma.channels.findUnique({
          where: { id: dto.channelId },
        });

        if (!channelExists) {
          throw new BadRequestException(`This Channel does not exist!`);
        }

        const userChannelExists = await this.prisma.users_channels.findFirst({
          where: {
            userId: user.id,
            channelId: channelExists.id,
          },
        });

        if (!userChannelExists) {
          throw new BadRequestException(
            `You are not a member of this channel!`,
          );
        }

        newMessage = await this.prisma.messages.create({
          data: {
            content: dto.content,
            senderId: userChannelExists.userId,
            channelId: userChannelExists.channelId,
          },
        });

        return ResponseMap(
          {
            message: newMessage,
          },
          'Message Added Successfully',
        );
      }
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async editMessage(user: users, dto: EditMessageDto): GlobalResponseType {
    try {
      const messageExists = await this.prisma.messages.findUnique({
        where: {
          id: dto.messageId,
          senderId: user.id,
        },
      });

      if (!messageExists) {
        throw new BadRequestException('No message found to update');
      }

      const updateMessage = await this.prisma.messages.update({
        where: {
          id: messageExists.id,
          senderId: messageExists.senderId,
        },
        data: {
          content: dto.content,
        },
      });

      return ResponseMap(
        {
          message: updateMessage,
        },
        'Message Updated Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMessageById(
    user: users,
    dto: DeleteMessageDto,
  ): GlobalResponseType {
    try {
      const messageExists = await this.prisma.messages.findUnique({
        where: {
          id: dto.messageId,
          senderId: user.id,
        },
      });

      if (!messageExists) {
        throw new BadRequestException('No message found to delete');
      }

      const deleteMessage = await this.prisma.messages.delete({
        where: {
          id: messageExists.id,
        },
      });

      return ResponseMap(
        {
          message: deleteMessage,
        },
        'Message Deleted Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllMessageByChatId(user: users, chat: string): GlobalResponseType {
    try {
      const userChat = await this.prisma.users_chats.findFirst({
        where: {
          userId: user.id,
          chatId: chat,
        },
      });

      if (!userChat) {
        throw new UnauthorizedException('User not allowed to access this chat');
      }

      const messages = await this.prisma.messages.findMany({
        where: {
          chatId: userChat.chatId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          status: true,
          createdAt: true,
          recipient: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      });

      if (messages.length == 0) {
        throw new BadRequestException('No message found!');
      }

      const usersInChat = await this.prisma.users_chats.findMany({
        where: {
          chatId: chat,
        },
        select: {
          users: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              status: true,
            },
          },
        },
      });

      // Récupérer les détails des expéditeurs (sender)
      const senderIds = [...new Set(messages.map((msg) => msg.senderId))]; // Obtenir les IDs uniques des expéditeurs
      const senders = await this.prisma.users.findMany({
        where: {
          id: {
            in: senderIds,
          },
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          status: true,
        },
      });

      const senderMap = senders.reduce((map, sender) => {
        map[sender.id] = {
          firstname: sender.firstname,
          lastname: sender.lastname,
        };
        return map;
      }, {});

      const chatExists = messages.map((message) => ({
        ...message,
        sender: {
          firstname: senderMap[message.senderId].firstname,
          lastname: senderMap[message.senderId].lastname,
        },
      }));
      return ResponseMap(
        {
          messages: chatExists,
          users_in_chat: usersInChat,
        },
        'Chat messages Fetched Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUserchatsByUserId(user: users): GlobalResponseType {
    try {
      const usermessages = await this.prisma.chats.findMany({
        where: {
          users_chats: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              recipient: true,
            },
          },
          users_chats: {
            include: {
              users: true,
            },
          },
        },
      });

      if (usermessages.length == 0) {
        throw new BadRequestException('No user chat found');
      }

      usermessages.sort((a, b) => {
        const dateA: any = a.messages[0]?.createdAt;
        const dateB: any = b.messages[0]?.createdAt;
        return dateB - dateA; // Trier par ordre décroissant
      });

      const results = usermessages.map((chat) => {
        const lastMessage = chat.messages[0];
        const otherUser = chat.users_chats.find(
          (uc) => uc.userId !== user.id,
        ).users;

        return {
          chatId: chat.id,
          lastMessageContent: lastMessage?.content,
          lastMessageCreatedAt: lastMessage?.createdAt,
          lastmessagesenderId: lastMessage?.senderId,
          lastmessagestatus: lastMessage?.status,
          otherUserFirstName: otherUser.firstname,
          otherUserLastName: otherUser.lastname,
          otheruserstatus: otherUser.status,
        };
      });

      return ResponseMap(
        {
          chats: results,
        },
        'User chats Fetched Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllusersNotChatedByUser(user: users): GlobalResponseType {
    try {
      const mychats = await this.prisma.users_chats.findMany({
        where: {
          userId: user.id,
        },
        select: {
          chatId: true,
        },
      });

      const myChatIds = mychats.map((chat) => chat.chatId);

      const usersWithoutMychats = await this.prisma.users.findMany({
        where: {
          id: {
            not: user.id,
          },
          AND: {
            users_chats: {
              none: {
                chatId: {
                  in: myChatIds,
                },
              },
            },
          },
        },
      });

      if (usersWithoutMychats.length == 0) {
        throw new NotFoundException('You are chating with all users');
      }

      return ResponseMap(
        {
          chats: usersWithoutMychats,
        },
        'users Fetched Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAllMessageToSeenByChatId(
    user: users,
    chat: string,
  ): GlobalResponseType {
    try {
      const userChat = await this.prisma.users_chats.findFirst({
        where: {
          userId: user.id,
          chatId: chat,
        },
      });

      if (!userChat) {
        throw new UnauthorizedException('User not allowed to access this chat');
      }

      const messages = await this.prisma.messages.updateMany({
        data: {
          status: MESSAGE_STATUS.SEEN,
        },
        where: {
          chatId: chat,
          senderId: {
            not: user.id,
          },
          status: MESSAGE_STATUS.SENT,
        },
      });

      return ResponseMap(
        {
          messages: messages,
        },
        'Message Updated Successfully',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
