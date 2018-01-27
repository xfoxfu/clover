Clover
=====

[![Greenkeeper badge](https://badges.greenkeeper.io/coderfox/clover.svg)](https://greenkeeper.io/)
[![Build Status](https://img.shields.io/travis/coderfox/clover.svg?style=flat-square)](https://travis-ci.org/coderfox/clover)
[![Coveralls](https://img.shields.io/coveralls/coderfox/clover.svg?style=flat-square)](https://coveralls.io/github/coderfox/clover)
[![license](https://img.shields.io/github/license/coderfox/clover.svg?style=flat-square)](https://github.com/coderfox/clover/blob/master/LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-v2.3.4-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

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
| VMESS_WS_PATH         | /                                |                                          |
| VMESS_WS_HOST         | the same as PROXY_HOST           |                                          |
| VMESS_WS_HEADERS      | {}                               | JSON representing all the header keys, `Host` excluded |

Start
-----

```sh
tsc
npm start
```

or you may utilize the `docker-compose.yml`.

License
-----

```
clover shadowsocks manyuser frontend
Copyright (C) 2017 coderfox

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```