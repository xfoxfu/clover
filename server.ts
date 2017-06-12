"use strict";

import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as session from "koa-session-minimal";
import * as views from "koa-views";
import "reflect-metadata";
/* tslint:disable:no-var-requires */
const sessionStore: any = require("koa-sqlite3-session");
/* tslint:enable:no-var-requires */
import * as logger from "koa-logger";
import * as mount from "koa-mount";
import * as serve from "koa-static";
import * as config from "./lib/config";
import * as router from "./routes";

const app = new Koa();

app.use(async (ctx: Koa.Context, next: () => any) => {
  try {
    await next();
    // Handle 404 upstream.
    const status = ctx.status || 404;
    if (status !== 200) {
      ctx.throw(status);
    }
  } catch (error) {
    ctx.status = error.status || 500;
    if (ctx.status === 404) {
      await ctx.render("error/error", { error });
    }
    ctx.app.emit("error", error, ctx);
  }
});
app.use(views(`${__dirname}/views`, {
  map: {
    html: "handlebars",
  },
}));
app.use(logger());
app.use(bodyParser());
app.use(session({
  store: new sessionStore(config.get("db_path")),
}));
app.use(mount("/js/material.min.js", serve(`./node_modules/material-design-lite/material.min.js`)));
app.use(mount("/css/material.min.css",
  serve(`./node_modules/material-design-lite/dist/material.lime-indigo.min.css`)));
app
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
