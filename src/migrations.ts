// import sql from "./postgres.js";

// type Migrations = {
//     id: number,
//     file_name: number,
//     date_executed: string,
// }

// const MigrationsTable = "migrations";
// const fileDir = "./migrations";

// async function getExecutedMigrations() {
//     const statement = () => sql<Migrations[]>`
//         SELECT * FROM ${MigrationsTable}
//     `
//     const fileDir = 

//     const results = await statement();
// }

// Building out migrations functionality may be difficult, I'm saving it for a future problem