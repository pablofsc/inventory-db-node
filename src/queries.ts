import { Request, Response } from 'express'
require('dotenv').config()

const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    }
})

const getInventoryTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Product"', (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json(results.rows)
    })
}

const getClientTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Client"', (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json(results.rows)
    })
}

const getSaleTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Sale"', (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json(results.rows)
    })
}

const registerClient = (req: Request, res: Response) => {
    console.log("Received new client to be registered:")
    console.log(req.body)

    const { name } = req.body

    if (name === undefined) {
        console.log("Refused to register incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        INSERT INTO public."Client" (
            name
        )
        VALUES (
            '${name}'
        );`, (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json({ "results": "success" })
    })
}

const registerProduct = (req: Request, res: Response) => {
    console.log("Received new product to be registered:")
    console.log(req.body)

    const { name, price, description: quantity } = req.body

    if (name === undefined ||
        price === undefined ||
        quantity === undefined) {
        console.log("Refused to register incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        INSERT INTO public."Product" (
            name, default_price, quantity_in_stock
        )
        VALUES (
            '${name}', ${price}, ${quantity}
        );`, (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json({ "results": "success" })
    })
}

const registerSale = (req: Request, res: Response) => {
    console.log("Received new sale to be registered:")
    console.log(req.body)

    const { product, client, quantity, date, price } = req.body

    if (product === undefined ||
        client === undefined ||
        quantity === undefined ||
        date === undefined ||
        price === undefined) {
        console.log("Refused to register incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    let consistent = false

    pool.query(`SELECT quantity_in_stock FROM public."Product" WHERE id = ${product}`)
        .then((result: any) => {
            if (result.rows[0].quantity_in_stock < quantity) {
                console.log("Refused to register sale of inexistent item")
            }
            else {
                consistent = true
            }
        })
        .catch((e: Error) => console.log(e))

    if (consistent) {
        pool.query(`
        INSERT INTO public."Sale" (
            product_id, client_id, quantity, sale_date, price
        )
        VALUES (
            ${product}, ${client}, ${quantity}, '${date}', ${price}
        );`, (error: Error, results: any) => {
            if (error) { throw error }

            res.status(200).json({ "results": "success" })
        })
    }
}

export {
    getInventoryTable,
    getClientTable,
    getSaleTable,

    registerClient,
    registerProduct,
    registerSale
}