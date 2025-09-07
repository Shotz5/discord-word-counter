import type { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"

export type CommandType = {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>
}

export { Harvest } from "./commands/harvest.ts";
export { MessageCount } from "./commands/message-count.ts";
export { StopListening } from "./commands/stop-listening.ts";