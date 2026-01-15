import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public routes, try to authenticate if token is provided, but don't require it
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (token) {
        // If token exists, try to authenticate (but don't throw error if it fails)
        return super.canActivate(context).catch(() => {
          // Set user to null if authentication fails
          request.user = null;
          return true;
        });
      }
      // No token provided, allow access without authentication
      request.user = null;
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // For public routes, return user if authenticated, null otherwise
    // This allows the optional decorator to work correctly
    if (err || !user) {
      return null;
    }
    return user;
  }
}
