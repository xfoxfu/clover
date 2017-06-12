"use strict";

import Router = require("koa-router");
const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.throw(501);
});

export = router;
