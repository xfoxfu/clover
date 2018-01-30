"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const mount = require("koa-mount");
const serve = require("koa-static");
const server_1 = require("./server/server");
const app = new Koa();
app.use(mount(server_1.default));
app.use(mount("/app", serve("./client/build")));
exports.default = app;
//# sourceMappingURL=index.js.map