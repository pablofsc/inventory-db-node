import { Request, Response } from 'express'
require('dotenv').config()

const Pool = require('pg').Pool

console.log(process.env)

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

const getBatchTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Batch"', (error: Error, results: any) => {
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

const registerBatch = (req: Request, res: Response) => {
    console.log("Received new batch to be registered:")
    console.log(req.body)

    const { product, supplier, quantity, date, cost } = req.body

    if (product === undefined ||
        supplier === undefined ||
        quantity === undefined ||
        date === undefined ||
        cost === undefined) {
        console.log("Refused to register incomplete data")
        return
    }

    pool.query(`
        INSERT INTO public."Batch" (
            product_id, supplier_id, quantity, batch_date, unit_cost
        )
        VALUES (
            ${product}, ${supplier}, ${quantity}, '${date}', ${cost}
        );`, (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json({ "results": "success" })
    })
}

const registerClient = (req: Request, res: Response) => {
    console.log("Received new client to be registered:")
    console.log(req.body)

    const { name } = req.body

    if (name === undefined) {
        console.log("Refused to register incomplete data")
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

    const { name, price, description } = req.body

    if (name === undefined ||
        price === undefined ||
        description === undefined) {
        console.log("Refused to register incomplete data")
        return
    }

    pool.query(`
        INSERT INTO public."Product" (
            name, default_price, description
        )
        VALUES (
            '${name}', ${price}, '${description}'
        );`, (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json({ "results": "success" })
    })
}

const registerSale = (req: Request, res: Response) => {
    console.log("Received new sale to be registered:")
    console.log(req.body)

    const { product, batch, client, quantity, date, price } = req.body

    if (product === undefined ||
        batch === undefined ||
        client === undefined ||
        quantity === undefined ||
        date === undefined ||
        price === undefined) {
        console.log("Refused to register incomplete data")
        return
    }

    let consistent = true

    pool.query(`SELECT product_id FROM public."Batch" WHERE id = ${batch}`)
        .then((result: any) => {
            if (result.rows[0].product_id != product) {
                console.log("Batch code indicated is not of desired product. Cancelled.")
                consistent = false
            }
        })
        .catch((e: Error) => console.log(e))

    if (consistent) {
        pool.query(`
        INSERT INTO public."Sale" (
            product_id, batch_id, client_id, quantity, sale_date, price
        )
        VALUES (
            ${product}, ${batch}, ${client}, ${quantity}, '${date}', ${price}
        );`, (error: Error, results: any) => {
            if (error) { throw error }

            res.status(200).json({ "results": "success" })
        })
    }
}

const registerSupplier = (req: Request, res: Response) => {
    console.log("Received new supplier to be registered:")
    console.log(req.body)

    const { name, description } = req.body

    if (name === undefined ||
        description === undefined) {
        console.log("Refused to register incomplete data")
        return
    }

    pool.query(`
        INSERT INTO public."Supplier" (
            name, description
        )
        VALUES (
            '${name}', '${description}'
        );`, (error: Error, results: any) => {
        if (error) { throw error }

        res.status(200).json({ "results": "success" })
    })
}

export {
    getInventoryTable,
    getBatchTable,
    getClientTable,
    getSaleTable,

    registerBatch,
    registerClient,
    registerProduct,
    registerSale,
    registerSupplier
}