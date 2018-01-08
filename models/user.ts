"use strict";

import * as bcrypt from "bcrypt";
import {
  Entity,
  Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn,
  getConnection, FindOneOptions,
} from "typeorm";
import config from "../lib/config";
import * as uuid from "uuid/v4";

const generatePassword = () => {
  const length = 8;
  const charset = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

// TODO: add more methods
export declare type EncryptionMethods =
  "aes-256-cfb" |
  "chacha20-ietf-poly1305" |
  "aes-256-gcm";

@Entity()
export default class User {
  constructor(email: string) {
    this.email = email;
    this.vmessUid = uuid();
  }
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ type: "text", nullable: true })
  public note: string;
  @Column({ length: 50, nullable: false, unique: true })
  public email: string;
  @Column({ name: "password", type: "varchar" })
  public hashedPassword: string;
  public setPassword = async (password: string) => {
    this.hashedPassword = await bcrypt.hash(password, config.get("password_hash_rounds"));
  }
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashedPassword)
  @Column({ name: "ss_password", type: "varchar", length: 10 })
  private ssPassword: string;
  public get connPassword(): string {
    return this.ssPassword;
  }
  public setConnPassword = () => {
    return this.ssPassword = generatePassword();
  }
  @Column({ name: "ss_port", type: "int" })
  private ssPort: number;
  public get connPort(): number {
    return this.ssPort;
  }
  public allocConnPort = async () => {
    const user = await getConnection().getRepository(User).findOne({
      order: {
        ssPort: "DESC",
      },
    } as FindOneOptions<User>);
    if (!user) {
      // TODO: rename port_last_allocated to port_start
      this.ssPort = config.get("port_last_allocated") + 1;
    } else {
      this.ssPort = user.ssPort + 1;
    }
  }
  @Column({ name: "ss_enc", type: "varchar", length: 25 })
  public connEnc: EncryptionMethods = config.get("default_encryption");
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
  public createdAt: Date;
  @UpdateDateColumn()
  public updatedAt: Date;
}
