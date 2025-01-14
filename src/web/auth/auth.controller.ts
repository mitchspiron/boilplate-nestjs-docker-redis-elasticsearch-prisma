import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangeStatusDto, LoginDto, SignUpDto } from './dto';
import { GlobalResponseType } from '../../utils/type';
import { Public } from '../../shared/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signUpUser(@Body() dto: SignUpDto): GlobalResponseType {
    return await this.authService.signUpUser(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): GlobalResponseType {
    return this.authService.login(dto);
  }

  @Get('/verify')
  @HttpCode(HttpStatus.OK)
  isLoggedIn(@Req() req, @Res() res): Promise<any> {
    return this.authService.isLoggedIn(req, res);
  }

  @Public()
  @Patch('/change-status')
  @HttpCode(HttpStatus.OK)
  updateuserstatus(@Body() dto: ChangeStatusDto): Promise<any> {
    return this.authService.updateuserstatus(dto);
  }
}
