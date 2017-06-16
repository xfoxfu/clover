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

const mailer = sendgrid(config.get("sendgrid_key"));

const siteBasics = {
  title: config.get("site_title"),
};
const templates = {
  announce: hbs.compile(fs.readFileSync(`${__dirname}/../views/emails/announce.hbs`).toString()),
};
export let announce = async (ann: Announce, users: User[], alwaysSend = false) => {
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
