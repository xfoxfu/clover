"use strict";

import IUser from "../models/user";
import ISite from "../models/site";
import IAnnounce from "../models/announce";
import IMessage from "../models/message";
import axios from "axios";

const apiRoot = process.env.REACT_APP_API_ROOT || "/api";
const request = async (uri: string, data?: any) => {
  const response = await axios.post(`${apiRoot}/${uri}`, data, {
    validateStatus: () => true,
  });
  if (response.status !== 200) {
    throw new Error(response.data.message);
  } else {
    return response.data;
  }
};
export const login = async (email: string, password: string): Promise<IUser> =>
  request("user_info", { email, password });
export const userInfoByToken = async (token: string): Promise<IUser> =>
  request("user_info_token", { token });
export const getSiteInfo = async (): Promise<ISite> => request("site_config");
export const getAnnounces = async (): Promise<IAnnounce[]> =>
  request("announces");
export const reg = async (
  email: string,
  password: string,
  refcode?: string
): Promise<{
  message: string;
}> => request("reg", { email, password, refcode });
export const resetPassword = async (
  email: string,
  password: string,
  newPassword: string
): Promise<IMessage> =>
  request("reset_password", { email, password, newPassword });
export const resetPasswordEmail = async (email: string): Promise<IMessage> =>
  request("reset_password_email", { email });
export const addAnnounce = async (
  token: string,
  title: string,
  content: string
): Promise<IMessage> => request("add_announce", { token, title, content });
export const getRefCode = async (
  token: string,
  email: string,
  note?: string
): Promise<{ refcode: string }> =>
  request("get_refcode", { token, email, note });
export const getAllUsers = async (token: string): Promise<IUser[]> =>
  request("all_users", { token });
export const editUser = async (
  token: string,
  user: Partial<IUser> & { regenerate?: boolean }
): Promise<IMessage> =>
  request("edit_user", {
    token,
    uid: user.id,
    email: user.email,
    enabled: user.enabled,
    isAdmin: user.isAdmin,
    isEmailVerified: user.isEmailVerified,
    note: user.note,
    regenerate: user.regenerate,
  });
export const resendValidateEmail = async (token: string): Promise<IMessage> =>
  request("resend_validate_email", { token });
