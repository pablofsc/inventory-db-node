import { Request, Response } from 'express';

import { checkCompleteness, isCustomer, isProduct } from './interfaces';
import * as queries from './queries';
import * as utils from './utils';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    console.log('Received request for inventory table');
    utils.performAndRespond(res, queries.retrieveTable, 'Product');
};

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    console.log('Received request for customer table');
    utils.performAndRespond(res, queries.retrieveTable, 'Customer');
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
    console.log('Received request for sales table');
    utils.performAndRespond(res, queries.retrieveSales, 'Sale');
};

export const registerProduct = (req: Request, res: Response): void => {
    if (checkCompleteness(req.body, isProduct))
        utils.performAndRespond(res, queries.insertProduct, req.body);
    else
        res.status(400).json({ results: 'incomplete' });
};

export const registerCustomer = (req: Request, res: Response): void => {
    if (checkCompleteness(req.body, isCustomer))
        utils.performAndRespond(res, queries.insertCustomer, req.body);
    else
        res.status(400).json({ results: 'incomplete' });
};

export const registerSale = async (req: Request, res: Response): Promise<void> => {
    if (!(await utils.saleIsValid(req.body))) {
        res.status(400).json({ results: 'invalid' });
        return;
    }

    queries.insertSale(req.body)
        .then(() => queries.updateStock(req.body.product_id, req.body.quantity * (-1)))
        .then(() => {
            console.log('Registered');
            res.status(200).json({ results: 'success' });
        })
        .catch((e: Error) => {
            console.error(e);
            res.status(500).json({ results: 'error' });
        });
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    if (!checkCompleteness(req.body, isCustomer)) {
        res.status(400).json({ results: 'incomplete' });
        return;
    }

    if (!await utils.exists(req.body.id, 'Customer')) {
        res.status(400).json({ results: 'invalid' });
        return;
    }

    utils.performAndRespond(res, queries.updateCustomer, req.body);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    if (!checkCompleteness(req.body, isProduct)) {
        res.status(400).json({ results: 'incomplete' });
        return;
    }

    if (!await utils.exists(req.body.id, 'Product')) {
        res.status(400).json({ results: 'invalid' });
        return;
    }

    utils.performAndRespond(res, queries.updateProduct, req.body);
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;

    if (!await utils.exists(id, 'Customer')) {
        res.status(400).json({ results: 'invalid' });
        return;
    }

    const affectedSales = await queries.findSalesByColumn('customer_id', id);
    const customerName = await queries.retrieveSpecificValue('Customer', 'name', id) as string;

    for (let sale of affectedSales) {
        console.log(sale);
        queries.addNamesToSale(sale.id, customerName, '');
    }

    req.body.table = 'Customer';

    utils.performAndRespond(res, queries.remove, req.body);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;

    if (!await utils.exists(id, 'Product')) {
        res.status(400).json({ results: 'invalid' });
        return;
    }

    const affectedSales = await queries.findSalesByColumn('product_id', id);
    const productName = await queries.retrieveSpecificValue('Product', 'name', id) as string;

    for (let sale of affectedSales) {
        console.log(sale);
        queries.addNamesToSale(sale.id, '', productName);
    }

    req.body.table = 'Product';

    utils.performAndRespond(res, queries.remove, req.body);
};

export const addStock = (req: Request, res: Response): void => {
    const { id, quantity } = req.body;

    if (!id || !quantity) {
        console.log('Refused to update with incomplete data');
        res.status(400).json({ results: 'incomplete' });
        return;
    }

    queries.updateStock(req.body.id, quantity)
        .then(() => {
            console.log('Registered');
            res.status(200).json({ results: 'success' });
        });
};
