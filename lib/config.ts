"use strict";

import * as Config from "config-file-bi";
import * as fs from "fs-extra";

let config: Config;

let path = process.env.CLOVER_CONFIG;
if (fs.pathExistsSync("./config/config.yaml")) {
  path = path || "./config/config.yaml";
}
path = path || "./config/config.sample.yaml";
config = new Config(path);
config.pullSync();

export default config;
