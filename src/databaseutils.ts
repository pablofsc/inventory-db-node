require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    }
})

export interface client {
    id: number,
    name: string
}

export interface product {
    id: number,
    name: string,
    default_price: string,
    quantity_in_stock: number
}

export interface sale {
    id: number,
    product_id: number,
    client_id: number,
    quantity: number,
    price: string,
    product_name: string,
    client_name: string
}

export const select = async (table: string, column: string, id: string): Promise<string | undefined> => {
    let result: undefined

    await pool.query(`SELECT ${column} FROM public."${table}" WHERE id = ${id}`)
        .then((response: any) => {
            if (response.rows[0] && column in response.rows[0]) {
                result = response.rows[0][column]
            }
        })

    return result
}

export const selectTable = async (table: string): Promise<string | undefined> => {
    let result: undefined

    await pool.query(`SELECT * FROM public."${table}"`)
        .then((response: any) => {
            if (response.rows[0]) {
                result = response.rows
            }
        })

    return result
}