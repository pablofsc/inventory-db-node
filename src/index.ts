import express, { Request, Response } from 'express';
import bodyparser from 'body-parser';
import dotenv from 'dotenv';

const cors = require('cors');

import * as db from './controllers';

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyparser.json());
app.use(
    bodyparser.urlencoded({
        extended: true,
    })
);

app.get('/inventory', db.getInventory);
app.get('/customers', db.getCustomers);
app.get('/sales', db.getSales);

app.post('/newproduct', db.registerProduct);
app.post('/newcustomer', db.registerCustomer);
app.post('/newsale', db.registerSale);

app.patch('/updatecustomer', db.updateCustomer);
app.patch('/updateproduct', db.updateProduct);
app.patch('/updatestock', db.addStock);

app.delete('/deletecustomer', db.deleteCustomer);
app.delete('/deleteproduct', db.deleteProduct);

app.get('/', (req: Request, res: Response) => {
    res.send('Working');
});

app.listen(port, () => console.log(`NOW RUNNING ON PORT ${port}`));
