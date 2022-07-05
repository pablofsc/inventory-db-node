export const checkCompleteness = (obj: any, verifier: Function) => {
    console.log(`Running ${verifier.name} on`);
    console.log(obj);

    if (!verifier(obj)) {
        console.log('Data received is incomplete.');
        return false;
    }
    else return true;
};

export interface customer {
    id: number,
    name: string;
}

export const isCustomer = (obj: any) => {
    return 'id' in obj
        && 'name' in obj;
};

export interface product {
    id: number,
    name: string,
    default_price: string,
    quantity_in_stock: string;
}

export const isProduct = (obj: any) => {
    return 'id' in obj
        && 'name' in obj
        && 'default_price' in obj
        && 'quantity_in_stock' in obj;
};

export interface sale {
    id: number,
    product_id: number,
    customer_id: number,
    quantity: number,
    price: string,
    deleted_product_name?: string,
    deleted_customer_name?: string;
}

export const isSale = (obj: any) => {
    return 'id' in obj
        && 'product_id' in obj
        && 'customer_id' in obj
        && 'quantity' in obj
        && 'price' in obj;
};

export interface queryResponse {
    rows: Array<any>;
}
