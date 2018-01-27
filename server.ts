"use strict";

import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as session from "koa-session-minimal";
import * as views from "koa-views";
import "reflect-metadata";
import "./lib/db";
// tslint:disable-next-line:no-var-requires
const sessionStore: any = require("koa-sqlite3-session");
import * as mount from "koa-mount";
import * as serve from "koa-static";
import { dbPath } from "./lib/config";
import log from "./lib/log";
import router from "./routes";

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
      "admin-menu": "./partials/admin-menu",
      "card": "./partials/card",
      "footer": "./partials/footer",
      "header": "./partials/header",
      "html-foot": "./partials/html-foot",
      "html-head": "./partials/html-head",
      "sidebar": "./partials/sidebar",
    },
  },
}));
// TODO: logger
app.use(bodyParser());
app.use(session({
  store: new sessionStore(dbPath),
}));
app.use(mount("/js", serve(`./node_modules/material-design-lite/dist`)));
app.use(mount("/css",
  serve(`./node_modules/material-design-lite/dist`)));
app
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
