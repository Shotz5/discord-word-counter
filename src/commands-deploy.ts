import { REST, Routes, type RESTPutAPIApplicationCommandsResult } from "discord.js";
import * as Commands from "./commands.ts"
import { exit } from "process";

const token = process.env.TOKEN;
const clientId = "1410527904793890866";
const guildId = "924902022535348265";

if (typeof token != "string" || typeof clientId != "string" || typeof guildId != "string") {
	console.log("All required values are not provided");
    exit(1);
}

const rest = new REST().setToken(token);
const commands = [];

for (const command of Object.values(Commands)) {
    commands.push(command.command.toJSON());
}

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		) as RESTPutAPIApplicationCommandsResult;

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();