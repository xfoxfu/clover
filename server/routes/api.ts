"use strict";

import Router = require("koa-router");
const router = new Router();

import * as Interfaces from "../interfaces";
import * as config from "../lib/config";
import { getRepository } from "typeorm";
import { User, Announce } from "../models";
import { encode, decode } from "../lib/jwt";
import { writeServerConfig } from "../lib/vmess";
import { validateEmail, resetPassword, announce as announceMail } from "../lib/email";
import { Context } from "koa";
import * as MarkdownIt from "markdown-it";
const md = new MarkdownIt();
import * as uuid from "uuid/v4";

const raiseApiError = (code: number, message: string) => {
  const error: any = new Error(message);
  error.status = code;
  throw error;
};

const auth = async (ctx: Context, requireAdmin = false): Promise<User> => {
  const { email, password } = ctx.request.body;
  if ((!email) || (!password)) {
    raiseApiError(400, "邮箱或密码未提供");
  }
  try {
    const user = await getRepository(User).findOne({ email });
    if (!user) {
      return raiseApiError(404, "用户不存在");
    }
    if (!await user.checkPassword(password)) {
      return raiseApiError(403, "密码错误");
    }
    if (requireAdmin && !user.isAdmin) {
      return raiseApiError(403, "权限不足");
    }
    return user;
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      return raiseApiError(500, "服务器内部错误" + err.message);
    }
  }
};
const authToken = async (ctx: Context, requireAdmin = false): Promise<User> => {
  const { token } = ctx.request.body;
  if (!token) {
    return raiseApiError(401, "Token 未提供");
  }
  try {
    const { uid } = await decode<{ uid: string }>(token);
    const user = await getRepository(User).findOneById(uid);
    if (!user) {
      return raiseApiError(404, "用户不存在");
    }
    if (requireAdmin && !user.isAdmin) {
      return raiseApiError(403, "权限不足");
    }
    return user;
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      return raiseApiError(500, "服务器内部错误" + err.message);
    }
  }
};

router.use("/", async (_, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      return raiseApiError(500, "服务器内部错误" + err.message);
    }
  }
});

router.post("/site_config", (ctx) => {
  const body: Interfaces.Site = {
    sourceCodeUrl: config.sourceCodeUrl,
    siteTitle: config.siteTitle,
    openRegister: config.openRegister,
    adminEmail: config.adminEmail,
  };
  ctx.body = body;
});
router.post("/user_info", async (ctx) => {
  const user = await auth(ctx);
  ctx.body = await user.wrap();
});
router.post("/user_info_token", async (ctx) => {
  const user = await authToken(ctx);
  ctx.body = await user.wrap();
});
router.post("/announces", async (ctx) => {
  ctx.body = await getRepository(Announce).find({ order: { updatedAt: "DESC" } });
});
router.post("/reg", async (ctx) => {
  const { email, password, refcode } = ctx.request.body;
  if ((!email) || (!password)) {
    raiseApiError(400, "请求格式错误");
  }
  if (!(config.openRegister || refcode)) {
    if (email !== config.adminEmail) {
      raiseApiError(400, "未开放注册，请填写邀请码");
    }
  }
  const user = new User(email);
  await user.setPassword(password);
  user.setConnPassword();
  await user.allocConnPort();
  if (!config.openRegister && email !== config.adminEmail) {
    try {
      const refData = await decode<any>(refcode);
      if (refData.email !== email) {
        raiseApiError(403, "邀请码不适用于当前邮件地址");
        user.note = refData.note;
      }
    } catch (err) {
      if (err.status === 403) {
        throw err;
      } else {
        raiseApiError(403, "邀请码已过期");
      }
    }
  }
  await getRepository(User).save(user);
  await writeServerConfig();
  await validateEmail(user);
  ctx.status = 200;
  ctx.body = { message: "注册成功" };
});
router.post("/reset_password", async (ctx) => {
  const user = await auth(ctx);
  const { newPassword } = ctx.request.body;
  await user.setPassword(newPassword);
  await getRepository(User).save(user);
  ctx.body = { message: "修改成功" };
});
router.post("/resend_validate_email", async (ctx) => {
  const user = await authToken(ctx);
  await validateEmail(user);
  ctx.body = { message: "邮件已发送，请到收件箱查收" };
});
router.post("/reset_password_email", async (ctx) => {
  const user = await getRepository(User).findOne({ email: ctx.request.body.email });
  if (!user) {
    return raiseApiError(404, "用户不存在");
  } else {
    await resetPassword(user);
    // TODO: better appearance
    ctx.status = 200;
    ctx.body = { message: "邮件已发送，请到收件箱查收" };
  }
});
router.post("/all_users", async (ctx) => {
  await authToken(ctx, true);
  ctx.body = await Promise.all((await getRepository(User).find()).map((consumer) => consumer.wrap(false)));
});
router.post("/add_announce", async (ctx) => {
  await authToken(ctx, true);
  const { title, content } = ctx.request.body;
  if (!title) {
    return raiseApiError(400, "未填写通知标题");
  }
  const announce = new Announce(title, md.render(content));
  await getRepository(Announce).save(announce);
  await announceMail(announce, await getRepository(User).find());
  ctx.body = { message: "创建成功" };
});
router.post("/get_refcode", async (ctx) => {
  await authToken(ctx, true);
  const { email, note } = ctx.request.body;
  if (!email) {
    return raiseApiError(400, "邮箱地址未填写");
  }
  ctx.body = {
    refcode: await encode({ email, note }),
  };
});
router.post("/edit_user", async (ctx) => {
  await authToken(ctx, true);
  const { uid, email, note, enabled, isAdmin, isEmailVerified, regenerate } = ctx.request.body;
  if (!uid) {
    return raiseApiError(400, "请求格式错误");
  }
  const user = await getRepository(User).findOneById(uid);
  if (!user) {
    return raiseApiError(404, "用户不存在");
  }
  user.email = email || user.email;
  user.note = note || user.note;
  user.enabled = enabled;
  user.isAdmin = isAdmin;
  user.isEmailVerified = isEmailVerified;
  if (regenerate) {
    user.setConnPassword();
    await user.allocConnPort();
    user.vmessUid = uuid();
  }
  await getRepository(User).save(user);
  await writeServerConfig();
  ctx.body = { message: "操作成功" };
});

export default router;
