import dotenv from 'dotenv';
import pg from 'pg';

import { customer, product, queryResponse, sale } from './interfaces';

dotenv.config();
console.log(process.env.DATABASE_URL);

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false, }
});

export const query = async (operation: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        pool.query(operation)
            .then((res: queryResponse) => resolve(res.rows))
            .catch((err: Error) => {
                console.error(`Error executing query with operation ${operation}`, err.stack);
                reject(err);
            });
    });
};

export const retrieveTable = async (table: string): Promise<Array<any>> => {
    return query(`
        SELECT * FROM public."${table}"
        ORDER BY "id" ASC
    `);
};

export const retrieveSales = async (): Promise<Array<sale>> => {
    return query(`
        SELECT 
            public."Sale".*,
            public."Customer".name as customer_name,
            public."Product".name as product_name
        FROM public."Sale"
        LEFT JOIN public."Customer" ON public."Sale".customer_id = public."Customer".id
        LEFT JOIN public."Product" ON public."Sale".product_id = public."Product".id
    `);
};

export const retrieveSpecificValue = async (table: string, column: string, id: number): Promise<string | number | undefined> => {
    let ret = undefined;

    await query(`
        SELECT ${column} FROM public."${table}" 
        WHERE id = ${id}`
    )
        .then((response: any) => {
            if (response[0] && column in response[0])
                ret = response[0][column];
        });

    return ret;
};

export const remove = async (parameters: any): Promise<void> => {
    return query(`
        DELETE FROM public."${parameters.table}"
        WHERE id = ${parameters.id};
    `);
};

export const insertCustomer = async (parameters: customer): Promise<void> => {
    return query(`
        INSERT INTO public."Customer"(name)
        VALUES('${parameters.name}')
    `);
};

export const insertProduct = async (parameters: product): Promise<void> => {
    return query(`
        INSERT INTO public."Product"(
            name, default_price, quantity_in_stock
        )
        VALUES(
            '${parameters.name}', ${parameters.default_price}, ${parameters.quantity_in_stock}
        )
    `);
};

export const insertSale = async (parameters: sale): Promise<void> => {
    return query(`
        INSERT INTO public."Sale"(
            product_id, customer_id, quantity, price
        )
        VALUES(
            ${parameters.product_id}, 
            ${parameters.customer_id}, 
            ${parameters.quantity}, 
            ${parameters.price}
        )
    `);
};

export const updateCustomer = async (parameters: customer): Promise<void> => {
    return query(`
        UPDATE public."Customer"
        SET name = '${parameters.name}'
        WHERE id = ${parameters.id};
    `);
};

export const updateProduct = async (parameters: product): Promise<void> => {
    return query(`
        UPDATE public."Product"
        SET 
            name = '${parameters.name || 'name'}', 
            default_price = ${parameters.default_price || 'default_price'}, 
            quantity_in_stock = ${parameters.quantity_in_stock}
        WHERE id = ${parameters.id};
    `);
};

export const updateStock = async (id: number, difference: number): Promise<void> => {
    return query(`
        UPDATE public."Product"
        SET quantity_in_stock = quantity_in_stock + ${difference}
        WHERE id = ${id};
    `);
};

export const addNamesToSale = async (id: number, customer: string, product: string): Promise<void> => {
    return query(`
        UPDATE public."Sale"
        SET 
            deleted_customer_name = ${customer ? "'" + customer + "'" : 'deleted_customer_name'}, 
            deleted_product_name = ${product ? "'" + product + "'" : 'deleted_product_name'}
        WHERE id = ${id};
    `);
};

export const findSalesByColumn = async (column: string, id: number): Promise<Array<any>> => {
    return query(`
        SELECT id
        FROM public."Sale"
        WHERE ${column} = ${id};
    `);
};

