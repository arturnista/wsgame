# Initial configs
FROM node:10.16.1

ARG NWGAME_API_RELEASE

RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

RUN groupadd -r nwgame && useradd -r -g nwgame nwgame

WORKDIR /service/nwgame/

# Install packages
COPY package.json .

RUN npm install --production

LABEL description="nwgame-api image" \
      release=$NWGAME_API_RELEASE

# Copy files
COPY ./src ./src

COPY ./site ./site

COPY ./nwgame-firebase.json ./src/Database/nwgame-firebase.json

COPY ./server.js ./server.js

EXPOSE 5000-6000

# Permissions
RUN chown -R nwgame:nwgame .

USER nwgame

ENTRYPOINT ["node", "server"]
