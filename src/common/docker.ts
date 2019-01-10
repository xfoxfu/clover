"use strict";

import Docker from "dockerode";

const docker = new Docker();
const container = docker.getContainer("v2ray");

export const init = async () => {
  try {
    const status = await container.inspect();
    if (!status.State.Running) {
      await container.start();
      log.info("docker container v2ray is started");
    } else {
      log.info("docker container v2ray has already been started");
    }
    return status;
  } catch (err) {
    log.error("cannot start docker container v2ray", err);
  }
};

export const reload = async () => {
  try {
    await container.restart();
    log.info("docker container v2ray is restarted");
  } catch (err) {
    log.error("cannot restart docker container v2ray", err);
  }
};
