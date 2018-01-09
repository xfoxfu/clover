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

Please use the built-in control panel at `/admin`.

It discovers config file at the follwing sequence:

1. environment variable `CLOVER_CONFIG`
2. /config/config.yaml
3. /config/config.sample.yaml

And the default storage SQLite db is at `/clover.db`, unless defined in config file.

Start
-----

```sh
tsc
npm start
```

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