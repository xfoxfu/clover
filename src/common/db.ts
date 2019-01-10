import { Injectable, Module } from "@nestjs/common";
import {
  InjectConnection,
  InjectRepository,
  TypeOrmModule,
} from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { ConfigModule, ConfigService } from "~/common/config";
import { User } from "~/entity/user";
import { require_classes_sync } from "./loader";
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
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, TypeOrmLoggerService],
      useFactory: (config: ConfigService, logger: TypeOrmLoggerService) => ({
        type: "sqlite",
        url: config.get("DB_PATH"),
        migrationsRun: !config.get("isProd"),
        synchronize: config.get("isDev"),
        logging: true,
        logger,
        entities: require_classes_sync(__dirname, "../entity"),
        migrations: require_classes_sync(__dirname, "../migration"),
        subscribers: require_classes_sync(__dirname, "../subscriber"),
      }),
    }),
    TypeOrmModule.forFeature(require_classes_sync(__dirname, "../entity")),
  ],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
