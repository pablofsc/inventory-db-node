import express, { Request, Response } from 'express'
import bodyparser from 'body-parser'
import dotenv from 'dotenv'

const cors = require('cors')

import * as db from './queries'

dotenv.config()
const port = process.env.PORT

const app = express()

app.use(cors())
app.use(bodyparser.json())
app.use(
    bodyparser.urlencoded({
        extended: true
    })
)

app.get('/inventory', db.getInventoryTable)
app.get('/batches', db.getBatchTable)
app.get('/clients', db.getClientTable)
app.get('/sales', db.getSaleTable)

app.post('/newbatch', db.registerBatch)
app.post('/newclient', db.registerClient)
app.post('/newproduct', db.registerProduct)
app.post('/newsale', db.registerSale)
app.post('/newsupplier', db.registerSupplier)

app.get('/', (req: Request, res: Response) => {
    res.send('well done')
})

app.listen(port, () => console.log(`NOW RUNNING ON PORT ${port}`))