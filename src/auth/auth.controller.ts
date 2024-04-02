import { Body, Controller, ForbiddenException, Get, Post, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupParamsDto } from './dto/signup/signup.dto';
import { Response } from 'express';
import AuthControllerInterface from './interface/authController.interface';
import { AuthControllerDto } from './dto/authController.dto';
import { SigninParamsDto } from './dto/signin/signIn.dto';
import { PasswordLessParamsDto } from './dto/passwordless/passwordless';

@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController implements AuthControllerInterface {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupParamsDto, @Res() res: Response): Promise<Response<AuthControllerDto>> {
    const result = await this.authService.signup(dto);
    return res.status(200).send({
      message: 'User created succefully',
      data: result
    });
  }

  @Post('signin')
  async signin(@Res() res: Response, @Body() dto: SigninParamsDto): Promise<Response<AuthControllerDto>> {
    const result = await this.authService.signin(dto);
   
    const token = await this.authService.signToken({
      userId: result.id,
      email: result.email,
    });

    if (!token) throw new ForbiddenException('Could not signin');

    res.cookie('token', token, {});
    return res.status(200).send({
      message: 'Logged in succefully',
      data: result
    })
  }

  @Get('signout')
  async signout(@Res() res: Response): Promise<Response>{
    res.clearCookie('token');
    return res.status(200).send({ message: 'Logged out succefully' });
  }

  @Post('passwordLess')
  async passwordLess(@Body() dto: PasswordLessParamsDto, @Res() res: Response): Promise<Response<AuthControllerDto>> {
    const token = await this.authService.passwordLess(dto);

    return res.json({
      success: true,
      message: "На вашей почте скоро появится письмо для сброса пароля",
      token,
    });
  }
}
