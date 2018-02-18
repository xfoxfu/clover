import "reflect-metadata";
import "dotenv/config";
import log from "./server/lib/log";
import "./server/lib/email";
import server from "./index";
import serverOnly from "./server/server";
import { writeServerConfig } from "./server/lib/vmess";
import { port, dbPath } from "./server/lib/config";
import db from "./server/lib/db";

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
