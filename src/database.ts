require('dotenv').config()

const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    }
})

export const selectAll = (table: string) => {
    pool.query(`SELECT * FROM public."${table}"`, (error: Error, results: any) => {
        if (error) {
            return (JSON.stringify({ 'results': 'error' }))
        }
        else {
            return (JSON.stringify(results.rows))
        }
    })
}