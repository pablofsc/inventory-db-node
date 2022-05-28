import { Request, Response } from 'express'
import * as op from './database'

require('dotenv').config()

const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    }
})


export const getInventoryTable = (req: Request, res: Response) => {
    return (op.selectAll('Product'))
}

export const getClientTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Client"', (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json(results.rows)
    })
}

export const getSaleTable = (req: Request, res: Response) => {
    pool.query('SELECT * FROM public."Sale"', (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json(results.rows)
    })
}

export const registerClient = (req: Request, res: Response) => {
    console.log("Received new client to be registered:")
    console.log(req.body)

    const { name } = req.body

    if (!name) {
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
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}

export const registerProduct = (req: Request, res: Response) => {
    console.log("Received new product to be registered:")
    console.log(req.body)

    const { name, price, quantity } = req.body

    if (!name || !price || !quantity) {
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
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}

export const registerSale = (req: Request, res: Response) => {
    console.log("Received new sale to be registered:")
    console.log(req.body)

    const { product, client, quantity, date, price } = req.body

    if (!product || !client || !quantity || !date || !price) {
        console.log("Refused to register incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`SELECT quantity_in_stock FROM public."Product" WHERE id = ${product}`)
        .then((result: any) => {
            if (!result.rows[0] || result.rows[0].quantity_in_stock < quantity) {
                console.log("Refused to register sale with insufficient stock")
                res.status(400).json({ "results": "invalid" })
            }
            else {
                console.log("Sale is consistent")
                pool.query(`
                INSERT INTO public."Sale" (
                    product_id, client_id, quantity, sale_date, price
                )
                VALUES (
                    ${product}, ${client}, ${quantity}, '${date}', ${price}
                );`, (error: Error, results: any) => {
                    if (error) {
                        res.status(500).json({ "results": "error" })
                        throw error
                    }
                    else {
                        pool.query(`
                        UPDATE public."Product"
                        SET quantity_in_stock = quantity_in_stock - 1
                        WHERE id = ${product};
                        `, (error: Error, results: any) => {
                            if (error) {
                                res.status(500).json({ "results": "error" })
                                throw error
                            }
                        })

                        console.log("Registered")
                        res.status(200).json({ "results": "success" })
                    }
                })
            }
        })
        .catch((e: Error) => console.log(e))
}

export const updateClient = (req: Request, res: Response) => {
    console.log("Received new update to client:")
    console.log(req.body)

    const { id, name } = req.body

    if (!name || !id) {
        console.log("Refused to update with incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        UPDATE public."Client"
        SET name='${name}'
        WHERE id = ${id};
        `, (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}

export const updateProduct = (req: Request, res: Response) => {
    console.log("Received new update to product:")
    console.log(req.body)

    const { id, name, price, quantity } = req.body

    if (!name || !id || !price || !quantity) {
        console.log("Refused to update with incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        UPDATE public."Product"
        SET name='${name}', default_price=${price}, quantity_in_stock=${quantity}
        WHERE id = ${id};
        `, (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}


export const deleteClient = (req: Request, res: Response) => {
    console.log("Received request to delete a client:")
    console.log(req.body)

    const { id } = req.body

    if (!id) {
        console.log("Refused to perform delete request with incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        DELETE FROM public."Client"
        WHERE id = ${id};
        `, (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}

export const deleteProduct = (req: Request, res: Response) => {
    console.log("Received request to delete a product:")
    console.log(req.body)

    const { id } = req.body

    if (!id) {
        console.log("Refused to perform delete request with incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    pool.query(`
        DELETE FROM public."Product"
        WHERE id = ${id};
        `, (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }

        res.status(200).json({ "results": "success" })
    })
}