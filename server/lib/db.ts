"use strict";

import { Connection, createConnection } from "typeorm";
import { dbPath } from "../lib/config";

export let connection: Connection;
export default () => createConnection({
  type: "sqlite",
  database: dbPath,
  entities: [
    __dirname + "/../models/*.js",
  ],
  synchronize: true,
}).then((conn) => {
  connection = conn;
});
