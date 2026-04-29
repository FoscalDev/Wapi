import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly oauthClient = new OAuth2Client();

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private buildUserResponse(user: User & { _id: unknown }) {
    const permissions = user.permissions ?? [];
    const canAccess = user.is_active && permissions.length > 0;
    return {
      id: String(user._id),
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      permissions,
      can_access: canAccess,
    };
  }

  private async signToken(user: User & { _id: unknown }) {
    return this.jwtService.signAsync({
      sub: String(user._id),
      email: user.email,
    });
  }

  private applyAdminDefaults(user: User & { _id: unknown }) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.toLowerCase();
    if (adminEmail && user.email === adminEmail) {
      user.permissions = ['*'];
      user.is_active = true;
    }
  }

  async loginWithGoogle(idToken: string) {
    const googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!googleClientId) {
      throw new UnauthorizedException('Google OAuth no configurado');
    }
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Token de Google invalido');
    }
    const googleUser = this.parseGooglePayload(payload);
    let user = (await this.usersService.findOrCreateFromGoogle(googleUser)) as User & {
      _id: unknown;
    };
    // Bootstrap: evita lockout cuando aun no existe ningun usuario administrador.
    const hasAdmin = await this.usersService.hasAnyAdminUser();
    if (!hasAdmin) {
      await this.usersService.grantSuperAdmin(String(user._id));
      user = (await this.usersService.findById(String(user._id))) as User & { _id: unknown };
    }
    this.applyAdminDefaults(user);
    if (user.permissions.includes('*')) {
      await this.usersService.updateUserAccess(String(user._id), {
        permissions: ['*'],
        is_active: true,
      });
      user = (await this.usersService.findById(String(user._id))) as User & { _id: unknown };
    }

    return {
      access_token: await this.signToken(user),
      user: this.buildUserResponse(user),
    };
  }

  async me(userId: string) {
    const user = (await this.usersService.findById(userId)) as (User & { _id: unknown }) | null;
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.buildUserResponse(user);
  }

  private parseGooglePayload(payload: TokenPayload) {
    if (!payload.sub || !payload.email || !payload.name || !payload.email_verified) {
      throw new UnauthorizedException('Perfil de Google incompleto o no verificado');
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      avatarUrl: payload.picture,
    };
  }
}
