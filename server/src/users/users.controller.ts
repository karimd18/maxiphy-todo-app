import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../auth/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@UserId() userId: string) {
    return this.users.getMe(userId);
  }

  @Patch('me')
  updateMe(@UserId() userId: string, @Body() dto: UpdateUserDto) {
    return this.users.updateMe(userId, dto);
  }

  @Patch('me/password')
  changePassword(@UserId() userId: string, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(userId, dto);
  }
}
