import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
  constructor(
    reflector: Reflector,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(reflector, jwtService, configService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, check if the user is authenticated using the parent AuthGuard
    const isAuthenticated = await super.canActivate(context);
    console.log('isAuthenticated', isAuthenticated);
    if (!isAuthenticated) {
      return false;
    }

    // Check if the route requires admin access
    const isAdminRequired = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isAdminRequired) {
      return true;
    }

    // Get the user from the request (set by AuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    console.log('user', user);
    // Check if the user has admin privileges
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
