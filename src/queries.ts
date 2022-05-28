import { Request, Response } from 'express'
require('dotenv').config()
import * as dbu from './databaseutils'

const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    }
})

console.log(process.env.DATABASE_URL)

export const getInventoryTable = async (req: Request, res: Response): Promise<void> => {
    const result = await dbu.selectTable('Product')

    if (!result) { res.status(500).json({ "results": "error" }) }
    else { res.status(200).json(result) }
}

export const getClientTable = async (req: Request, res: Response): Promise<void> => {
    const result = await dbu.selectTable('Client')

    if (!result) { res.status(500).json({ "results": "error" }) }
    else { res.status(200).json(result) }
}

export const getSaleTable = async (req: Request, res: Response): Promise<void> => {
    const result = await dbu.selectTable('Sale')

    if (!result) { res.status(500).json({ "results": "error" }) }
    else { res.status(200).json(result) }
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

export const registerSale = async (req: Request, res: Response): Promise<void> => {
    console.log("Received new sale to be registered:")
    console.log(req.body)

    const { product, client, quantity, price } = req.body

    if (!product || !client || !quantity || !price) {
        console.log("Refused to register incomplete data")
        res.status(400).json({ "results": "incomplete" })
        return
    }

    const productName = await dbu.select('Product', 'name', product)
    if (!productName) {
        console.log("Refused to register sale of inexistent item")
        res.status(400).json({ "results": "invalid" })
        return
    }

    const productAmountInStock = await dbu.select('Product', 'quantity_in_stock', product)
    if (!productAmountInStock || productAmountInStock < quantity) {
        console.log("Refused to register sale with insufficient stock")
        res.status(400).json({ "results": "invalid" })
        return
    }

    const customerName = await dbu.select('Client', 'name', client)
    if (!customerName) {
        console.log("Refused to register sale to inexistent customer")
        res.status(400).json({ "results": "invalid" })
        return
    }

    console.log("Sale is consistent - saving to database")

    await pool.query(`
        INSERT INTO public."Sale" (
            product_id, client_id, quantity, price, product_name, client_name
        )
        VALUES (
            ${product}, ${client}, ${quantity}, ${price}, '${productName}', '${customerName}'
        );`, (error: Error, results: any) => {
        if (error) {
            res.status(500).json({ "results": "error" })
            throw error
        }
    })

    await pool.query(`
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


export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    console.log("Received request to delete a client:")
    console.log(req.body)

    const { id } = req.body

    if (!id || !await dbu.select('Client', 'id', id)) {
        console.log("Refused to perform delete request with incomplete data or inexistent target")
        res.status(400).json({ "results": "invalid" })
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

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    console.log("Received request to delete a product:")
    console.log(req.body)

    const { id } = req.body

    if (!id || !await dbu.select('Product', 'id', id)) {
        console.log("Refused to perform delete request with incomplete data or inexistent target")
        res.status(400).json({ "results": "invalid" })
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