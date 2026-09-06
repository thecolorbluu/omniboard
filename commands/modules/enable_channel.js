const { enableChannel } = require('../../db.js');

async function enable_channel(interaction) {
  const targetChannelId = interaction.channelId;
  enableChannel.run(targetChannelId);

  await interaction.reply("This channel will have messages posted on boards. Run `disable_channel` to reverse.");
}

module.exports = enable_channel;