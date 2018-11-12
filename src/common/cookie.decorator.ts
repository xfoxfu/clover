import { createParamDecorator } from "@nestjs/common";

// tslint:disable-next-line:variable-name
export const Cookie = createParamDecorator((data, req) => {
  return req.cookies;
});
