import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import * as Commands from "./commands.ts"
import sql from './postgres.ts';
import { exit } from 'process';

const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const commandCollection = new Collection<string, Commands.CommandType>();

const dbConnectTest = await sql`SELECT 1`
    .catch((error) => console.error(error));
if (!dbConnectTest) exit(1);

for (const command of Object.values(Commands)) {
    commandCollection.set(command.command.name, command);
}

client.on( Events.InteractionCreate, async interaction => {
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

client.once( Events.ClientReady, readyClient => {
    console.log(`Logging in again as fdsf cool: ${readyClient.user.tag}`);
});

client.login(token);