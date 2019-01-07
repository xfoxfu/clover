"use strict";

interface User {
  token: string;
  id: number;
  note: string;
  fee_base: number;
  fee_start: number;
  fee_total: number;
  email: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  ss: {
    enabled: boolean;
    host: string;
    port: number;
    encryption: string;
    password: string;
  };
  vmess: {
    enabled: boolean;
    host: string;
    port: number;
    dynamicPort: string;
    network: "tcp" | "kcp" | "ws";
    tcp: {
      header: {
        type: "http" | "none";
      };
    };
    kcp: {
      uplinkCapacity: number;
      downlinkCapacity: number;
      congestion: boolean;
      header: {
        type: "none" | "srtp" | "utp" | "wechat-video";
      };
    };
    webSocket: {
      path: string;
      host: string;
      // tslint:disable-next-line:no-any
      headers: any;
    };
    tls: {
      status: "off" | "in" | "out";
      server: string;
      cert: {
        trust: boolean;
      };
    };
    id: string;
    aid: number;
  };
}
export default User;
