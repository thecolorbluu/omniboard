const { SlashCommandBuilder, PermissionFlagsBits, Routes } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

const { clientID } = process.env;

const commandData = {
  disable_channel: new SlashCommandBuilder()
    .setName("disable_channel")
    .setDescription("Disable boarding messages from this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  enable_channel: new SlashCommandBuilder()
    .setName("enable_channel")
    .setDescription("Enable boarding messages from this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
}

const commandModules = fs.readdirSync(path.join(__dirname, 'modules'))
  .filter(fileName => fileName.endsWith('.js'))
  .map(fileName => require(`./modules/${fileName}`));

const commands = new Map(
  commandModules.map(module => [
    module.name,
    module
  ])
);

async function runCommand(interaction) {
  try {
    const commandModule = commands.get(interaction.commandName);
    commandModule(interaction);
  } catch (err) {
    console.log(err);
  }
}

async function syncCommands(rest) {
  const data = Object.values(commandData).map(c => c.toJSON());
  await rest.put(Routes.applicationCommands(clientID), { body: data });
  console.log(`Successfully synced ${data.length} commands`);
}

module.exports = { runCommand, syncCommands };