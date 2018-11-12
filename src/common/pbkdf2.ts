import crypto from "crypto";
import { promisify } from "util";

const getPBKDF2Algorithm = (prf: number) => {
  switch (prf) {
    case 0:
      return "sha1";
    case 1:
      return "sha256";
    case 2:
      return "sha512";
    default:
      throw new Error(`unsupported prf ${prf}`);
  }
};
const getPBKDF2Params = (hashedPasswordBytes: Buffer) => {
  switch (hashedPasswordBytes[0]) {
    /*
     * Version 2:
     * PBKDF2 with HMAC-SHA1, 128-bit salt, 256-bit subkey, 1000 iterations.
     * (See also: SDL crypto guidelines v5.1, Part III)
     * Format: { 0x00, salt, subkey }
     */
    case 0x00: {
      const salt = Buffer.alloc(16);
      hashedPasswordBytes.copy(salt, 0, 1, 17);
      const subkey = Buffer.alloc(32);
      hashedPasswordBytes.copy(subkey, 0, 17, 49);
      return {
        hashAlgorithm: "sha1",
        subkey,
        salt,
        iteration: 1000,
      };
    }
    /*
     * Version 3:
     * PBKDF2 with HMAC-SHA256, 128-bit salt, 256-bit subkey, 10000 iterations.
     * Format: { 0x01, prf (UInt32), iter count (UInt32), salt length (UInt32), salt, subkey }
     * (All UInt32s are stored big-endian.)
     */
    case 0x01: {
      const prf = hashedPasswordBytes.readUInt32BE(1);
      const iter = hashedPasswordBytes.readUInt32BE(5);
      const saltLength = hashedPasswordBytes.readUInt32BE(9);
      const salt = Buffer.alloc(saltLength);
      hashedPasswordBytes.copy(salt, 0, 13, 13 + saltLength);
      const subkey = Buffer.alloc(32);
      hashedPasswordBytes.copy(
        subkey,
        0,
        13 + saltLength,
        13 + saltLength + 32,
      );
      return {
        iteration: iter,
        salt,
        subkey,
        hashAlgorithm: getPBKDF2Algorithm(prf),
      };
    }
    default:
      throw new Error(`invalid version ${hashedPasswordBytes[0].toString()}`);
  }
};
const validate = (hash: Buffer, password: Buffer) => {
  const data = getPBKDF2Params(hash);
  return promisify(crypto.pbkdf2)(
    password,
    data.salt,
    data.iteration,
    data.subkey.length,
    data.hashAlgorithm,
  ).then(k => k === data.subkey);
};

export default validate;
