If you don't like channel spam this bot might not be for you unless you make the threshold high

omniboard will post starboard-like posts for ANY emoji reaction (yes including server emojis) and if a channel doesn't exist for it, it makes one

# Setup
- First, copy `config.env.example` as `config.env` and fill in the information it requests
- Finally, run `npm run start` to start the bot and it should begin to work

# Config
- You require a Discord bot token, follow the instructions the config example gives you for most values
- The threshold determines how many reactions (greater than or equal to) are required to post a message on a board or make a new board for that message.
- The closedBoards bool (as "true" or "false") will create boards with or without some permissions disabled, like how most starboard channels do not let you send messages.