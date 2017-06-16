#!/usr/bin/env node

if (process.env.NODE_ENV !== "test") {
  console.log(`ss-ui  Copyright (C) 2017 coderfox\n
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it
under certain conditions.
For more information, see "${__dirname}/../LICENSE.md".
`);
}

import server from "../server";
import db from "../lib/db";
import config from "../lib/config";
import log from "../lib/log";
import "../lib/email";

if (process.env.NODE_ENV === "test") {
  log.level = "silent";
}

const PORT = config.get("port") || 3000;

db
  .then((connection) => {
    log.info(`database connected to ${config.get("db_path")}`);
    server.listen(PORT);
    log.info(`server listening on port ${PORT}`);
  })
  .catch((err) => console.error(err));
