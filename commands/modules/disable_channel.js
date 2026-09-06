const { disableChannel } = require('../../db.js');

async function disable_channel(interaction) {
  const targetChannelId = interaction.channelId;
  disableChannel.run(targetChannelId);

  await interaction.reply("This channel will no longer have its messages posted on any boards. Run `enable_channel` to reverse.");
}

module.exports = disable_channel;