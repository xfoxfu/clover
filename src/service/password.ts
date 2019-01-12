import { Inject, Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { ConfigService } from "~/common/config";

@Injectable()
export class PasswordService {
  private readonly hash_rounds: number;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    this.hash_rounds = configService.get("PASSWORD_HASH_ROUNDS");
  }

  public async hash(password: string) {
    return await hash(password, this.hash_rounds);
  }

  public async compare(password: string, hashed: string) {
    return await compare(password, hashed);
  }
}
