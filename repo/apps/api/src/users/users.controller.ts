import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users returned.', type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
