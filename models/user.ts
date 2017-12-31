"use strict";

import * as bcrypt from "bcrypt";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Generated } from "typeorm";
import config from "../lib/config";

@Entity()
export default class User {
  constructor(email: string) {
    this.email = email;
  }
  @PrimaryGeneratedColumn("uuid")
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
  @Column({ name: "vmess_uid", nullable: true })
  @Generated("uuid")
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
