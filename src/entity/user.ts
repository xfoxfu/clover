"use strict";

import * as bcrypt from "bcrypt";
import {
  Column,
  CreateDateColumn,
  Entity,
  FindOneOptions,
  getConnection,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import uuid from "uuid/v4";
import IUser from "~/common/interfaces/user";

const generatePassword = () => {
  const length = 8;
  const charset = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

@Entity()
export class User {
  public get connPassword(): string {
    return this.ssPassword;
  }
  public get connPort(): number {
    return this.ssPort;
  }
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column({ type: "text", nullable: true })
  public note?: string;
  @Column({ length: 50, nullable: false, unique: true })
  public email: string;
  @Column({ name: "password", type: "varchar" })
  public hashedPassword!: string;
  @Column({ name: "ss_enc", type: "varchar", length: 25 })
  public connEnc = shadowsocksDefaultEncryption;
  @Column({ name: "vmess_uid", nullable: true })
  public vmessUid: string;
  @Column({ type: "int", name: "vmess_alter_id", nullable: true })
  public vmessAlterId = 16;
  @Column({ name: "is_admin" })
  public isAdmin: boolean = false;
  @Column({ name: "is_email_verified" })
  public isEmailVerified: boolean = false;
  @Column()
  public enabled: boolean = true;
  @CreateDateColumn()
  public createdAt!: Date;
  @UpdateDateColumn()
  public updatedAt!: Date;
  @Column({ name: "ss_password", type: "varchar", length: 10 })
  private ssPassword!: string;
  @Column({ name: "ss_port", type: "int" })
  private ssPort!: number;
  constructor(email: string) {
    this.email = email;
    if (email === config.adminEmail) {
      this.isAdmin = true;
    }
    this.vmessUid = uuid();
  }
  public setPassword = async (password: string) => {
    this.hashedPassword = await bcrypt.hash(password, passwordHashRounds);
  };
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashedPassword);
  public setConnPassword = () => {
    return (this.ssPassword = generatePassword());
  };
  public allocConnPort = async () => {
    const user = await getConnection()
      .getRepository(User)
      .findOne({
        order: {
          ssPort: "DESC",
        },
      } as FindOneOptions<User>);
    if (!user) {
      // TODO: rename port_last_allocated to port_start
      this.ssPort = shadowsocksPortStart + 1;
    } else {
      this.ssPort = user.ssPort + 1;
    }
  };

  public wrap = async (generateToken = true): Promise<IUser> => ({
    token: generateToken
      ? await encode({
          uid: this.id,
        })
      : "NOT_GENERATED",
    id: this.id,
    note: this.note || "",
    email: this.email,
    isAdmin: this.isAdmin,
    isEmailVerified: this.isEmailVerified,
    enabled: this.enabled,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ss: {
      enabled: config.shadowsocks.enabled,
      host: config.shadowsocks.host,
      port: this.connPort,
      encryption: this.connEnc,
      password: this.connPassword,
    },
    vmess: {
      enabled: config.vmess.enabled,
      host: config.vmess.host,
      port: config.vmess.port,
      dynamicPort: config.vmess.dynamicPort,
      network: config.vmess.network as "tcp" | "kcp" | "ws",
      tcp: {
        header: {
          type: config.vmess.tcp.header.type as "http" | "none",
        },
      },
      kcp: {
        uplinkCapacity: config.vmess.kcp.uplinkCapacity,
        downlinkCapacity: config.vmess.kcp.downlinkCapacity,
        congestion: config.vmess.kcp.congestion,
        header: {
          type: config.vmess.kcp.header.type as
            | "none"
            | "srtp"
            | "utp"
            | "wechat-video",
        },
      },
      webSocket: {
        path: config.vmess.webSocket.path,
        host: config.vmess.webSocket.host,
        headers: config.vmess.webSocket.headers,
      },
      tls: {
        status: config.vmess.tls.status as "off" | "in" | "out",
        server: config.vmess.tls.server,
        cert: {
          trust: config.vmess.tls.cert.trust,
        },
      },
      id: this.vmessUid,
      aid: this.vmessAlterId,
    },
  });
}
