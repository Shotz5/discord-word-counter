import { SlashCommandBuilder } from "discord.js";
import type { CommandType } from "../commands.ts";
import sql from "../postgres.ts";
import { addErrorEmbed, addSuccessEmbed } from "../common.ts";

const UpdateStatus = {
    Updated: "UPDATED",
    NotExists: "NOT_EXISTS",
    Failed: "FAILED"
}

export const StopListening: CommandType = {
    command: new SlashCommandBuilder()
        .setName('stop-listening')
        .setDescription("Stop listening to this channel."),
    async execute(interaction): Promise<void> {
        if (!interaction.channelId || !interaction.guildId) {
            await interaction.reply({ embeds: [addErrorEmbed("Message was not sent from a channel within a guild somehow, can not stop listening.")] });
            return;
        }

        const result = await updateChannel(interaction.channelId, interaction.guildId);
        if (result === UpdateStatus.Failed) {
            await interaction.reply({ embeds: [addErrorEmbed("An error occurred while trying to stop listening to this channel.")] });
            return;
        } else if (result === UpdateStatus.NotExists) {
            await interaction.reply({ embeds: [addSuccessEmbed("This channel is not being listened to.")] });
            return;
        }

        await interaction.reply({ embeds: [addSuccessEmbed("Successfully stopped listening to this channel.")] });
    }
}

async function updateChannel(channelId: string, guildId: string): Promise<string> {
    const result = await sql`
        UPDATE channels
        SET "isListening" = false
        WHERE id = ${channelId}
        AND "guildId" = ${guildId}
    `.catch((error) => console.error(error));

    if (!result) return UpdateStatus.Failed;
    if (result.count === 0) return UpdateStatus.NotExists;
    else return UpdateStatus.Updated;
}
