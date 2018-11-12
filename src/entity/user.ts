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
import {
  PASSWORD_HASH_ROUNDS,
  SHADOWSOCKS_DEFAULT_ENCRYPTION,
  SHADOWSOCKS_PORT_RANGE,
} from "~/common/config";
import * as config from "~/common/config";

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
    return this.ss_password;
  }
  public get connPort(): number {
    return this.ss_port;
  }
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column({ type: "text", nullable: true })
  public note?: string;
  @Column({ length: 50, nullable: false, unique: true })
  public email: string;
  @Column({ name: "password", type: "varchar" })
  public hashed_password!: string;
  @Column({ name: "ss_enc", type: "varchar", length: 25 })
  public connEnc = SHADOWSOCKS_DEFAULT_ENCRYPTION;
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
  private ss_password!: string;
  @Column({ name: "ss_port", type: "int" })
  private ss_port!: number;
  constructor(email: string) {
    this.email = email;
    if (email === config.adminEmail) {
      this.isAdmin = true;
    }
    this.vmessUid = uuid();
  }
  public setPassword = async (password: string) => {
    this.hashed_password = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  };
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashed_password);
  public setConnPassword = () => {
    return (this.ss_password = generatePassword());
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
      this.ss_port = config.shadowsocksPortStart + 1;
    } else {
      this.ss_port = user.ss_port + 1;
    }
  };
}
