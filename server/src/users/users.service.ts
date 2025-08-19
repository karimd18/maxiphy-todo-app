import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (!dto.name && !dto.email) return this.getMe(userId);

    if (dto.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists && exists.id !== userId) throw new BadRequestException('Email already in use');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, email: dto.email },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  }
}
