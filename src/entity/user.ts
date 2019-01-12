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
  public connEnc: string;
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

  public constructor(email: string) {
    this.email = email;
    this.vmessUid = uuid();
  }
}
