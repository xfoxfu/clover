"use strict";

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import * as config from "../lib/config";
import { connection } from "../lib/db";

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
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ length: 50, nullable: false })
  public email: string;
  @Column({ name: "password", type: "string", length: 60 })
  private hashedPassword: string;
  public setPassword = async (password: string) => {
    this.hashedPassword = await bcrypt.hash(password, config.get("password_hash_rounds"));
  }
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashedPassword)
  @Column({ name: "ss_password", type: "string", length: 10 })
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
    this.ssPort = config.get("port_last_allocated") + 1;
    config.setWhenExists("port_last_allocated", this.ssPort);
    await config.push();
    return this.ssPort;
  }
  @Column({ name: "ss_enc", type: "string", length: 25 })
  public connEnc: EncryptionMethods = config.get("default_encryption");
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
