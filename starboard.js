const { Colors, ChannelType, ContainerBuilder, TextDisplayBuilder, FileBuilder, MessageFlags, MediaGalleryItemBuilder, MediaGalleryBuilder } = require('discord.js');
const db = require('./db.js');
const { threshold, boardCategoryID } = process.env;

const getColors = db.db.prepare(`
  SELECT colors FROM emojiBoards
  WHERE channelID = ?
`);

function buildContainer(message, count, emoji, reaction, serverEmoji, newChannel) {
  if (serverEmoji) emoji = `<:${reaction}:${serverEmoji}>`;
  const boardContainer = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${emoji} **${count}** - ${message.url} (<@${message.author.id}>)`),
      new TextDisplayBuilder()
        .setContent(message.content || "*No content*")
    );
  const files = [];
  message.attachments.values().forEach(att => {
    files.push({
      attachment: att.url,
      name: att.name,
      contentType: att.contentType
    });
  });
  const mGallery = new MediaGalleryBuilder();
  files.forEach(att => {
    if (att.contentType?.startsWith("image/")) {
      mGallery.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${att.name}`));
    } else {
      boardContainer.addFileComponents(new FileBuilder().setURL(`attachment://${att.name}`));
    }
  });
  if (mGallery.items.length) boardContainer.addMediaGalleryComponents(mGallery);
  const colors = JSON.parse(getColors.get(newChannel.id).colors);
  const thisColor = colors[Math.floor(Math.random() * colors.length)];
  boardContainer.setAccentColor(thisColor);
  return {boardContainer, files};
}

async function postMessage(message, reaction, serverEmoji, count, emoji, client) {
  if (count < threshold) return;
  if (db.messageExists(message.id, reaction) || message.author.bot) return;
  const guild = await message.guild.fetch();
  let newChannel;

  if (!db.boardExists(reaction)) {
    newChannel = await guild.channels.create({
      name: `${reaction}-board`,
      type: ChannelType.GuildText,
      parent: boardCategoryID
    });
    db.createBoard.run(reaction, newChannel.id, JSON.stringify([0xff88dd, 0x99ffbb, 0xffdd99, 0x2244bb], null, 0))
  } else {
    newChannel = db.getBoard.get(reaction).channelID;
    newChannel = await guild.channels.fetch(newChannel);
  }

  if (db.messageExists(message.id, newChannel.id)) {
    await updateMessage(
      db.getMessage.get(message.id, newChannel.id).boardID,
      message, reaction, serverEmoji,
      count, emoji, client
    );
  } else {
    const {boardContainer, files} = buildContainer(message, count, emoji, reaction, serverEmoji, newChannel);
    const post = await newChannel.send({
      components: [boardContainer],
      files,
      flags: MessageFlags.IsComponentsV2
    });

    db.addMessage.run(
      message.id,
      newChannel.id,
      post.id
    );
    try { await post.react(emoji); } catch {};
  }
}

async function updateMessage(post, message, reaction, serverEmoji, count, emoji, client) {
  if (count < threshold) return;

  const guild = await message.guild.fetch();
  let newChannel = db.getBoard.get(reaction).channelID;
  newChannel = await guild.channels.fetch(newChannel);
  if (message.channel.id === newChannel.id) return;

  const boardMessage = await newChannel.messages.fetch(post);
  const { boardContainer, files } = buildContainer(message, count, emoji, reaction, serverEmoji, newChannel);
  boardContainer.setAccentColor(boardMessage.components[0].accentColor);

  await boardMessage.edit({
    components: [boardContainer],
    files, flags: MessageFlags.IsComponentsV2
  });
}

module.exports = postMessage;