"use strict";

import User from "../models/user";
import { getConnection } from "typeorm";
import { proxyHost } from "./config";
import { writeFile } from "fs-extra";
import { reload } from "./docker";

export const getClientConfig = (id: string, aid: number) => ({
  log: {
    loglevel: "warning",
  },
  inbound: {
    listen: "127.0.0.1",
    port: 1080,
    protocol: "socks",
    settings: {
      auth: "noauth",
      udp: true,
      ip: "127.0.0.1",
    },
  },
  outbound: {
    protocol: "vmess",
    settings: {
      vnext: [{
        address: proxyHost,
        port: 443,
        users: [{
          id,
          alterId: aid,
        }],
      }],
    },
    mux: {
      enabled: true,
      concurrency: 8,
    },
    streamSettings: {
      network: "ws",
      security: "tls",
      tlsSettings: {
        serverName: proxyHost,
        allowInsecure: false,
      },
      wsSettings: {
        path: "/",
        headers: {
          Host: proxyHost,
        },
      },
    },
  },
  outboundDetour: [{
    protocol: "freedom",
    settings: {},
    tag: "direct",
  }],
  routing: {
    strategy: "rules",
    settings: {
      rules: [{
        type: "field",
        port: "54-79",
        outboundTag: "direct",
      }, {
        type: "field",
        port: "81-442",
        outboundTag: "direct",
      }, {
        type: "field",
        port: "444-65535",
        outboundTag: "direct",
      }, {
        type: "field",
        domain: ["gc.kis.scr.kaspersky-labs.com"],
        outboundTag: "direct",
      }, {
        type: "chinasites",
        outboundTag: "direct",
      }, {
        type: "field",
        ip: [
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
          "fe80::/10",
        ],
        outboundTag: "direct",
      }, {
        type: "chinaip",
        outboundTag: "direct",
      }],
    },
  },
});
export const getServerConfig = async () => ({
  log: {
    access: "/var/log/v2ray/access.log",
    error: "/var/log/v2ray/error.log",
    loglevel: "warning",
  },
  inbound: {
    port: 443,
    protocol: "vmess",
    settings: {
      clients: (await getConnection().getRepository(User).find())
        .filter((value) => value.enabled)
        .map((value) => ({
          email: value.email,
          id: value.vmessUid,
          alterId: value.vmessAlterId,
        })),
    },
    streamSettings: {
      network: "ws",
      wsSettings: {
        path: "/",
        headers: {
          Host: proxyHost,
        },
      },
    },
  },
  outbound: {
    protocol: "freedom",
    settings: {},
  },
  inboundDetour: [],
  outboundDetour: [
    {
      protocol: "blackhole",
      settings: {},
      tag: "blocked",
    },
  ],
  routing: {
    strategy: "rules",
    settings: {
      rules: [
        {
          type: "field",
          ip: [
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
            "fe80::/10",
          ],
          outboundTag: "blocked",
        },
      ],
    },
  },
});
export const writeServerConfig = async () => {
  await writeFile(`${__dirname}/../config/v2ray_server.json`, JSON.stringify(await getServerConfig()));
  await reload();
};
