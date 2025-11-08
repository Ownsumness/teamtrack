import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(payload: CreateUserDto): Promise<UserResponseDto> {
    return this.prisma.user.create({ data: payload });
  }
}
