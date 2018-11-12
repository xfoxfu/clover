// tslint:disable-next-line:no-var-requires
require("tsconfig-paths/register");

import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard, AuthMiddleware } from "~/common/authentication";
import { CookieMiddleware } from "~/common/cookie.middleware";
import { DbModule, DbService } from "~/common/db";
import { LoggerModule } from "~/common/logger.service";
import { TokenService } from "~/common/token.service";

@Module({
  imports: [LoggerModule, DbModule],
  controllers: [],
  providers: [
    DbService,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CookieMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
