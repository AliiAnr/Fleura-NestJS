import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // Jika tidak ada role yang ditentukan, izinkan akses
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log(user);

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "You do not have permission to access this resource"
      );
    }

    return true;
  }
}
