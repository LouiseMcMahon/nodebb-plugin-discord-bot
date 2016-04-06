# Discord Bot
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