"use strict";

import Router = require("koa-router");
const router = new Router();
import * as config from "../lib/config";
import User from "../models/user";
import Announcement from "../models/announcement";
import { connection } from "../lib/db";
import log from "../lib/log";

declare module "koa" {
  // tslint:disable-next-line
  interface Context {
    user: User;
  }
}

const site = {
  title: config.get("site_title"),
};
const checkAuth = async (ctx: Router.IRouterContext, redirectDashboard = true, redirectIndex = true) => {
  let authorized = false;
  if (ctx.session.uid) {
    const result = await connection.getRepository(User).findOneById(ctx.session.uid);
    if (result) {
      ctx.user = result;
      authorized = true;
    }
  }
  if (authorized) {
    if (redirectDashboard) {
      ctx.redirect("/dashboard");
    }
  } else {
    if (redirectIndex) {
      ctx.redirect("/");
    }
  }
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
    const announces = await connection.getRepository(Announcement)
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
    bandwidth: { used: "N/A", start: "Jan. 1, 2017" },
    // tslint:disable-next-line:object-literal-shorthand
    cards: cards,
  });
});
router.get("/updates", async (ctx) => {
  await checkAuth(ctx, false);
  await ctx.render("updates", {
    site: { ...site },
    user: { email: ctx.user.email },
    // TODO: change these to real
    bandwidth: { used: "N/A", start: "Jan. 1, 2017" },
    updates: await connection.getRepository(Announcement)
      .find({ take: 10, order: { updatedAt: "DESC" } }),
  });
});
router.get("/logout", (ctx) => {
  ctx.session = null;
  ctx.response.redirect("/");
});

export = router;
