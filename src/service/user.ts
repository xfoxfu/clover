import { Inject, Injectable } from "@nestjs/common";
import { DbService } from "~/common/db";
import { InvalidTokenException } from "~/common/errors";
import { PinoLoggerService } from "~/common/logger.service";
import { TokenService } from "~/common/token.service";
import { User } from "~/entity/user";

@Injectable()
export class UserService {
  constructor(
    @Inject(TokenService) private readonly tokenService: TokenService,
    @Inject(DbService) private readonly dbService: DbService,
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}
  /**
   * acquire token information
   *
   * @param token string
   * @return User
   */
  public async get_token_information(token: string): Promise<User> {
    const uid = await this.tokenService.verify(token);
    const user = await this.dbService.users.findOne(uid);
    if (!user) {
      throw new InvalidTokenException();
    }
    return user;
  }
}
