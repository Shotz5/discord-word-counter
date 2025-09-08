import { SlashCommandBuilder } from "discord.js";
import type { CommandType } from "../commands.ts";
import { addChannelToListener, addErrorEmbed, addSuccessEmbed } from "../common.ts";

export const StartListening: CommandType = {
    command: new SlashCommandBuilder()
        .setName('start-listening')
        .setDescription("Start listening to this channel."),
    async execute(interaction): Promise<void> {
        if (!interaction.channelId || !interaction.guildId) {
            await interaction.reply({ embeds: [addErrorEmbed("Message was not sent from a channel within a guild somehow, can not start listening.")] });
            return;
        }

        const result = await addChannelToListener(interaction.channelId, interaction.guildId, true);
        if (!result) {
            await interaction.reply({ embeds: [addErrorEmbed("An error occurred while trying to stop listening to this channel.")] });
            return;
        }

        await interaction.reply({ embeds: [addSuccessEmbed("Successfully started listening to this channel.")] });
    }
}
