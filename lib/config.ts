"use strict";

import log from "./log";

const getEnv = (key: string, value: string): string => process.env[key.toUpperCase()] || value;
const getEnvBoolean = (key: string, value = true) => getEnv(key, value ? "true" : "false").toLowerCase() === "true";

export const dbPath = getEnv("DB_PATH", "./clover.db");
export const logLevel = getEnv("LOG_LEVEL", "debug");
export const port = +getEnv("PORT", "3000");
export const passwordHashRounds = +getEnv("PASSWORD_HASH_ROUNDS", "12");
export const siteTitle = getEnv("SITE_TITLE", "Clover");
export const sendgrid = {
  key: getEnv("SENDGRID_KEY", "KEY"),
  email: getEnv("SENDGRID_EMAIL", "clover@example.com"),
};
export const jwtKey = getEnv("JWT_KEY", "527877cb");
export const siteUrl = getEnv("SITE_URL", "http://127.0.0.1:3000");
export const adminEmail = getEnv("ADMIN_EMAIL", "user@example.com");
export const proxyHost = getEnv("PROXY_HOST", "127.0.0.1");
// TODO: deprecate shadowsocksDefaultEncryption, shadowsocksMuToken and shadowsocksPortStart
export const shadowsocksDefaultEncryption = getEnv("DEFAULT_ENCRYPTION", "chacha20-ietf-poly1305");
export const shadowsocksPortStart = +getEnv("PORT_START", "10000");
export const shadowsocksMuToken = getEnv("MU_TOKEN", "d6d0fbdc9483c27e6b653457879d3fbd");
export const shadowsocks = {
  enabled: getEnvBoolean("SS_ENABLED"),
  defaultEncryption: shadowsocksDefaultEncryption,
  portStart: shadowsocksPortStart,
  muToken: shadowsocksMuToken,
  host: proxyHost,
};
export const vmess = {
  enabled: getEnvBoolean("VMESS_ENABLED"),
  host: proxyHost,
  defaultAlterId: +getEnv("VMESS_DEFAULT_ALTERID", "16"),
  port: +getEnv("VMESS_PORT", "443"),
  // write a range of ports, or leave it blank for not enable this feature
  dynamicPort: getEnv("VMESS_PORT_DYNAMIC", ""),
  // possible values are: tcp, kcp and ws
  network: getEnv("VMESS_NETWORK", "ws"),
  tcp: {
    header: JSON.parse(getEnv("VMESS_TCP_HEADER", JSON.stringify({ type: "none" }))),
  },
  webSocket: {
    path: getEnv("VMESS_WS_PATH", "/"),
    host: getEnv("VMESS_WS_HOST", proxyHost),
    headers: JSON.parse(getEnv("VMESS_WS_HEADERS", "{}")),
  },
  tls: {
    status: getEnv("VMESS_TLS", "out"),
    server: getEnv("VMESS_TLS_SERVER", "example.com"),
    cert: {
      trust: getEnvBoolean("VMESS_TLS_CERT_TRUST"),
      certificateFile: getEnv("VMESS_TLS_CERT", "server.crt"),
      keyFile: getEnv("VMESS_TLS_KEY", "server.key"),
    },
  },
};

log.debug("configuration loaded", exports);
