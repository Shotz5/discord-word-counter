import postgres from 'postgres'

const sql = postgres({
    host: process.env.DB_HOST as string,
    port: process.env.DB_PORT as number | undefined,
    database: process.env.DB_NAME as string,
    username: process.env.DB_USER as string,
    password: process.env.DB_PASS as string
})

export default sql;