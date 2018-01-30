'use strict';

import User from '../models/user';
import Site from '../models/site';
import Announce from '../models/announce';
import Message from '../models/message';
import axios from 'axios';

const apiRoot = process.env.REACT_APP_API_ROOT || '/api';
const request = async (uri: string, data?: any) => {
  const response = await axios.post(`${apiRoot}/${uri}`, data, {
    validateStatus: () => true
  });
  if (response.status !== 200) {
    throw new Error(response.data.message);
  } else {
    return response.data;
  }
}
export const login = async (email: string, password: string): Promise<User> =>
  request("user_info", { email, password });
export const userInfoByToken = async (token: string): Promise<User> =>
  request("user_info_token", { token });
export const getSiteInfo = async (): Promise<Site> =>
  request("site_config");
export const getAnnounces = async (): Promise<Announce[]> =>
  request("announces");
export const reg = async (email: string, password: string, refcode?: string): Promise<{
  message: string;
}> =>
  request("reg", { email, password, refcode });
export const resetPassword = async (email: string, password: string, newPassword: string): Promise<Message> =>
  request("reset_password", { email, password, newPassword });
export const resetPasswordEmail = async (email: string): Promise<Message> =>
  request("reset_password_email", { email });
export const addAnnounce = async (token: string, title: string, content: string): Promise<Message> =>
  request("add_announce", { token, title, content });
export const getRefCode = async (token: string, email: string, note?: string): Promise<{ refcode: string }> =>
  request("get_refcode", { token, email, note });
export const getAllUsers = async (token: string): Promise<User[]> =>
  request("all_users", { token });
