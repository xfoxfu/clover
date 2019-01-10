import { Module } from "@nestjs/common";
import envalid, { bool, email, json, num, port, str, url } from "envalid";

interface IEnvironment extends envalid.CleanEnv {
  DB_PATH: string;
  LOG_LEVEL: string;
  PORT: number;
  PASSWORD_HASH_ROUNDS: number;
  SITE_TITLE: string;
  OPEN_REGISTER: boolean;
  SENDGRID_KEY: string;
  SENDGRID_EMAIL: string;
  JWT_KEY: string;
  SITE_URL: string;
  ADMIN_EMAIL: string;
  PROXY_HOST: string;
  DEFAULT_ENCRYPTION: string;
  PORT_START: number;
  MU_TOKEN: string;
  SS_ENABLED: boolean;
  VMESS_ENABLED: boolean;
  VMESS_DEFAULT_ALTERID: string;
  VMESS_PORT: number;
  VMESS_PORT_DYNAMIC: string;
  VMESS_NETWORK: string;
  VMESS_TCP_HEADER_TYPE: string;
  VMESS_KCP_UP_CAP: string;
  VMESS_KCP_DOWN_CAP: string;
  VMESS_KCP_CONGESTION: boolean;
  VMESS_KCP_HEADER: string;
  VMESS_WS_PATH: string;
  VMESS_WS_HOST: string;
  VMESS_WS_HEADERS: string;
  VMESS_TLS: string;
  VMESS_TLS_SERVER: string;
  VMESS_TLS_CERT_TRUST: boolean;
  VMESS_TLS_CERT: string;
  VMESS_TLS_KEY: string;
  SENTRY_URL: string;
}

export class ConfigService {
  private readonly envConfig: IEnvironment;

  constructor() {
    this.envConfig = envalid.cleanEnv<
      {
        [K in Exclude<
          keyof IEnvironment,
          keyof envalid.CleanEnv
        >]: IEnvironment[K]
      }
    >(
      process.env,
      {
        DB_PATH: str({ default: "clover.db" }),
        LOG_LEVEL: str({
          default: "info",
          choices: ["error", "warn", "info", "debug", "trace"],
        }),
        PORT: port({ default: 3000 }),
        PASSWORD_HASH_ROUNDS: num({ default: 12, devDefault: 1 }),
        SITE_TITLE: str({ default: "Clover" }),
        OPEN_REGISTER: bool({ default: false }),
        SENDGRID_KEY: str({ default: "KEY" }),
        SENDGRID_EMAIL: str({ default: "clover@example.com" }),
        JWT_KEY: str({ default: "527877cb" }),
        SITE_URL: str({ default: "http://127.0.0.1:3000" }),
        ADMIN_EMAIL: str({ default: "user@example.com" }),
        PROXY_HOST: str({ default: "127.0.0.1" }),
        DEFAULT_ENCRYPTION: str({ default: "chacha20-ietf-poly1305" }),
        PORT_START: port({ default: 10000 }),
        MU_TOKEN: str({ default: "d6d0fbdc9483c27e6b653457879d3fbd" }),
        SS_ENABLED: bool({ default: true }),
        VMESS_ENABLED: bool({ default: true }),
        VMESS_DEFAULT_ALTERID: str({ default: "16" }),
        VMESS_PORT: port({ default: 443 }),
        VMESS_PORT_DYNAMIC: str({ default: "" }),
        VMESS_NETWORK: str({ default: "ws" }),
        VMESS_TCP_HEADER_TYPE: str({ default: "none" }),
        VMESS_KCP_UP_CAP: str({ default: "5" }),
        VMESS_KCP_DOWN_CAP: str({ default: "20" }),
        VMESS_KCP_CONGESTION: bool({ default: false }),
        VMESS_KCP_HEADER: str({ default: "none" }),
        VMESS_WS_PATH: str({ default: "/" }),
        VMESS_WS_HOST: str({ default: "" }),
        VMESS_WS_HEADERS: str({ default: "{}" }),
        VMESS_TLS: str({ default: "out" }),
        VMESS_TLS_SERVER: str({ default: "" }),
        VMESS_TLS_CERT_TRUST: bool({ default: true }),
        VMESS_TLS_CERT: str({ default: "server.crt" }),
        VMESS_TLS_KEY: str({ default: "server.key" }),
        SENTRY_URL: url({ default: "" }),
      },
      { strict: true },
    );
  }

  public get<K extends keyof IEnvironment>(key: K): IEnvironment[K] {
    return this.envConfig[key];
  }

  public get SOURCE_URL(): string {
    return "https://github.com/coderfox/clover";
  }

  public get SHADOWSOCKS() {
    return {
      enabled: this.get("SS_ENABLED"),
      defaultEncryption: this.get("DEFAULT_ENCRYPTION"),
      portStart: this.get("PORT_START"),
      muToken: this.get("MU_TOKEN"),
      host: this.get("PROXY_HOST"),
    };
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
