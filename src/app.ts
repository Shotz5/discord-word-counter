import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import * as Commands from "./commands.ts"
import sql from './postgres.ts';
import { exit } from 'process';
import { saveMessages, type ChannelType } from './common.ts';

const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const commandCollection = new Collection<string, Commands.CommandType>();

const dbConnectTest = await sql`SELECT 1`
    .catch((error) => console.error(error));
if (!dbConnectTest) exit(1);

for (const command of Object.values(Commands)) {
    commandCollection.set(command.command.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const executedCommand = commandCollection.get(interaction.commandName);

    if (!executedCommand) {
        console.error(`No command found by the name of ${interaction.commandName}`);
        return;
    }

    try {
        await executedCommand.execute(interaction);
    } catch (e) {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral })
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.on(Events.MessageCreate, async interaction => {
    console.log(`Received message event with guild ${interaction.guildId} and channel ${interaction.channelId} with content '${interaction.content}'`);
    if (!interaction.inGuild() || !interaction.channelId || interaction.content === '') return;

    const channels = await getListenedChannelsForGuild(interaction.guildId);
    console.log(`Channels listening to in guild: ${channels}`);
    if (!channels || !(channels.includes(interaction.channelId))) return;

    const result = await saveMessages([interaction]);
    if (!result) console.error("Wasn't able to save message sent to " + interaction.channel.name + " in " + interaction.guild.name);
    console.log("Successfully saved message to DB");
});

client.once( Events.ClientReady, readyClient => {
    console.log(`Logging in again as fdsf cool: ${readyClient.user.tag}`);
});

const getListenedChannelsForGuild = async (guildId: string): Promise<string[] | false> => {
    const results = await sql<ChannelType[]>`
        SELECT * FROM channels
        WHERE channels."guildId" = ${guildId}
        AND channels."isListening" = true;
    `.catch((error) => console.error(error));

    if (!results) {
        return false;
    }

    const channels = results.map((result) => result.id)
    return channels;
}

client.login(token);