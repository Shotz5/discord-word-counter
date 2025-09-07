import type { Message } from "discord.js"
import sql from "./postgres.ts"

export type ChannelType = {
    id: string,
    guildId: string,
    isListening: boolean,
    createdDate: number
}

export class DiscordMessage {
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

export async function saveMessages(messages: Message<true>[]): Promise<boolean> {
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
            createdDate: Date.now()
    })));

    if (transformedMessages.length === 0) return false;

    const result = await sql`
        INSERT INTO messages ${ sql(transformedMessages) } ON CONFLICT DO NOTHING;
    `.catch((error) => console.error(error));

    if (!result) return false;

    console.log(`Transformed messages length: ${transformedMessages.length}, Inserted ${result.count} rows`);

    return true;
}

export async function addChannelToListener(channelId: string, guildId: string): Promise<boolean> {
    const result = await sql`
        INSERT INTO channels ${ sql({
            id: channelId,
            guildId: guildId,
            isListening: true,
            createdDate: Date.now()
        }) } ON CONFLICT DO NOTHING;
    `.catch((error) => console.error(error));

    if (!result) return false;

    console.log(`Successfully inserted ${channelId} to DB.`);

    return true;
}
