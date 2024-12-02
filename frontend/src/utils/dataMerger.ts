import { Product, Customer, Invoice } from '../types';

interface MergeableData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

export const mergeData = (target: MergeableData, source: MergeableData) => {
  // Merge products
  source.products.forEach(product => {
    const existingProduct = target.products.find(p => p.name === product.name);
    if (existingProduct) {
      existingProduct.quantity += product.quantity;
    } else {
      target.products.push(product);
    }
  });

  // Merge customers
  source.customers.forEach(customer => {
    const existingCustomer = target.customers.find(c => c.name === customer.name);
    if (existingCustomer) {
      existingCustomer.totalPurchaseAmount += customer.totalPurchaseAmount;
    } else {
      target.customers.push(customer);
    }
  });

  // Add all invoices
  target.invoices.push(...source.invoices);
}; 