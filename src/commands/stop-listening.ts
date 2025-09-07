import { SlashCommandBuilder } from "discord.js";
import type { CommandType } from "../commands.ts";
import sql from "../postgres.ts";

export const StopListening: CommandType = {
    command: new SlashCommandBuilder()
        .setName('stop-listening')
        .setDescription("Stop listening to this channel."),
    async execute(interaction): Promise<void> {
        if (!interaction.channelId || !interaction.guildId) {
            await interaction.reply("Message was not sent from a channel within a guild somehow, can not stop listening.")
            return;
        }

        const result = await updateChannel(interaction.channelId, interaction.guildId);
        if (!result) {
            await interaction.reply("An error occurred while trying to stop listening to this channel");
            return;
        }

        await interaction.reply("Successfully stopped listening to this channel.");
    }
}

async function updateChannel(channelId: string, guildId: string): Promise<boolean> {
    const result = await sql`
        UPDATE channels
        SET channels."isListening" = false
        WHERE channels.id = ${channelId}
        AND channels."guildId" = ${guildId}
    `.catch((error) => console.error(error));

    return (typeof result !== "undefined");
}