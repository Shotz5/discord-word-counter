import type { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export type CommandType = {
    command: SlashCommandBuilder,
    execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>
}

export { Harvest } from "./commands/harvest.ts"