"use strict";

import Router = require("koa-router");
const router = new Router();
import config from "../lib/config";
import User from "../models/user";
import Announce from "../models/announce";
import { connection } from "../lib/db";
import log from "../lib/log";
import { announce as announceMail } from "../lib/email";
import checkAuth from "./checkAuth";

const site = {
  title: config.get("site_title"),
};
router.use("/", async (ctx, next) => {
  await checkAuth(ctx, false);
  if (ctx.user.isAdmin) {
    await next();
  } else {
    ctx.redirect("/dashboard");
  }
});
router.get("/", async (ctx) => {
  await ctx.render("admin-index", {
    site: { ...site },
  });
});
// TODO: support announce update
router.get("/announces", async (ctx) => {
  await ctx.render("admin-announces", {
    site: { ...site },
  });
});
router.post("/announces", async (ctx) => {
  const announce = new Announce(ctx.request.body.title, ctx.request.body.content);
  await connection.getRepository(Announce).persist(announce);
  const users = await connection.getRepository(User).find();
  // TODO: use job queues
  await announceMail(announce, users);
  // TODO: better appearance
  ctx.response.status = 200;
  ctx.response.type = "text/html";
  ctx.response.body = `Succeeded.<a href="/admin">Go back</a>`;
});

export default router;
