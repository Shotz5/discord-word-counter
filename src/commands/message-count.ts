import { EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import type { CommandType } from "../commands.ts";
import sql from "../postgres.ts";

type MessageCountType = {
    count: number
}

export const addEmbed = (user: User, count: number) => {
    return new EmbedBuilder()
        .setTitle("Discord Word Counter")
        .setAuthor({
            name: user.displayName,
            iconURL: user.displayAvatarURL() 
        })
        .setDescription("Some statistics about the word this user has sent to this channel...")
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: "Mentioned", value: count.toString(), inline: true },
            { name: '\u200B', value: '\u200B' }
        )
        .setFooter({text: "As of the time this message was sent by the bot"})
}

export const MessageCount: CommandType = {
    command: new SlashCommandBuilder()
        .setName('message-count')
        .setDescription('Get count of the amount of times a user has said a word')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to search')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('string')
                .setDescription('The string to search for')
                .setRequired(true)
        ),
    async execute(interaction): Promise<void> {
        const user = interaction.options.getUser('user');
        const string = interaction.options.getString('string');

        if (!user || !string) {
            await interaction.reply("Please supply both a user and a string to search for.");
            return;
        }

        await interaction.deferReply();

        const result = await getWordCount(user, string);
        if (result === false) {
            await interaction.followUp({ embeds: [addEmbed(user, string)] });
            return;
        }

        await interaction.followUp({ embeds: [addEmbed(user, result)] });
    }
}

async function getWordCount(user: User, word: string): Promise<number | false> {
    const like = `%${word}%`;
    const sqlResult = await sql<MessageCountType[]>`
        SELECT count(*) AS count
        FROM messages
        WHERE messages."messageContent" LIKE ${like}
        AND messages."sentBy" = ${user.username};
    `.catch((error) => console.error(error));

    
    if (!sqlResult || !sqlResult[0]) {
        console.error("Unable to find count of word.");
        return false;
    }

    console.log(sqlResult[0].count);
    return sqlResult[0].count;
}
