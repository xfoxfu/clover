"use strict";
/// <reference path="../typings/filesize.d.ts" />

import Router = require("koa-router");
const router = new Router();
import config from "../lib/config";
import { connection } from "../lib/db";
import { resetPassword as resetPasswordMail } from "../lib/email";
import log from "../lib/log";
import Announce from "../models/announce";
import User from "../models/user";
import { decode } from "../lib/jwt";
import checkAuth from "./checkAuth";
import { getClientConfig, writeServerConfig } from "../lib/vmess";

import adminRouter from "./admin";
import muRouter from "./mu";

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
router.post("/reg", async (ctx) => {
  if ((!ctx.request.body.email) ||
    (!ctx.request.body.password) ||
    (!ctx.request.body.password2) ||
    (!ctx.request.body.refcode)) {
    // TODO: better output
    ctx.throw(400);
  }
  const refData = await decode<any>(ctx.request.body.refcode);
  if (ctx.request.body.password !== ctx.request.body.password2) {
    // TODO: better output
    ctx.throw(400, "password and password2 mismatch");
  } else if (refData.email !== ctx.request.body.email) {
    ctx.throw(400, "invalid refcode");
  } else {
    const user = new User(ctx.request.body.email);
    user.note = refData.note;
    await user.setPassword(ctx.request.body.password);
    user.setConnPassword();
    await user.allocConnPort();
    await connection.getRepository(User).save(user);
    // TODO: move this to database subscriber
    await writeServerConfig();
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
    user: {
      ...ctx.user,
      connPort: ctx.user.connPort,
      connPassword: ctx.user.connPassword,
      connUri: new Buffer(`${
        ctx.user.connEnc}:${
        ctx.user.connPassword}@${
        config.get("ss_host")}:${
        ctx.user.connPort}`).toString("base64"),
      vmess: {
        id: ctx.user.vmessUid,
        alterId: ctx.user.vmessAlterId,
        androidLink: new Buffer(JSON.stringify({
          add: config.get("ss_host"),
          aid: ctx.user.vmessAlterId,
          host: `/;${config.get("ss_host")}`,
          id: ctx.user.vmessUid,
          net: "ws",
          port: "443",
          ps: site.title,
          tls: "tls",
          type: "none",
        })).toString("base64"),
        link: {
          android: Buffer.from(JSON.stringify({
            add: config.get("ss_host"),
            aid: ctx.user.vmessAlterId,
            host: `/;${config.get("ss_host")}`,
            id: ctx.user.vmessUid,
            net: "ws",
            port: "443",
            ps: site.title,
            tls: "tls",
            type: "none",
          })).toString("base64"),
          win: Buffer.from(JSON.stringify({
            "ps": site.title,
            "add": config.get("ss_host"),
            "port": "443",
            "id": ctx.user.vmessUid,
            "aid": ctx.user.vmessAlterId,
            "net": "ws",
            "type": "none",
            "host": `/;${config.get("ss_host")}`,
            "tls": "tls"
          })).toString("base64"),
          ios: `${Buffer.from(
            `chacha20-poly1305:${ctx.user.vmessUid}@${config.get("ss_host")}:443}`
          )}?network=ws&remark=${site.title}&wspath=/&tls=1&allowInsecure=0`
        }
      },
    },
    cards,
    server: config.get("ss_host"),
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
    site,
    user: { email: ctx.user.email },
    cards,
  });
});
router.get("/logout", (ctx) => {
  ctx.session = null;
  ctx.response.redirect("/");
});
router.get("/reset_password", async (ctx) => {
  await checkAuth(ctx, false);
  await ctx.render("reset-password", {
    site,
    user: { email: ctx.user.email },
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
      await ctx.user.setPassword(ctx.request.body.new);
      await connection.getRepository(User).save(ctx.user);
      ctx.redirect("/dashboard");
    }
  }
});
router.post("/reset_password_email", async (ctx) => {
  const user = await connection.getRepository(User).findOne({ email: ctx.request.body.email });
  if (!user) {
    ctx.throw(404);
  } else {
    await resetPasswordMail(user);
    // TODO: better appearance
    ctx.response.status = 200;
    ctx.response.type = "text/html";
    ctx.response.body = `Succeeded.<a href= "/" > Go back< /a > `;
  }
});
router.get("/reset_password_email_callback", async (ctx) => {
  if (!ctx.request.query.token) {
    ctx.throw(400);
  }
  let token: any;
  try {
    token = await decode(ctx.request.query.token);
  } catch (err) {
    log.error(err, { action: "decode token", token: ctx.request.query.token });
    if (err.name === "") {
      ctx.throw(403);
    }
  }
  if (!token.email) {
    ctx.throw(400);
  }
  await ctx.render("reset-password-email-callback", {
    site,
    email: token.email,
    token: ctx.request.query.token,
  });
});
router.post("/reset_password_email_callback", async (ctx) => {
  const user = await connection.getRepository(User).findOneById(
    (await decode<any>(ctx.request.body.token)).uid,
  );
  if (!user) {
    ctx.throw(404);
  } else {
    if (!ctx.request.body.password) {
      ctx.throw(400);
    }
    if (ctx.request.body.password !== ctx.request.body.password2) {
      ctx.throw(400);
    }
    await user.setPassword(ctx.request.body.password);
    await connection.getRepository(User).save(user);
    // TODO: better appearance
    ctx.response.status = 200;
    ctx.response.type = "text/html";
    ctx.response.body = `Succeeded.<a href= "/" > Go login< /a>`;
  }
});
router.get("/v2ray_config.json", (ctx) => {
  ctx.set("Content-Type", "application/force-download");
  ctx.set("Content-disposition", "attachment; filename=v2ray_config.json");
  ctx.response.body = getClientConfig(ctx.query.id, +ctx.query.aid);
});

router.use("/admin", adminRouter.routes(), adminRouter.allowedMethods());
router.use("/mu/v2", muRouter.routes(), muRouter.allowedMethods());

export default router;
