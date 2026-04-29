import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { AVAILABLE_PERMISSIONS } from './schemas/user.schema';
import { UsersService } from './users.service';

class UpdateUserAccessDto {
  @IsOptional()
  @IsArray()
  @IsIn(AVAILABLE_PERMISSIONS, { each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

class ProvisionUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  full_name!: string;

  @IsOptional()
  @IsArray()
  @IsIn(AVAILABLE_PERMISSIONS, { each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.manage')
  list() {
    return this.usersService.listUsers();
  }

  @Patch(':id/access')
  @RequirePermissions('users.manage')
  updateAccess(@Param('id') id: string, @Body() dto: UpdateUserAccessDto) {
    return this.usersService.updateUserAccess(id, dto);
  }

  @Post('provision')
  @RequirePermissions('users.manage')
  provision(@Body() dto: ProvisionUserDto) {
    return this.usersService.provisionUser(dto);
  }
}
