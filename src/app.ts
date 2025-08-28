import { Client, Events, GatewayIntentBits } from 'discord.js';
import sql from './postgres.ts';

const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once( Events.ClientReady, readyClient => {
    console.log(`Logging in again as fdsf cool: ${readyClient.user.tag}`);
});

client.login(token);