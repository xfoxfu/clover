"use strict";

import Router = require("koa-router");
const router = new Router();
import config from "../lib/config";
import { connection } from "../lib/db";
import { announce as announceMail } from "../lib/email";
import Announce from "../models/announce";
import User from "../models/user";
import checkAuth from "./checkAuth";
// tslint:disable-next-line:no-var-requires
const filesize: any = require("filesize");

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
    users: (await connection.getRepository(User).find()).map((value) => ({
      email: value.email,
      pass: value.connPassword,
      port: value.connPort,
      enc: value.connEnc,
      band: filesize(value.bandwidthUsed),
      money: Math.ceil(value.bandwidthUsed / 1024 / 1024 / 1024 / 5) * 14.4,
      note: value.note,
    })),
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
router.get("/v2ray.json", (ctx) => {
  ctx.response.body = JSON.stringify({
    "log": {
        "access": "/var/log/v2ray/access.log",
        "error": "/var/log/v2ray/error.log",
        "loglevel": "warning"
    },
    "inbound": {
        "port": 443,
        "protocol": "vmess",
        "settings": {
            "clients": (await connection.getRepository(User).find()).map((value) => ({
      email: value.email,
      id: value.vmessId,
      alterId: value.vmessAlterId
    }))
        },
        "streamSettings": {
          "network": "ws",
            "wsSettings": {
              "path": "/",
              "headers": {
                "Host": config.get("ss_host")
            }
          }
        }
    },
    "outbound": {
        "protocol": "freedom",
        "settings": {}
    },
    "inboundDetour": [],
    "outboundDetour": [
        {
            "protocol": "blackhole",
            "settings": {},
            "tag": "blocked"
        }
    ],
    "routing": {
        "strategy": "rules",
        "settings": {
            "rules": [
                {
                    "type": "field",
                    "ip": [
                        "0.0.0.0/8",
                        "10.0.0.0/8",
                        "100.64.0.0/10",
                        "127.0.0.0/8",
                        "169.254.0.0/16",
                        "172.16.0.0/12",
                        "192.0.0.0/24",
                        "192.0.2.0/24",
                        "192.168.0.0/16",
                        "198.18.0.0/15",
                        "198.51.100.0/24",
                        "203.0.113.0/24",
                        "::1/128",
                        "fc00::/7",
                        "fe80::/10"
                    ],
                    "outboundTag": "blocked"
                }
            ]
        }
    }
});
});

export default router;
