Clover
=====

[![Build Status](https://img.shields.io/travis/coderfox/clover.svg?style=flat-square)](https://travis-ci.org/coderfox/clover)
[![Coveralls](https://img.shields.io/coveralls/coderfox/clover.svg?style=flat-square)](https://coveralls.io/github/coderfox/clover)
[![license](https://img.shields.io/github/license/coderfox/clover.svg?style=flat-square)](https://github.com/coderfox/clover/blob/master/LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-v2.4.2-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

Yet another [shadowsocks](https://shadowsocks.org) multiuser frontend.

Config
-----

Use environment variables, and dotenv files are also supported.

| Key                   | Default                          | Description                              |
| --------------------- | -------------------------------- | ---------------------------------------- |
| DB_PATH               | ./clover.db                      |                                          |
| LOG_LEVEL             | debug                            |                                          |
| PORT                  | 3000                             |                                          |
| PASSWORD_HASH_ROUNDS  | 12                               |                                          |
| SITE_TITLE            | Clover                           |                                          |
| OPEN_REGISTER         | false                            | true/false                               |
| SENDGRID_KEY          | KEY                              | get one at <http://sendgrid.com/>        |
| SENDGRID_EMAIL        | clover@example.com               | email address used for sending announces and password recovery emails |
| JWT_KEY               | 527877cb                         | JSON Web Token key used by generation of referrence codes |
| SITE_URL              | http://127.0.0.1:3000            |                                          |
| ADMIN_EMAIL           | user@example.com                 | administrator contact email              |
| PROXY_HOST            | 127.0.0.1                        | shared host of shadowsocks and v2ray     |
| SS_ENABLED            | true                             | true/false                               |
| DEFAULT_ENCRYPTION    | chacha20-ietf-poly1305           | shadowsocks default encryption method    |
| PORT_START            | 10000                            | start of shadowsocks port range          |
| MU_TOKEN              | d6d0fbdc9483c27e6b653457879d3fbd | token of shadowsocks MU API v2           |
| VMESS_ENABLED         | true                             | true/false                               |
| VMESS_DEFAULT_ALTERID | 16                               |                                          |
| VMESS_PORT            | 443                              |                                          |
| VMESS_PORT_DYNAMIC    |                                  | leave it blank to disable the feature    |
| VMESS_NETWORK         | ws                               | tcp, kcp or ws                           |
| VMESS_TCP_HEADER_TYPE | none                             | none/http                                |
| VMESS_KCP_HEADER      | none                             | none/srtp/utp/wechat-video               |
| VMESS_KCP_UP_CAP      | 5                                |                                          |
| VMESS_KCP_DOWN_CAP    | 20                               |                                          |
| VMESS_KCP_CONGESTION  | false                            | true/false                               |
| VMESS_WS_PATH         | /                                |                                          |
| VMESS_WS_HOST         | the same as PROXY_HOST           |                                          |
| VMESS_WS_HEADERS      | {}                               | JSON representing all the header keys, `Host` excluded |
| VMESS_TLS             | out                              | `off` for disable / `in` for using v2ray TLS / `out` for using TLS provided outside v2ray |
| VMESS_TLS_SERVER      | the same as PROXY_HOST           | hostname for TLS                         |
| VMESS_TLS_CERT_TRUST  | true                             | true/false, false for insecure(not-trusted) certs |
| VMESS_TLS_CERT        | server.crt                       | path of TLS cert file, used only `VMESS_TLS` is `in` |
| VMESS_TLS_KEY         | server.key                       | path of TLS key file, used only `VMESS_TLS` is `in` |

Currently, not all features of vmess is implemented.

- [ ] VMESS_PORT_DYNAMIC
- [x] VMESS_NETWORK
  * [x] tcp
  * [x] kcp
  * [x] ws
- [x] VMESS_TCP_HEADER
- [x] VMESS_TLS
  * [x] off
  * [x] in
  * [x] out

Start
-----

```sh
tsc
npm start
```

Connect With Proxy Servers
-----

### Shadowsocks

Use any server implementions support MU API v2.

### v2ray

Use docker to deploy v2ray, and the container name should be `v2ray`.

*Clover* will generate `v2ray_server.json` as server config in root path of *Clover*.

*Clover* will connect to docker daemon automatically and restart the server on demand.

If you run *Clover* inside a container, you may create 2 volumes: `/var/run/docker.sock:/var/run/docker.sock:ro` and `./v2ray_server.json:/app/v2ray_server.json` to make the connection.

### Docker

1. Modify docker-compose.yml, set the env vars to your value.
2. Modify ss.py, replace `<API_KEY>` to env var `MU_TOKEN`.
3. `docker-compose up -d`

License
-----

AGPL v3+

```
clover generic proxy frontend
Copyright (C) 2017-2018  coderfox

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```