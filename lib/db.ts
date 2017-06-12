"use strict";

import { createConnection } from "typeorm";
import * as config from "../lib/config";

export default createConnection({
  type: "sqlite",
  database: config.get("db_path"),
  entities: [
    __dirname + "/../models/*.js",
  ],
  autoSchemaSync: true,
});
