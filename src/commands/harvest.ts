import { Client, Message, SlashCommandBuilder, TextChannel, type Interaction } from "discord.js";
import type { CommandType } from "../commands.ts";
import sql from "../postgres.ts";

class DiscordMessage {
    id: string
    guildId: string
    channelId: string
    sentBy: string
    sentByDisplayName: string
    sentAt: number
    messageContent: string
    createdDate: number

    constructor(message: DiscordMessage) {
        this.id = message.id,
        this.guildId = message.guildId,
        this.channelId = message.channelId,
        this.sentBy = message.sentBy,
        this.sentByDisplayName = message.sentBy,
        this.sentAt = message.sentAt,
        this.messageContent = message.messageContent,
        this.createdDate = message.createdDate;
    }
};

export const Harvest: CommandType = {
    command: new SlashCommandBuilder()
        .setName('harvest')
        .setDescription('Harvest all the messages from this channel for the bot to cache.'),
    async execute(interaction): Promise<void> {
        
        if (typeof interaction.channelId == "string") {
            await interaction.reply("Successfully queued message fetcher, this may take more than 15 minutes to complete so you may not get any further responses");

            const messagesResult = await getAllMessages(interaction.channelId, interaction.client);

            if (!messagesResult) {
                await interaction.followUp("An error occurred while saving messages to the database");
            } else {
                await interaction.followUp("Messages were saved to DB successfully");
            }
        } else {
            await interaction.reply("Message was not sent from a channel somehow, can not harvest");
        }
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
            const savedMessagesToDB = await saveMessages(messages.values());
            if (!savedMessagesToDB) return false;
        }
    }
    return true;
}

async function saveMessages(messages: MapIterator<Message<true>>): Promise<boolean> {
    let transformedMessages: DiscordMessage[] = [];
    messages.forEach(message => transformedMessages.push(
        new DiscordMessage({
            id: message.id,
            guildId: message.guildId,
            channelId: message.channelId,
            sentBy: message.author.username,
            sentByDisplayName: message.author.displayName,
            sentAt: message.createdTimestamp,
            messageContent: message.content,
            createdDate: new Date().getDate()
    })));

    if (transformedMessages.length === 0) return false;

    const result = await sql`
        INSERT INTO messages ${ sql(transformedMessages) } ON CONFLICT DO NOTHING;
    `.catch((error) => console.error(error));

    if (!result) return false;

    console.log(`Transformed messages length: ${transformedMessages.length}, Inserted ${result.count} rows`);

    return true;
}