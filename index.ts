"use strict";

import * as Koa from "koa";
import * as mount from "koa-mount";
import * as serve from "koa-static";

import server from "./server/server";

const app = new Koa();

app.use(mount(server));
app.use(mount("/app", serve("./client/build")));

export default app;
