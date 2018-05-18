# Mellow

[![Discord](https://img.shields.io/badge/Discord-Mellow-7289DA.svg?style=flat-square)](https://discord.gg/4ys8Mkv)

> A little project to create a Discord Bot which can communicate with several APIs like Ombi, Sonarr, Radarr and Tautulli which are related to home streaming.

## Features

* Search for Movies & TV Shows in Ombi
* Request Movies & TV Shows in Ombi
* Get a list of all libraries on your server in Tautulli
* More features for Ombi, Sonarr and Radarr following soon...

## Requirements

* [NodeJS 8.x+](https://nodejs.org/en/download/)
* [Yarn 1.5.1+](https://yarnpkg.com/en/docs/install)

## Configuration

* Create Discord App here: https://discordapp.com/developers/applications/me
* Take the Bot token from your application
* Type all needed information into ``/src/config.json``
	```json
	{
		"general" : {
			"token" : "",
			"ownerID" : "",
			"globalCommandPrefix" : "$",
			"deleteCommandMessages" : false
		},
		
		"request" : {
			"movie" : "",
			"tv" : ""
		},

		"ombi" : {
			"ip" : "",
			"port" : "",
			"apiKey" : ""
		},

		"sonarr" : {
			"ip" : "",
			"port" : "",
			"apiKey" : ""
		},

		"radarr" : {
			"ip" : "",
			"port" : "",
			"apiKey" : ""
		},

		"tautulli" : {
			"ip" : "",
			"port" : "",
			"apiKey" : ""
    	}
	}
	```
* ``token`` is your bot token which your can get from your bot application
* ``ownerID`` is the ID of your main discord account, you can get it from the Discord App with Developer Mode activated. Just right-click on you and select ``Copy ID``
* ``request`` contains ``movie`` and ``tv`` type in the role name which is allowed to request them (optional)
* ``globalCommandPrefix`` is the command prefix the bot will listen for commands (you can also tag the bot to use commands)
* ``deleteCommandMessages`` if set to true all commands written by the user will be deleted after bot answered
* ``ombi``, ``sonarr``, ``radarr`` and ``tautulli`` contain ``ip``, ``port`` and ``apiKey`` settings, which are self-explanatory

## Installation & Start

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

## Changelogs

* 1.1.9
	* Added the possibility to delete user commands after bot answered
	* Renamed searchtv & searchmovie to tv & movie
	* Removed console log in library command

* 1.1.6
	* Added Tautulli support
	* Added a new command for Tautulli: library
	* Updated README.md

* 1.1.3
	* Request roles are now optional (if nothing is set, everyone will be able to request)
	* Request fields in config now takes the role name (case sensitive) instead of the role ID
	* Timer for selecting a movie or tv show from list was set from 30sec to 120sec

* 1.1.0
	* Reworked searching for TV/Movies
	* Reworked config structure (now with ip:port instead of domain)
	* Added requesting to searching TV/Movies (works with an additional discord role as permission)
	* Fixed TVDB links in tv output

* 1.0.0
    * Initial Release with 2 commands for now

## Dependencies

* [Discord.js](https://github.com/discordjs/discord.js) (master)
* [Commando](https://github.com/discordjs/Commando) (master)

## Contributing

1. Fork it (<https://github.com/v0idp/Mellow/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request