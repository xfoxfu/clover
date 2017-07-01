"use strict";

import { encode } from "../lib/jwt";

console.log(process.env);
encode(JSON.parse(process.env[2]))
  .then(console.log)
  .catch(console.error);
