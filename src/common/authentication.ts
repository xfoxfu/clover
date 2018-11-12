import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable,
  MiddlewareFunction,
  NestMiddleware,
  ReflectMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "~/service/user";

const AUTH_TYPE_ANONYMOUS = "anonymous";
const AUTH_TYPE_AUTHENTICATED = "authenticated";

// tslint:disable-next-line:variable-name
export const Anonymous = () =>
  ReflectMetadata("auth:type", AUTH_TYPE_ANONYMOUS);
// tslint:disable-next-line:variable-name
export const Authenticated = () =>
  ReflectMetadata("auth:type", AUTH_TYPE_AUTHENTICATED);

export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(UserService) private userService: UserService) {}
  public resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next) => {
      if (req && req.cookies && req.cookies.token) {
        this.userService.get_token_information(req.cookies.token).then(u => {
          (req as any).user = u;
          if (next) {
            next();
          }
        });
      } else {
        if (next) {
          next();
        }
      }
    };
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const auth_type =
      this.reflector.get<string>("auth:type", context.getHandler()) ||
      this.reflector.get<string>("auth:type", context.getClass());
    if (!auth_type) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const user = req.user;
    if (user && auth_type === AUTH_TYPE_ANONYMOUS) {
      res.redirect("/dashboard");
      return false;
    } else if (!user && auth_type === AUTH_TYPE_AUTHENTICATED) {
      throw new UnauthorizedException();
    }
    return true; // TODO: permission check
  }
}

// tslint:disable-next-line:variable-name
export const ReqUser = createParamDecorator((data, req) => {
  return req.user;
});
