import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');
    if (!adminEmail || !adminPassword) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    const passwordMatches =
      password === adminPassword ||
      (await bcrypt
        .compare(password, adminPassword)
        .catch(() => Promise.resolve(false)));

    if (email !== adminEmail || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: await this.jwtService.signAsync({ sub: email }),
    };
  }
}
