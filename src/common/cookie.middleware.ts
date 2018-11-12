import { Injectable, MiddlewareFunction, NestMiddleware } from "@nestjs/common";
import cookie_parser from "cookie-parser";

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  public resolve(...args: any[]): MiddlewareFunction {
    return cookie_parser() as any;
  }
}
