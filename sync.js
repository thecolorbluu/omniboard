const { REST } = require('discord.js');
const { syncCommands } = require('./commands/commands.js');

const { token } = process.env;
const rest = new REST({ version: '10' }).setToken(token);

syncCommands(rest);