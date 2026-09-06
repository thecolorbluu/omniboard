const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const emojiNameMap = require('emoji-name-map');
const emojiToName = Object.fromEntries(
  Object.entries(emojiNameMap.emoji).map(([name, emoji]) => [emoji, name])
);

const { token } = process.env;
const postMessage = require('./starboard.js');
const { runCommand } = require('./commands/commands.js');

const eventQueue = [];
let processingQueue = false;

function queueReaction(reaction, user) {
  eventQueue.push({ reaction, user });
  processQueue();
}

async function processQueue() {
  if (processingQueue) return;
  processingQueue = true;

  while (eventQueue.length > 0) {
  const { reaction, user } = eventQueue.shift();
  try {
    const message = reaction.message;
    const fetched = await message.fetch();
    const reactionData = fetched.reactions.cache;

    for (const [emoji, reaction] of reactionData.entries()) {
    const count = reaction.count;
    const serverEmoji = reaction._emoji.id;
    const name =
      emojiToName[reaction._emoji.name] ?? reaction._emoji.name;

    await postMessage(
      fetched, name,
      serverEmoji, count,
      emoji, client
    );
    }
  } catch (err) {
    console.error(`Error processing reaction event: ${err}`);
  }
  }
  processingQueue = false;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

client.once(Events.ClientReady, async (ready) => {
  console.log(`Connected as ${ready.user.tag}`);
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
  queueReaction(reaction, user);
});

client.on(Events.MessageReactionRemove, (reaction, user) => {
  queueReaction(reaction, user);
});

client.on(Events.InteractionCreate, (interaction) => {
  runCommand(interaction);
});

client.login(token);