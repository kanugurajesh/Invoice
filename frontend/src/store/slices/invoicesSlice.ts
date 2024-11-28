import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../../types';

interface InvoicesState {
  items: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  items: [],
  loading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.items = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.items.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateInvoicesByProduct: (state, action: PayloadAction<{ productId: string; updates: Partial<Invoice> }>) => {
      state.items = state.items.map(invoice => {
        if (invoice.productId === action.payload.productId) {
          return { ...invoice, ...action.payload.updates };
        }
        return invoice;
      });
    },
    updateInvoicesByCustomer: (state, action: PayloadAction<{ customerId: string; updates: Partial<Invoice> }>) => {
      state.items = state.items.map(invoice => {
        if (invoice.customerId === action.payload.customerId) {
          return { ...invoice, ...action.payload.updates };
        }
        return invoice;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setInvoices,
  addInvoice,
  updateInvoice,
  updateInvoicesByProduct,
  updateInvoicesByCustomer,
  setLoading,
  setError,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;