import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  validationErrors: { [key: string]: string[] };
  incompleteProducts: string[];
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  validationErrors: {},
  incompleteProducts: [],
};

const validateProduct = (product: Product): string[] => {
  const errors: string[] = [];
  if (!product.name?.trim()) errors.push('Product name is required');
  if (product.quantity === undefined || product.quantity < 0) errors.push('Valid quantity is required');
  if (product.unitPrice === undefined || product.unitPrice < 0) errors.push('Valid unit price is required');
  if (product.tax === undefined || product.tax < 0) errors.push('Valid tax percentage is required');
  return errors;
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.validationErrors = {};
      state.incompleteProducts = [];
      
      action.payload.forEach(product => {
        const errors = validateProduct(product);
        if (errors.length > 0) {
          state.validationErrors[product.id] = errors;
          state.incompleteProducts.push(product.id);
        }
      });
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      const errors = validateProduct(action.payload);
      if (errors.length > 0) {
        state.validationErrors[action.payload.id] = errors;
        state.incompleteProducts.push(action.payload.id);
      } else {
        delete state.validationErrors[action.payload.id];
        state.incompleteProducts = state.incompleteProducts.filter(id => id !== action.payload.id);
      }
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        const errors = validateProduct(action.payload);
        if (errors.length > 0) {
          state.validationErrors[action.payload.id] = errors;
          if (!state.incompleteProducts.includes(action.payload.id)) {
            state.incompleteProducts.push(action.payload.id);
          }
        } else {
          delete state.validationErrors[action.payload.id];
          state.incompleteProducts = state.incompleteProducts.filter(id => id !== action.payload.id);
        }

        const updatedProduct = {
          ...action.payload,
          priceWithTax: action.payload.tax !== undefined && action.payload.unitPrice !== undefined
            ? action.payload.unitPrice * (1 + action.payload.tax/100)
            : state.items[index].priceWithTax
        };
        state.items[index] = updatedProduct;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearValidationErrors: (state, action: PayloadAction<string>) => {
      delete state.validationErrors[action.payload];
      state.incompleteProducts = state.incompleteProducts.filter(id => id !== action.payload);
    },
  },
});

export const { 
  setProducts, 
  addProduct, 
  updateProduct, 
  setLoading, 
  setError,
  clearValidationErrors 
} = productsSlice.actions;

export default productsSlice.reducer;