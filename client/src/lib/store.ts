"use strict";

// tslint:disable-next-line:no-var-requires
const store = require("store");
// tslint:disable-next-line:no-var-requires
const expirePlugin = require("store/plugins/expire");
store.addPlugin(expirePlugin);

const TOKEN_KEY = "token";
const expiresIn = 6 * 60 * 60 * 1000;

export const getToken = () => store.get(TOKEN_KEY);
export const setToken = (token: string) =>
  store.set(TOKEN_KEY, token, new Date().getTime() + expiresIn);
export const deleteToken = () => store.remove(TOKEN_KEY);
