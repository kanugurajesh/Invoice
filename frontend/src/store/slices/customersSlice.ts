import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../types';

interface CustomersState {
  items: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.items.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      console.log('Updating customer:', action.payload);
      const index = state.items.findIndex(item => item.id === action.payload.id);
      console.log('Found customer at index:', index);
      if (index !== -1) {
        const updatedCustomer = {
          ...action.payload,
          totalPurchaseAmount: action.payload.totalPurchaseAmount ?? state.items[index].totalPurchaseAmount
        };
        console.log('Updated customer:', updatedCustomer);
        state.items[index] = updatedCustomer;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCustomers, addCustomer, updateCustomer, setLoading, setError } = customersSlice.actions;
export default customersSlice.reducer;