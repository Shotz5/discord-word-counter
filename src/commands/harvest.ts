import { Client, SlashCommandBuilder, TextChannel } from "discord.js";
import { addChannelToListener, saveMessages } from "../common.ts";
import type { CommandType } from "../commands.ts";

export const Harvest: CommandType = {
    command: new SlashCommandBuilder()
        .setName('harvest')
        .setDescription('Harvest all the messages from this channel for the bot to cache. Will listen after harvest.'),
    async execute(interaction): Promise<void> {
        if (!interaction.channelId || !interaction.guildId) {
            await interaction.reply("Message was not sent from a channel within a guild somehow, can not harvest.")
            return;
        }

        await interaction.reply("Successfully queued message fetcher, this may take more than 15 minutes to complete so you may not get any further responses.");

        const listenToChannel = await addChannelToListener(interaction.channelId, interaction.guildId);
        if (!listenToChannel) {
            await interaction.followUp("Unable to add channel to listener due to an error.");
        }

        const messagesResult = await getAllMessages(interaction.channelId, interaction.client);
        if (!messagesResult) {
            await interaction.followUp("An error occurred while saving messages to the database.");
        }
        
        await interaction.followUp("Messages were saved to DB successfully.");
    }
}

async function getAllMessages(channelId: string, client: Client): Promise<boolean> {
    const channel = client.channels.cache.get(channelId) as TextChannel;

    let messagePointer = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => messagePage.size === 1 ? messagePage.at(0) : null);

    while (messagePointer) {
        let messages = await channel.messages.fetch({ limit: 100, before: messagePointer.id });
        messagePointer = 0 < messages.size ? messages.at(messages.size - 1) : null;

        if (messagePointer) {
            const savedMessagesToDB = await saveMessages(messages.values().toArray());
            if (!savedMessagesToDB) return false;
        }
    }
    return true;
}
