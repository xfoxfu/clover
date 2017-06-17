"use strict";

import * as jwt from "jsonwebtoken";
import config from "./config";

export const encode = <T>(data: T, expires = "6h") => new Promise(
  (resolve, reject) => {
    jwt.sign(data, config.get("jwt_key"), { expiresIn: expires },
      (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  },
);
export const decode = <T>(encoded: string) => new Promise<T>(
  (resolve, reject) => {
    jwt.verify(encoded, config.get("jwt_key"),
      (err: Error, result: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  },
);
