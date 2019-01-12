import { Inject, Injectable } from "@nestjs/common";
import { sign, verify } from "jsonwebtoken";
import { ConfigService } from "~/common/config";
import { User } from "~/entity/user";
import { InvalidTokenException } from "./errors";

interface ITokenData {
  uid: number;
}

@Injectable()
export class TokenService {
  private JWT_KEY: string;
  public constructor(@Inject() configService: ConfigService) {
    this.JWT_KEY = configService.get("JWT_KEY");
  }
  /**
   * issue new token with 7d expiration
   *
   * @param user
   */
  public sign(user: User): string {
    const data: ITokenData = { uid: user.id };
    return sign(data, this.JWT_KEY, {
      expiresIn: "7d",
    });
  }
  /**
   * get user name by token
   *
   * @param token
   * @returns user id
   */
  public verify(token: string): number {
    try {
      return (verify(token, this.JWT_KEY) as ITokenData).uid;
    } catch {
      throw new InvalidTokenException();
    }
  }
}
