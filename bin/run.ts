#!/usr/bin/env node

if (process.env.NODE_ENV !== "test") {
  // tslint:disable-next-line:no-console
  console.log(`clover Copyright (C) 2017-2018 coderfox\n
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it
under certain conditions.
For more information, see "${__dirname}/../LICENSE.md".
`);
}

import "dotenv/config";
import "reflect-metadata";

import log from "../server/lib/log";

if (process.env.NODE_ENV === "test") {
  log.level = "silent";
} else if (process.env.NODE_ENV === "dev") {
  log.level = "debug";
} else {
  log.level = "info";
}

import "../server/lib/email";
import server from "../index";
import serverOnly from "../server/server";
import { writeServerConfig } from "../server/lib/vmess";
import { port, dbPath } from "../server/lib/config";
import db from "../server/lib/db";

const PORT = port || 3000;

db()
  .then(() => writeServerConfig())
  .then(() => {
    log.info(`database connected to ${dbPath}`);
    if (process.env.SERVER_ONLY) {
      serverOnly.listen(PORT);
      log.info(`only server listening on port ${PORT}`);
    } else {
      server.listen(PORT);
      log.info(`full server listening on port ${PORT}`);
    }
  })
  .catch((err: any) => log.error(err));
