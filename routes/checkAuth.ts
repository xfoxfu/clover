"use strict";

import Router = require("koa-router");
import config from "../lib/config";
import User from "../models/user";
import { connection } from "../lib/db";
import log from "../lib/log";

export default async (ctx: Router.IRouterContext, redirectDashboard = true, redirectIndex = true) => {
  let authorized = false;
  if (ctx.session.uid) {
    const result = await connection.getRepository(User).findOneById(ctx.session.uid);
    if (result) {
      ctx.user = result;
      authorized = true;
    }
  }
  if (authorized) {
    if (redirectDashboard) {
      ctx.redirect("/dashboard");
    }
  } else {
    if (redirectIndex) {
      ctx.redirect("/");
    }
  }
};
