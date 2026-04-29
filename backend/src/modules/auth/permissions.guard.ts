import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from './permissions.decorator';

type RequestUser = {
  permissions?: string[];
  is_active?: boolean;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user?.is_active) {
      throw new ForbiddenException('Usuario inactivo');
    }
    const userPermissions = user.permissions ?? [];
    if (userPermissions.includes('*')) {
      return true;
    }
    const hasAll = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
    if (!hasAll) {
      throw new ForbiddenException('Sin permisos para esta accion');
    }
    return true;
  }
}
