import { Injectable, Module } from "@nestjs/common";
import {
  InjectConnection,
  InjectRepository,
  TypeOrmModule,
} from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import * as CONFIG from "~/common/config";
import { User } from "~/entity/user";
import {
  LoggerModule,
  PinoLoggerService,
  TypeOrmLoggerService,
} from "./logger.service";

@Injectable()
export class DbService {
  constructor(
    @InjectConnection() public readonly connection: Connection,
    @InjectRepository(User) public readonly users: Repository<User>,
  ) {}
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [LoggerModule],
      useFactory: async (logger: TypeOrmLoggerService) =>
        ({
          type: "sqlite",
          database: CONFIG.DB,
          migrationsRun: !CONFIG.ENV_IS_PROD,
          synchronize: CONFIG.ENV_IS_DEV,
          logging: true,
          logger,
          entities: ["dist/entity/**/*.js", "src/entity/**/*.ts"],
          migrations: ["dist/migration/**/*.js", "src/migration/**/*.ts"],
          subscribers: ["dist/subscriber/**/*.js", "src/subscriber/**/*.ts"],
        } as SqliteConnectionOptions),
      inject: [TypeOrmLoggerService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
