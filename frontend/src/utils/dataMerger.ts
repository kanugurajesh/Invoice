import { Product, Customer, Invoice } from '../types';

interface ProcessedData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

export const mergeDataSets = (dataSets: ProcessedData[]): ProcessedData => {
  console.log('Merging datasets:', dataSets.length);

  if (dataSets.length === 0) {
    return { products: [], customers: [], invoices: [] };
  }

  if (dataSets.length === 1) {
    return dataSets[0];
  }

  // Use Maps to deduplicate by ID and name
  const productsMap = new Map<string, Product>();
  const customersMap = new Map<string, Customer>();
  const invoicesMap = new Map<string, Invoice>();

  // Merge all datasets
  dataSets.forEach((dataset, index) => {
    console.log(`Processing dataset ${index}:`, {
      productsCount: dataset.products.length,
      customersCount: dataset.customers.length,
      invoicesCount: dataset.invoices.length,
    });

    dataset.products.forEach((product) => {
      // Use both ID and name as key to prevent duplicates
      const key = `${product.name}-${product.id}`;
      productsMap.set(key, product);
    });

    dataset.customers.forEach((customer) => {
      const key = `${customer.name}-${customer.id}`;
      customersMap.set(key, customer);
    });

    dataset.invoices.forEach((invoice) => {
      // Use serial number as part of the key to prevent duplicates
      const key = `${invoice.serialNumber}-${invoice.id}`;
      invoicesMap.set(key, invoice);
    });
  });

  const result = {
    products: Array.from(productsMap.values()),
    customers: Array.from(customersMap.values()),
    invoices: Array.from(invoicesMap.values()),
  };

  console.log('Merge result:', {
    productsCount: result.products.length,
    customersCount: result.customers.length,
    invoicesCount: result.invoices.length,
  });

  return result;
};
