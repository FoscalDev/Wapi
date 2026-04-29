import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigServiceApp } from './config.service';
import { AuthType } from './schemas/whatsapp-config.schema';

class UpsertConfigDto {
  @IsString()
  app_name!: string;
  @IsString()
  phone_number_id!: string;
  @IsString()
  display_phone_number!: string;
  @IsUrl()
  webhook_url!: string;
  @IsEnum(AuthType)
  auth_type!: AuthType;
  @IsOptional()
  @IsString()
  auth_token?: string;
  @IsBoolean()
  is_active!: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigServiceApp) {}

  @Post()
  create(@Body() dto: UpsertConfigDto) {
    return this.configService.create(dto);
  }

  @Get()
  list() {
    return this.configService.list();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UpsertConfigDto>) {
    return this.configService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }
}
