"use strict";

// TODO: support more email services
import { mail as helper } from "sendgrid";
import * as sendgrid from "sendgrid";
import * as hbs from "handlebars";
import * as fs from "fs-extra";
import config from "../lib/config";
import Announce from "../models/announce";
import User from "../models/user";
import log from "../lib/log";
import { encode } from "../lib/jwt";

const mailer = sendgrid(config.get("sendgrid_key"));

const siteBasics = {
  title: config.get("site_title"),
};
const templates = {
  announce: hbs.compile(fs.readFileSync(`${__dirname}/../views/emails/announce.hbs`).toString()),
  resetPassword: hbs.compile(fs.readFileSync(`${__dirname}/../views/emails/reset-password.hbs`).toString()),
};
export const announce = async (ann: Announce, users: User[], alwaysSend = false) => {
  const fromEmail = new helper.Email(config.get("email_from"));
  const subject = `[${config.get("site_title")}]${ann.title}`;
  for (const currentUser of users) {
    if (alwaysSend || currentUser.isEmailVerified) {
      const toEmail = new helper.Email(currentUser.email);
      const content = new helper.Content("text/html", templates.announce({
        site: siteBasics,
        announce: ann,
        user: currentUser,
      }));
      const mail = new helper.Mail(fromEmail, subject, toEmail, content);
      log.info("prepared email", { user: currentUser, announce: ann });
      const request = mailer.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: mail.toJSON(),
      });
      try {
        const res = await mailer.API(request);
        log.info("sent email", { user: currentUser, announce: ann, response: res });
      } catch (err) {
        log.error("failed email", { user: currentUser, announce: ann, error: err });
      }
    } else {
      log.info(`ignoring email`, { user: currentUser, announce: ann });
    }
  }
};
export const resetPassword = async (user: User) => {
  const fromEmail = new helper.Email(config.get("email_from"));
  const subject = `[${config.get("site_title")}]Reset Password`;
  const toEmail = new helper.Email(user.email);
  const token = await encode({ email: user.email, uid: user.id });
  const content = new helper.Content("text/html", templates.resetPassword({
    site: siteBasics,
    user,
    link: `${config.get("site_url")}/reset_password_email_callback?token=${token}`,
  }));
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);
  log.info("prepared email", { user });
  const request = mailer.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON(),
  });
  try {
    const res = await mailer.API(request);
    log.info("sent email", {
      user,
      response: res,
      link: `${config.get("site_url")}/reset_password_callback?token=${token}`,
    });
  } catch (err) {
    log.error("failed email", {
      user,
      error: err,
      link: `${config.get("site_url")}/reset_password_callback?token=${token}`,
    });
  }
};
