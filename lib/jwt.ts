"use strict";

import * as jwt from "jsonwebtoken";
import { jwtKey } from "./config";

export const encode = <T>(data: T, expires = "6h") => new Promise(
  (resolve, reject) => {
    jwt.sign(data, jwtKey, { expiresIn: expires },
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
    jwt.verify(encoded, jwtKey,
      (err: Error, result: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  },
);
