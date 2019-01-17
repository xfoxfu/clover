import { observable, action } from "mobx";
import IUser from "../models/user";
import ISite from "../models/site";
import IAnnounce from "../models/announce";
import {
  getSiteInfo,
  login,
  getAnnounces,
  reg,
  resetPassword,
  resetPasswordEmail,
  userInfoByToken,
  addAnnounce,
} from "../api";
import getGuide, { IGuide } from "./guide";
import { getToken, setToken, deleteToken } from "./store";
import { notification } from "antd";

export default class AppState {
  @observable public site?: ISite;
  @observable public user?: IUser;
  @observable public announces?: IAnnounce[];
  @observable public guide?: IGuide;

  constructor() {
    getSiteInfo()
      .then(site => (this.site = site))
      .then(() => (getToken() ? this.refreshUserInfo(getToken()) : undefined))
      .catch(console.error);
  }

  @action public login = async (email: string, password: string) => {
    this.user = await login(email, password);
    setToken(this.user.token);
    this.guide = await getGuide(this.user, this.site && this.site.siteTitle);
  };
  @action public logout = () => {
    this.user = undefined;
    deleteToken();
  };
  @action public refreshUserInfo = async (token?: string) => {
    try {
      if (token) {
        this.user = await userInfoByToken(token);
      } else {
        if (!this.user) {
          return this.emitError(new Error("未登入"));
        }
        this.user = await userInfoByToken(this.user.token);
      }
      setToken(this.user.token);
      this.guide = await getGuide(this.user, this.site && this.site.siteTitle);
    } catch (err) {
      return this.emitError(err);
    }
  };

  @action public loadAnnounces = async () => {
    this.announces = await getAnnounces();
  };

  @action public emitMessage = (message: string) => {
    notification.info({
      message: "提示",
      description: message,
    });
  };
  @action public emitError = (error: Error) => {
    notification.error({
      message: "错误",
      description: error.message,
    });
  };

  @action public reg = async (
    email: string,
    password: string,
    ref?: string
  ) => {
    const result = await reg(email, password, ref);
    this.emitMessage(result.message);
    await this.login(email, password);
  };

  @action public resetPassword = async (
    password: string,
    newPassword: string
  ) => {
    if (!this.user) {
      throw new Error("未登入");
    }
    const result = await resetPassword(this.user.email, password, newPassword);
    this.emitMessage(result.message);
    this.user = undefined;
  };
  @action public resetPasswordEmail = async (email: string) => {
    const result = await resetPasswordEmail(email);
    this.emitMessage(result.message);
  };

  @action public addAnnounce = async (title: string, content: string) => {
    if (!this.user) {
      throw new Error("未登入");
    }
    const result = await addAnnounce(this.user.token, title, content);
    this.emitMessage(result.message);
    await this.loadAnnounces();
  };
}
