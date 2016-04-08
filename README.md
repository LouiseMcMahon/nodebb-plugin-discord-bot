# Discord Bot
[![Version](https://img.shields.io/npm/v/nodebb-plugin-discord-bot.svg)](https://www.npmjs.com/package/nodebb-plugin-discord-bot)
[![Dependencies](https://david-dm.org/lewismcmahon/nodebb-plugin-discord-bot.svg)](https://david-dm.org/lewismcmahon/nodebb-plugin-discord-bot)

A bot for discord that integrates with NodeBB and gives notifications of new posts.

`npm install nodebb-plugin-discord-bot`

Your bots account details can be added along with the channel ID you wish it to post in in the admin area or via environment variables.
```
export DISCORD_BOT_EMAIL="xxxxx"
export DISCORD_BOT_PASSWORD="yyyyy"
export DISCORD_BOT_CHANNEL="zzzzz"
```

To get the channel ID coppy the link to the channel and the number you need is the last long number IE for
`https://discordapp.com/channels/167038734745862144/167038734745862144` the id number would be `167038734745862144`.

The welcome message that is sent to any member that joins a server can be set in the admin area or via a hook as documented bellow.

##Files
The plugin will generate a  file named `tenc` in the nodebb root please make sure it can as this is where it stores the discord auth token.

##Hooks

The plugin has hooks you can use just as you would do normal NodeBB hooks.

###filter:nodebbbot.helpmessage
`filter:nodebbbot.helpmessage` passes `helpMessage` as string you should append the help message for your plugin to it.

###filter:nodebbbot.command.reply
`filter:nodebbbot.command.reply` passes `command`, `replies`, `fromDiscordUser` and `fromDiscordUserID`
* `command` is a string it contains what ever the user sent to your bot minus the `@bot` and with any white space around the string trimmed.
* `replies` is an array of all the messages that the bot will be send to the channel that the command was said in please `.push()` your reply on to it.
* `fromDiscordUser` is a string containing the discord usename of the user that sent the command.
* `fromDiscordUserID` is a string containing the discord ID of the user that sent the command.

###static:nodebbbot.newmemberjoined
`static:nodebbbot.newmemberjoined` passes `discordUsername` and `discordUserID` when ever a user connects to any server that your bot is in.
* `discordUsername` is a string containing the discord usename of the user that sent the command.
* `discordUserID` is a string containing the discord ID of the user that sent the command.

###filter:nodebbbot.welcome.message
`filter:nodebbbot.welcome.message` passes `discordUsername`, `discordUserID` and `welcomeMessage` overwrite `welcomeMessage` as you wish it will be direct message to the user
* `discordUsername` is a string containing the discord usename of the user that sent the command.
* `discordUserID` is a string containing the discord ID of the user that sent the command.
* `welcomeMessage`  is a string containing an the current welcome message overwrite at will.
