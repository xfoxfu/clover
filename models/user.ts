"use strict";

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import * as config from "../lib/config";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ length: 50 })
  public email: string;
  @Column({ name: "password", type: "string", length: 32 })
  private hashedPassword: string;
  @CreateDateColumn()
  public createdAt: Date;
  @UpdateDateColumn()
  public updatedAt: Date;
  public setPassword = async (password: string) => {
    this.hashedPassword = await bcrypt.hash(password, config.get("password_hash_rounds"));
  }
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashedPassword)
}
