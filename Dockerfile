FROM node:8-alpine as base
LABEL maintainer=coderfox<docker@xfox.me>

# install build tools
RUN apk add --no-cache make gcc g++ python
RUN yarn global add pkg pkg-fetch

ENV NODE node8
ENV PLATFORM alpine
ENV ARCH x64
RUN pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

# install dependencies
COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN yarn install
RUN npm rebuild bcrypt --build-from-source

# build server
COPY . .
RUN ./node_modules/.bin/tsc --sourceMap false
# build client
WORKDIR /app/client
ENV PUBLIC_URL /app
RUN yarn run build

# build binary
WORKDIR /app
RUN pkg . --targets ${NODE}-${PLATFORM}-${ARCH} --out-path=build
RUN cp ./node_modules/bcrypt/lib/binding/*.node build/
RUN cp ./node_modules/sqlite3/lib/binding/**/*.node build/

FROM node:8-alpine AS release

COPY --from=base /app/build /app
WORKDIR /app

EXPOSE 3000
CMD [ "./clover" ]