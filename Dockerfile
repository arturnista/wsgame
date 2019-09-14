# Initial configs
FROM node:10.16.1

ARG MAGEARENA_API_RELEASE

RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

RUN groupadd -r magearena && useradd -r -g magearena magearena

WORKDIR /service/magearena/

# Install packages
COPY package.json .

RUN npm install --production

LABEL description="magearena-api image" \
      release=$MAGEARENA_API_RELEASE

# Copy files
COPY ./src ./src

COPY ./site ./site

COPY ./magearena-firebase.json ./src/Database/magearena-firebase.json

COPY ./.env ./.env

COPY ./server.js ./server.js

COPY /etc/letsencrypt/live/magearena.com/privkey.pem ./ssl/privkey.pem

COPY /etc/letsencrypt/live/magearena.com/cert.pem ./ssl/cert.pem

COPY /etc/letsencrypt/live/magearena.com/chain.pem ./ssl/chain.pem

EXPOSE 5000-6000

# Permissions
RUN chown -R magearena:magearena .

USER magearena

ENTRYPOINT ["node", "server"]
