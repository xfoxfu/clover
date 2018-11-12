import { NestFactory } from "@nestjs/core";
import hbs from "hbs";
import { join } from "path";
import { AppModule } from "~/app.module";
import * as CONFIG from "~/common/config";
import { UnauthorizedExceptionFilter } from "~/common/errors";
import { PinoLoggerService } from "~/common/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useStaticAssets(join(__dirname, "..", "node_modules", "semantic-ui-css"));
  app.useStaticAssets(join(__dirname, "..", "node_modules", "jquery", "dist"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  hbs.registerPartials(join(__dirname, "..", "views", "partials"));
  app.setViewEngine("hbs");

  app.useLogger(app.get(PinoLoggerService));

  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  await app.listen(CONFIG.PORT);
}

bootstrap();
