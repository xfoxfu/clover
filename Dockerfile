FROM node:8-alpine AS deps
LABEL maintainer=coderfox<docker@xfox.me>

RUN apk add --no-cache make gcc g++ python yarn 

ENV NODE_ENV production
COPY ./package.json /deps/
COPY ./yarn.lock /deps/
WORKDIR /deps
RUN yarn install --production
RUN npm rebuild bcrypt --build-from-source

FROM node:8-alpine AS build
COPY . /app
COPY --from=deps /deps/node_modules /app/node_modules
WORKDIR /app
RUN ./node_modules/.bin/tsc --outDir dist --sourceMap false

FROM node:8-alpine
COPY --from=build /app/dist /app
COPY --from=build /app/views /app/views
COPY --from=deps /deps/node_modules /app/node_modules
WORKDIR /app
EXPOSE 3000
CMD ["node", "bin/run"]
