import { readdirSync, readFileSync } from "fs";
import sql from "./postgres.ts";

type Migration = {
    id: number,
    fileName: string,
    createdDate: string,
}

const migrationsDir = "./src/migrations";

export async function executeMigrations(): Promise<boolean> {
    const migrationsRan = await sql<Migration[]>`SELECT * FROM migrations`
        .catch((error) => console.error(error));
    const fileNamesRan = [];
    if (!migrationsRan) {
        console.warn("Unable to get migrations from table, assuming this is first migrations run.");
    } else {
        for (const migration of migrationsRan) {
            fileNamesRan.push(migration.fileName);
        }
    }

    const files = readdirSync(migrationsDir).sort();
    for (const file of files) {
        if (fileNamesRan.includes(file)) {
            console.log(`Already ran file ${file}`);
            continue;
        }

        // const fileContent = readFileSync();
        const result = await sql.file(migrationsDir + "/" + file).catch((error) => console.error(error));
        if (!result) {
            console.error(`Failed to run migration ${file} on app statup.`);
            return false;
        }

        const insertMigration = await sql`
            INSERT INTO migrations ${ sql({ fileName: file, createdDate: Date.now() }) };
        `.catch((error) => console.error(error));
        if (!insertMigration) {
            console.error(`Failed to insert migration record for file ${file}`);
            return false;
        }

        console.log(`Successfully ran migration ${file}`);
    }
    return true;
}
