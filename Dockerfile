FROM node:8.12.0

ARG NWGAME_API_RELEASE

RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

RUN groupadd -r nwgame && useradd -r -g nwgame nwgame

WORKDIR /service/nwgame/

COPY package.json .

RUN npm install --production

LABEL description="nwgame-api image" \
      release=$NWGAME_API_RELEASE

COPY ./src ./src

COPY ./site ./site

COPY ./server.js ./server.js

EXPOSE 5000

RUN chown -R nwgame:nwgame .

USER nwgame

ENTRYPOINT ["node", "server"]
