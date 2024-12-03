import { configureStore } from '@reduxjs/toolkit';
import invoicesReducer from './slices/invoicesSlice';
import productsReducer from './slices/productsSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    invoices: invoicesReducer,
    products: productsReducer,
    customers: customersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
