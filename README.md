# Mellow

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA.svg?style=flat-square)](https://discord.gg/zx2BWp2) 
[![Docker](https://img.shields.io/badge/Docker-Hub-lightblue.svg?style=flat-square)](https://cloud.docker.com/u/voidp/repository/docker/voidp/mellow)

Discord Bot which can communicate with several APIs like Ombi, Sonarr, Radarr and Tautulli which are related to home streaming.
Based off of node:10.16.2

## Features

* Search for Movies & TV Shows in Ombi
* Request Movies & TV Shows in Ombi
* Get a list of all Libraries on your Server in Tautulli
* More features for Ombi, Sonarr and Radarr following soon...

## Requirements

* [NodeJS 10.x +](https://nodejs.org/en/download/)
* [Yarn 1.x +](https://yarnpkg.com/en/docs/install)

## Installation & Configuration

Before starting your bot you will need to invite it to your server first. I recommend using this for beginners: https://discordapi.com/permissions.html
Your bot will need following permissions:

* Read Messages
* Embed Links
* Read Message History
* Use External Emojis
* Send Messages
* Manage Messages
* Attach Files
* Mention @everyone
* Add Reactions

It's a bit more than the bot actually needs but if anything new is beeing added to the bot, it will already have the permissions to do it.
Enter your bot client id into the field down below in the Permission Calculator. You can get it from your bot application site where you created your bot.
Next click on the link at the bottom and invite the bot to your server.

Go into the Mellow root folder and type
```sh
yarn prestart
```

To start the bot just simply type
```sh
yarn start
```

After starting the bot you will need to configure it by visiting ``youripordomain:5060``
and filling out the Bot Settings which will start the bot with your token.
Note: It's recommended to set a username and password in General Settings. This way only you can access the web interface.

## Docker Setup & Start

If you want to use this bot in a docker container you have to follow these steps:
* Pull from docker hub: ``docker pull voidp/mellow``
* Run docker image:
```
docker run -d --restart=always --name mellow \
   -v /opt/appdata/mellow/:/usr/src/app/data/ \
   -p 5060:5060 \
   voidp/mellow
```
* if you want persistent data create a folder in ``/opt/appdata/mellow/``
or use docker compose. A yaml file is provided for this purpose.

## Contributing

1. Fork it (<https://github.com/v0idp/Mellow/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
