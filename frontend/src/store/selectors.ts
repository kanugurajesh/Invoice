import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

export const selectInvoiceItems = (state: RootState) => state.invoices.items;
export const selectProductItems = (state: RootState) => state.products.items;
export const selectCustomerItems = (state: RootState) => state.customers.items;

export const selectFlattenedInvoices = createSelector(
  [selectInvoiceItems],
  (items) => {
    const flattened = items.flat();
    return flattened.length > 0 ? flattened : [];
  }
);

export const selectFlattenedProducts = createSelector(
  [selectProductItems],
  (items) => {
    const flattened = items.flat();
    return flattened.length > 0 ? flattened : [];
  }
);

export const selectFlattenedCustomers = createSelector(
  [selectCustomerItems],
  (items) => {
    const flattened = items.flat();
    return flattened.length > 0 ? flattened : [];
  }
); 