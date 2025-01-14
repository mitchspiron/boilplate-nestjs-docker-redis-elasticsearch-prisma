import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ChangeStatusDto, LoginDto, SignUpDto } from './dto';
import { GlobalResponseType, ResponseMap } from '../../utils/type';
import { AuthHelper } from './auth.helper';
import { JwtPayload } from '../../utils/interface';
import { Request, Response } from 'express';
import { users } from '@prisma/client';
import { USER_STATUS } from 'src/utils/enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUpUser(dto: SignUpDto): GlobalResponseType {
    try {
      const userExists = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });

      if (userExists) {
        throw new ConflictException(
          `User already exists for email: ${dto.email}`,
        );
      }

      const userPassword = await AuthHelper.hash(dto.password);
      const user = await this.prisma.users.create({
        data: {
          firstname: dto.firstname,
          lastname: dto.lastname,
          email: dto.email,
          password: userPassword,
        },
      });

      return ResponseMap(
        {
          user: user,
        },
        'User successfully registered!',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(dto: LoginDto): GlobalResponseType {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          status: true,
          password: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`No user found for email: ${dto.email}`);
      }

      const passwordMatch = await AuthHelper.validate(
        dto.password,
        user.password,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid password');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        status: user.status,
      };

      const access_token = this.jwtService.sign(payload);

      return ResponseMap(
        {
          user: user,
          access_token: access_token,
        },
        'User authenticated',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  validatePayload(payload: JwtPayload) {
    return this.prisma.users.findUnique({
      where: { id: payload.id },
    });
  }

  async decodeToken(req: Request) {
    const AuthHeader = req.headers.authorization;
    const Token = AuthHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    const Data = this.jwtService.verify(Token, { secret });

    const { iat, exp, ...filteredData } = Data;

    return filteredData;
  }

  async isLoggedIn(req: Request, res: Response): Promise<any> {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Invalid Session');
    }

    let data: any;
    try {
      const Decoded = await this.decodeToken(req);
      data = Decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid Session');
    }
    res.send(data);
  }

  async updateuserstatus(dto: ChangeStatusDto) {
    try {
      const userExists = await this.prisma.users.findUnique({
        where: {
          id: dto.userId,
        },
      });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.prisma.users.update({
        where: { id: userExists.id },
        data: {
          status:
            userExists.status == USER_STATUS.OFFLINE
              ? USER_STATUS.ONLINE
              : USER_STATUS.OFFLINE,
        },
      });
      return updatedUser;
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
