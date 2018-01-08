"use strict";

import { Connection, createConnection } from "typeorm";
import config from "../lib/config";

export let connection: Connection;
export default () => createConnection({
  type: "sqlite",
  database: config.get("db_path"),
  entities: [
    __dirname + "/../models/*.js",
  ],
  synchronize: false,
}).then((conn) => {
  connection = conn;
});
