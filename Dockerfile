FROM node:8-alpine AS deps
LABEL maintainer=coderfox<docker@xfox.me>

RUN apk add --no-cache make gcc g++ python yarn 

COPY ./package.json /deps/
COPY ./yarn.lock /deps/
WORKDIR /deps
RUN yarn install
RUN npm rebuild bcrypt --build-from-source

FROM node:8-alpine AS build
COPY --from=deps /deps/node_modules /app/node_modules
COPY . /app
WORKDIR /app
RUN ./node_modules/.bin/tsc --outDir dist --sourceMap false
WORKDIR /app/client
ENV PUBLIC_URL /app
RUN yarn run build

FROM node:8-alpine
ENV NODE_ENV production
COPY --from=deps /deps/node_modules /app/node_modules
COPY --from=build /app/dist /app
COPY --from=build /app/server/views /app/server/views
COPY --from=build /app/client/build /app/client/build
WORKDIR /app
EXPOSE 3000
CMD ["node", "bin/run"]
