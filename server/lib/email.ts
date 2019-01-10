"use strict";

// TODO: support more email services
import * as fs from "fs-extra";
import * as hbs from "handlebars";
import { mail as helper } from "sendgrid";
import * as sendgrid from "sendgrid";
import { sendgrid as sendgrid_config, siteTitle, siteUrl } from "../lib/config";
import { encode } from "../lib/jwt";
import log from "../lib/log";
import Announce from "../models/announce";
import User from "../models/user";
import { join } from "path";

const mailer = sendgrid(sendgrid_config.key);

const siteBasics = {
  title: siteTitle,
};
const templates = {
  announce: hbs.compile(fs.readFileSync(join(__dirname, "../views/emails/announce.hbs")).toString()),
  resetPassword: hbs.compile(fs.readFileSync(join(__dirname, "../views/emails/reset-password.hbs")).toString()),
  validateEmail: hbs.compile(fs.readFileSync(join(__dirname, "../views/emails/email-validate.hbs")).toString()),
};
export const announce = async (ann: Announce, users: User[], alwaysSend = false) => {
  const fromEmail = new helper.Email(sendgrid_config.email);
  const subject = `[${siteTitle}]${ann.title}`;
  for (const currentUser of users) {
    if (alwaysSend || (currentUser.isEmailVerified && currentUser.enabled)) {
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
  const fromEmail = new helper.Email(sendgrid_config.email);
  const subject = `[${siteTitle}]Reset Password`;
  const toEmail = new helper.Email(user.email);
  const token = await encode({ email: user.email, uid: user.id });
  const content = new helper.Content("text/html", templates.resetPassword({
    site: siteBasics,
    user,
    link: `${siteUrl}/reset_password_email_callback?token=${token}`,
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
      link: `${siteUrl}/reset_password_callback?token=${token}`,
    });
  } catch (err) {
    log.error("failed email", {
      user,
      error: err,
      link: `${siteUrl}/reset_password_callback?token=${token}`,
    });
  }
};
export const validateEmail = async (user: User) => {
  const fromEmail = new helper.Email(sendgrid_config.email);
  const subject = `[${siteTitle}]Validate Email`;
  const toEmail = new helper.Email(user.email);
  const token = await encode({ email: user.email });
  const content = new helper.Content("text/html", templates.resetPassword({
    site: siteBasics,
    user,
    link: `${siteUrl}/validate_email_callback?token=${token}`,
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
      link: `${siteUrl}/validate_email_callback?token=${token}`,
    });
  } catch (err) {
    log.error("failed email", {
      user,
      error: err,
      link: `${siteUrl}/validate_email_callback?token=${token}`,
    });
  }
};
