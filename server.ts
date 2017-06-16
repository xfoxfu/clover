"use strict";

import "./lib/db";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as session from "koa-session-minimal";
import * as views from "koa-views";
import "reflect-metadata";
// tslint:disable-next-line:no-var-requires
const sessionStore: any = require("koa-sqlite3-session");
import * as mount from "koa-mount";
import * as serve from "koa-static";
import config from "./lib/config";
import * as router from "./routes";
import log from "./lib/log";

const app = new Koa();

app.use(async (ctx: Koa.Context, next: () => any) => {
  try {
    await next();
    // Handle 404 upstream.
    const status = ctx.status || 404;
    if (status >= 400) {
      ctx.throw(status);
    }
  } catch (error) {
    if (!error.status) {
      log.error(error);
    }
    ctx.status = error.status || 500;
    ctx.throw(ctx.status);
    ctx.app.emit("error", error, ctx);
  }
});
app.use(views(`${__dirname}/views`, {
  extension: "hbs",
  map: {
    hbs: "handlebars",
  },
  options: {
    partials: {
      "card": "./partials/card",
      "footer": "./partials/footer",
      "header": "./partials/header",
      "sidebar": "./partials/sidebar",
      "html-head": "./partials/html-head",
      "html-foot": "./partials/html-foot",
      "admin-menu": "./partials/admin-menu",
    },
  },
}));
// TODO: logger
app.use(bodyParser());
app.use(session({
  store: new sessionStore(config.get("db_path")),
}));
app.use(mount("/js", serve(`./node_modules/material-design-lite/dist`)));
app.use(mount("/css",
  serve(`./node_modules/material-design-lite/dist`)));
app
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
