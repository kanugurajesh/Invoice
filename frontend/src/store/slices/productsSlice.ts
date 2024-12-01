import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      console.log('Updating product:', action.payload);
      const index = state.items.findIndex(item => item.id === action.payload.id);
      console.log('Found product at index:', index);
      if (index !== -1) {
        const updatedProduct = {
          ...action.payload,
          priceWithTax: action.payload.tax !== undefined && action.payload.unitPrice !== undefined
            ? action.payload.unitPrice * (1 + action.payload.tax/100)
            : state.items[index].priceWithTax
        };
        console.log('Updated product:', updatedProduct);
        state.items[index] = updatedProduct;
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

export const { setProducts, addProduct, updateProduct, setLoading, setError } = productsSlice.actions;
export default productsSlice.reducer;