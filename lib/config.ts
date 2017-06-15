"use strict";

import * as Config from "config-file-bi";

/* tslint:disable:no-string-literal */
const config = new Config(process.env["SS_UI_CONFIG"] || "./config/config.sample.yaml");
/* tslint:enable:no-string-literal */

config.pullSync();

export = config;
