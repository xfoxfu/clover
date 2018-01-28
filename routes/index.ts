"use strict";
/// <reference path="../typings/filesize.d.ts" />

import Router = require("koa-router");
const router = new Router();
import { Context } from "koa";
import { sourceCodeUrl, siteTitle, adminEmail, proxyHost, openRegister, vmess, shadowsocks } from "../lib/config";
import { connection } from "../lib/db";
import { resetPassword as resetPasswordMail } from "../lib/email";
import log from "../lib/log";
import Announce from "../models/announce";
import User from "../models/user";
import { decode } from "../lib/jwt";
import checkAuth from "./checkAuth";
import { getClientConfig, writeServerConfig } from "../lib/vmess";
//  tslint:disable-next-line:no-var-requires
const makeQrCode: (text: string) => Promise<string> = require("qrcode").toDataURL;

import adminRouter from "./admin";
import muRouter from "./mu";

declare module "koa" {
  // tslint:disable-next-line
  interface Context {
    user: User;
  }
}

const buildRenderParams = async (user?: User, cards?: any[], data?: any) => ({
  site: {
    title: siteTitle,
    admin: adminEmail,
    source: sourceCodeUrl,
    reg: openRegister,
  },
  user: user ? {
    ...user,
    ss: {
      ...shadowsocks,
      port: user.connPort,
      encryption: user.connEnc,
      password: user.connPassword,
      uri: new Buffer(`${
        user.connEnc}:${
        user.connPassword}@${
        shadowsocks.host}:${
        user.connPort}`).toString("base64"),
      qrcode: await makeQrCode("ss://" + Buffer.from(`${
        user.connEnc}:${
        user.connPassword}@${
        shadowsocks.host}:${
        user.connPort}`).toString("base64")),
    },
    vmess: {
      ...vmess,
      webSocket: {
        ...vmess.webSocket,
        headersJson: JSON.stringify(vmess.webSocket.headers),
      },
      tcpHeaderJson: JSON.stringify(vmess.tcp.header),
      remark: siteTitle,
      id: user.vmessUid,
      aid: user.vmessAlterId,
      link: {
        android: Buffer.from(JSON.stringify({
          add: proxyHost,
          aid: user.vmessAlterId,
          host: `${vmess.webSocket.path};${proxyHost}`,
          id: user.vmessUid,
          net: vmess.network,
          port: vmess.port,
          ps: siteTitle,
          tls: vmess.tls.status === "off" ? "" : "tls",
          type: vmess.network === "tcp" ?
            vmess.tcp.header.type : (vmess.network === "kcp" ?
              vmess.kcp.header.type : "none"),
        })).toString("base64"),
        win: Buffer.from(JSON.stringify({
          add: proxyHost,
          aid: user.vmessAlterId,
          host: `${vmess.webSocket.path};${proxyHost}`,
          id: user.vmessUid,
          net: vmess.network,
          port: vmess.port,
          ps: siteTitle,
          tls: vmess.tls.status === "off" ? "" : "tls",
          type: vmess.network === "tcp" ?
            vmess.tcp.header.type : (vmess.network === "kcp" ?
              vmess.kcp.header.type : "none"),
        })).toString("base64"),
        shadowrocket: `${Buffer.from(
          `chacha20-poly1305:${user.vmessUid}@${proxyHost}:${vmess.port}`,
        ).toString("base64")}?obfsParam=${
        vmess.webSocket.host}&path=${
        vmess.network === "ws" ? vmess.webSocket.path : vmess.tcp.header.type}&obfs=${vmess.network === "ws" ?
          "websocket" : (vmess.network === "tcp" ?
            vmess.tcp.header.type : "none")}&tls=${
        vmess.tls.status === "off" ? 0 : 1}`,
      },
      qrcode: {
        kitsunebi: await makeQrCode(
          "vmess://" +
          Buffer.from(`chacha20-poly1305:${user.vmessUid}@${proxyHost}:${vmess.port}`).toString("base64") +
          `?network=${vmess.network}` +
          (vmess.network === "ws" ? `&wspath=${vmess.webSocket.path}` : "") +
          `&tls=${
          vmess.tls.status === "off" ? 0 : 1
          }&allowInsecure=${
          vmess.tls.cert.trust ? 0 : 1
          }&remark=${siteTitle}`,
        ),
      },
    },
  } : undefined,
  cards,
  ...data,
});
const render = async (ctx: Context, template: string, cards?: any[], data?: any) => {
  const locals = await buildRenderParams(ctx.user, cards, data);
  log.debug(`rendering ${template}`, locals);
  await ctx.render(template, locals);
};

router.get("/", async (ctx) => {
  await checkAuth(ctx, true, false);
  await ctx.render("index", await buildRenderParams());
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
    (!ctx.request.body.password2)) {
    // TODO: better output
    ctx.throw(400);
  }
  if (!(openRegister || ctx.request.body.refcode)) {
    ctx.throw(400);
  }
  const user = new User(ctx.request.body.email);
  await user.setPassword(ctx.request.body.password);
  user.setConnPassword();
  await user.allocConnPort();
  if (!openRegister) {
    const refData = await decode<any>(ctx.request.body.refcode);
    if (ctx.request.body.password !== ctx.request.body.password2) {
      // TODO: better output
      ctx.throw(400, "password and password2 mismatch");
    } else if (refData.email !== ctx.request.body.email) {
      ctx.throw(400, "invalid refcode");
      user.note = refData.note;
    }
  }
  await connection.getRepository(User).save(user);
  // TODO: move this to database subscriber
  await writeServerConfig();
  ctx.session.uid = user.id;
  ctx.response.redirect("/dashboard");
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
  await render(ctx, "dashboard", cards);
});
router.get("/updates", async (ctx) => {
  await checkAuth(ctx, false);
  const cards: any = await connection.getRepository(Announce)
    .find({ take: 10, order: { updatedAt: "DESC" } });
  for (const card of cards) {
    card.isAnnouncement = true;
  }
  await ctx.render("updates", await buildRenderParams(ctx.user, cards));
});
router.get("/logout", (ctx) => {
  ctx.session = null;
  ctx.response.redirect("/");
});
router.get("/reset_password", async (ctx) => {
  await checkAuth(ctx, false);
  await ctx.render("reset-password", await buildRenderParams(ctx.user));
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
  await ctx.render("reset-password-email-callback", await buildRenderParams(undefined, undefined, {
    email: token.email,
    token: ctx.request.query.token,
  }));
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
