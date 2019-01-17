"use strict";

import Router = require("koa-router");
const router = new Router();
import { siteTitle } from "../lib/config";
import { connection } from "../lib/db";
import { announce as announceMail } from "../lib/email";
import Announce from "../models/announce";
import User from "../models/user";
import checkAuth from "./checkAuth";
import { encode } from "../lib/jwt";
import * as MarkdownIt from "markdown-it";
const md = new MarkdownIt();

const site = {
  title: siteTitle,
};
router.use("/", async (ctx, next) => {
  await checkAuth(ctx, false);
  if (ctx.user.isAdmin) {
    await next();
  } else {
    ctx.redirect("/dashboard");
  }
});
router.get("/", async ctx => {
  await ctx.render("admin-index", {
    users: (await connection.getRepository(User).find()).map(value => ({
      email: value.email,
      note: value.note,
    })),
    site,
  });
});
// TODO: support announce update
router.get("/announces", async ctx => {
  await ctx.render("admin-announces", {
    site,
  });
});
router.post("/announces", async ctx => {
  const announce = new Announce(
    ctx.request.body.title,
    md.render(ctx.request.body.content)
  );
  await connection.getRepository(Announce).save(announce);
  const users = await connection.getRepository(User).find();
  // TODO: use job queues
  await announceMail(announce, users);
  // TODO: better appearance
  ctx.response.status = 200;
  ctx.response.type = "text/html";
  ctx.response.body = `Succeeded.<a href="/admin">Go back</a>`;
});
router.get("/refcode", async ctx => {
  await ctx.render("admin-refcode", {
    site,
  });
});
router.post("/refcode", async ctx => {
  await ctx.render("admin-refcode", {
    site,
    code: await encode({
      email: ctx.request.body.email,
      note: ctx.request.body.note,
    }),
  });
});

export default router;
