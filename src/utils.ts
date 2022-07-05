import { Response } from 'express';

import * as queries from './queries';
import { checkCompleteness, isSale, sale } from './interfaces';

export const performAndRespond = async (response: Response, operation: Function, options: any): Promise<void> => {
    operation(options)
        .then((data: any) => {
            data.length > 0 ? null : data = { results: 'success' };
            response.status(200).json(data);
            console.log('Success at ' + operation.name);
        })
        .catch((error: Error) => {
            response.status(500).json({ status: 'error' });
            console.log(error);
        });
};

export const exists = async (id: number, table: string): Promise<boolean> => {
    if (!id) return false;

    if (await queries.retrieveSpecificValue(table, 'id', id))
        return true;
    else return false;
};

export const saleIsValid = async (sale: sale): Promise<boolean> => {
    if (!checkCompleteness(sale, isSale))
        return false;

    const product_name = <string>(await queries.retrieveSpecificValue('Product', 'name', sale.product_id));
    if (!product_name) {
        console.log('Refused to register sale of inexistent item');
        return false;
    }

    const customer_name = <string>(await queries.retrieveSpecificValue('Customer', 'name', sale.customer_id));
    if (!customer_name) {
        console.log('Refused to register sale to inexistent customer');
        return false;
    }

    const quantityInStock = await queries.retrieveSpecificValue('Product', 'quantity_in_stock', sale.product_id);
    if (!quantityInStock || quantityInStock < sale.quantity) {
        console.log('Refused to register sale with insufficient stock');
        return false;
    }

    console.log('Sale is consistent - saving to database');
    return true;
};
