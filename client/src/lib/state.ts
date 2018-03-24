import { observable, action } from 'mobx';
import User from '../models/user';
import Site from '../models/site';
import Announce from '../models/announce';
import {
  getSiteInfo,
  login,
  getAnnounces,
  reg,
  resetPassword,
  resetPasswordEmail,
  userInfoByToken,
  addAnnounce
} from '../api';
import getGuide, { Guide } from './guide';
import { getToken, setToken, deleteToken } from './store';
import { notification } from 'antd';

export default class AppState {
  @observable site?: Site;
  @observable user?: User;
  @observable announces?: Announce[];
  @observable guide?: Guide;

  constructor() {
    getSiteInfo()
      .then((site) => this.site = site)
      .then(() => getToken() ? this.refreshUserInfo(getToken()) : undefined)
      .catch(console.error);
  }

  @action login = async (email: string, password: string) => {
    this.user = await login(email, password);
    setToken(this.user.token);
    this.guide = await getGuide(this.user, this.site && this.site.siteTitle);
  }
  @action logout = () => {
    this.user = undefined;
    deleteToken();
  }
  @action refreshUserInfo = async (token?: string) => {
    try {
      if (token) {
        this.user = await userInfoByToken(token);
      } else {
        if (!this.user) {
          return this.emitError(new Error('未登入'));
        }
        this.user = await userInfoByToken(this.user.token);
      }
      setToken(this.user.token);
      this.guide = await getGuide(this.user, this.site && this.site.siteTitle);
    } catch (err) {
      return this.emitError(err);
    }
  }

  @action loadAnnounces = async () => {
    this.announces = await getAnnounces();
  }

  @action emitMessage = (message: string) => {
    notification.info({
      message: '提示',
      description: message,
    });
  }
  @action emitError = (error: Error) => {
    notification.error({
      message: '错误',
      description: error.message,
    });
  }

  @action reg = async (email: string, password: string, ref?: string) => {
    const result = await reg(email, password, ref);
    this.emitMessage(result.message);
    await this.login(email, password);
  }

  @action resetPassword = async (password: string, newPassword: string) => {
    if (!this.user) {
      throw new Error('未登入');
    }
    const result = await resetPassword(this.user.email, password, newPassword);
    this.emitMessage(result.message);
    this.user = undefined;
  }
  @action resetPasswordEmail = async (email: string) => {
    const result = await resetPasswordEmail(email);
    this.emitMessage(result.message);
  }

  @action addAnnounce = async (title: string, content: string) => {
    if (!this.user) {
      throw new Error('未登入');
    }
    const result = await addAnnounce(this.user.token, title, content);
    this.emitMessage(result.message);
    await this.loadAnnounces();
  }
}
