import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  public catch(exception: UnauthorizedException, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse()
      .redirect("/login");
  }
}

export class Exception extends HttpException {
  constructor(message: string, status = 500) {
    super(message, status);
  }
}
export class UserNotExistException extends Exception {
  constructor() {
    super("user not exists", HttpStatus.FORBIDDEN);
  }
}
export class PasswordMismatchException extends Exception {
  constructor() {
    super("password mismatch", HttpStatus.FORBIDDEN);
  }
}
export class InvalidTokenException extends Exception {
  constructor() {
    super("invalid token", HttpStatus.FORBIDDEN);
  }
}
export class DuplicatedUsernameException extends Exception {
  constructor() {
    super("duplicated email", HttpStatus.CONFLICT);
  }
}
export class ProfileTypeNotExistException extends Exception {
  constructor() {
    super("profile type not exists", HttpStatus.BAD_REQUEST);
  }
}
