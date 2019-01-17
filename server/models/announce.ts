"use strict";

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import IAnnounce from "../interfaces/announce";

@Entity()
export default class Announcement implements IAnnounce {
  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ type: "text", length: 200, nullable: false })
  public title: string;
  @Column({ type: "text", nullable: true })
  public content: string;
  @CreateDateColumn()
  public createdAt: Date;
  @UpdateDateColumn()
  public updatedAt: Date;
}
