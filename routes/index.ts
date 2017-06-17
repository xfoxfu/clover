"use strict";
/// <reference path="../typings/filesize.d.ts" />

import Router = require("koa-router");
const router = new Router();
import config from "../lib/config";
import User from "../models/user";
import Announce from "../models/announce";
import { connection } from "../lib/db";
import log from "../lib/log";
import { announce as announceMail } from "../lib/email";
// tslint:disable-next-line:no-var-requires
const filesize: any = require("filesize");
import checkAuth from "./checkAuth";

import muRouter from "./mu";
import adminRouter from "./admin";

declare module "koa" {
  // tslint:disable-next-line
  interface Context {
    user: User;
  }
}

const site = {
  title: config.get("site_title"),
};

router.get("/", async (ctx) => {
  await checkAuth(ctx, true, false);
  await ctx.render("index", {
    site: { ...site },
  });
});
router.post("/login", async (ctx) => {
  if ((!ctx.request.body.email) || (!ctx.request.body.password)) {
    // TODO: better output
    ctx.throw(400);
  } else {
    const user = await connection.getRepository(User).findOne({
      email: ctx.request.body.email,
    });
    // TODO check the two
    if (!user || !(await user.checkPassword(ctx.request.body.password))) {
      // TODO: better output
      ctx.throw(403);
    } else {
      ctx.session.uid = user.id;
      ctx.response.redirect("/dashboard");
    }
  }
});
router.post("/reg", async (ctx, next) => {
  if ((!ctx.request.body.email) ||
    (!ctx.request.body.password) ||
    (!ctx.request.body.password2)) {
    // TODO: better output
    ctx.throw(400);
  } else if (ctx.request.body.password !== ctx.request.body.password2) {
    // TODO: better output
    ctx.throw(400, "password and password2 mismatch");
  } else {
    const user = new User(ctx.request.body.email);
    await user.setPassword(ctx.request.body.password);
    user.setConnPassword();
    await user.allocConnPort();
    await connection.getRepository(User).persist(user);
    ctx.session.uid = user.id;
    ctx.response.redirect("/dashboard");
  }
});
router.get("/dashboard", async (ctx) => {
  await checkAuth(ctx, false);
  const cards = [];
  {
    const announces = await connection.getRepository(Announce)
      .find({ take: 2, order: { updatedAt: "DESC" } });
    for (const announce of announces) {
      cards.push({ isAnnouncement: true, ...announce });
    }
  }
  cards.sort((a, b) => (a.updatedAt > b.createdAt ? -1 : 1));
  await ctx.render("dashboard", {
    site: { ...site },
    // TODO: change these to real
    user: { email: ctx.user.email },
    bandwidth: {
      used: filesize(ctx.user.bandwidthUsed),
      start: config.get("bandwidth_start"),
    },
    // tslint:disable-next-line:object-literal-shorthand
    cards: cards,
  });
});
router.get("/updates", async (ctx) => {
  await checkAuth(ctx, false);
  const cards: any = await connection.getRepository(Announce)
    .find({ take: 10, order: { updatedAt: "DESC" } });
  for (const card of cards) {
    card.isAnnouncement = true;
  }
  await ctx.render("updates", {
    site: { ...site },
    user: { email: ctx.user.email },
    // TODO: change these to real
    bandwidth: {
      used: filesize(ctx.user.bandwidthUsed),
      start: config.get("bandwidth_start"),
    },
    // tslint:disable-next-line:object-literal-shorthand
    cards: cards,
  });
});
router.get("/logout", (ctx) => {
  ctx.session = null;
  ctx.response.redirect("/");
});
router.get("/reset_password", async (ctx) => {
  await checkAuth(ctx, false);
  await ctx.render("reset-password", {
    site: { ...site },
    user: { email: ctx.user.email },
    // TODO: change these to real
    bandwidth: {
      used: filesize(ctx.user.bandwidthUsed),
      start: config.get("bandwidth_start"),
    },
  });
});
router.post("/reset_password", async (ctx) => {
  await checkAuth(ctx, false);
  if (!await ctx.user.checkPassword(ctx.request.body.current)) {
    // TODO: better appearance
    ctx.throw(401);
  } else {
    if (ctx.request.body.new !== ctx.request.body.new2) {
      // TODO: better appearance
      ctx.throw(400);
    } else {
      ctx.user.setPassword(ctx.request.body.new);
      await connection.getRepository(User).persist(ctx.user);
      ctx.redirect("/dashboard");
    }
  }
});
router.get("/reset_password_email", async (ctx) => {
  await ctx.render("reset-password-email");
});
router.post("/reset_password_email", async (ctx) => {
  ctx.throw(501);
});
router.get("/reset_password_email_callback", async (ctx) => {
  await ctx.render("reset-password-email-callback");
});
router.post("/reset_password_email_callback", async (ctx) => {
  ctx.throw(501);
});

router.use("/admin", adminRouter.routes(), adminRouter.allowedMethods());
router.use("/mu/v2", muRouter.routes(), muRouter.allowedMethods());

export default router;
