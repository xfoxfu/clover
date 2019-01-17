"use strict";

import Router = require("koa-router");
import { connection } from "../lib/db";
import User from "../models/user";

export default async (
  ctx: Router.IRouterContext,
  redirectDashboard = true,
  redirectIndex = true
) => {
  let authorized = false;
  if (ctx.session.uid) {
    const result = await connection
      .getRepository(User)
      .findOneById(ctx.session.uid);
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
