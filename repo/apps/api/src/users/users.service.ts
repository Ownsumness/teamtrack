import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { PrismaClient as Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaClient) private prisma: Prisma) {}

  async findAll(): Promise<User[]> {
    // In real app, add pagination, tenant filtering, etc.
    return this.prisma.user.findMany();
  }
}
