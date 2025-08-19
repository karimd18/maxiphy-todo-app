import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email }});
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    const accessToken = await this.sign(user.id);
    return { user, accessToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }});
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const safe = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    return { user: safe, accessToken: await this.sign(user.id) };
  }

  private async sign(userId: string) {
    return this.jwt.signAsync({ sub: userId });
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }
}
