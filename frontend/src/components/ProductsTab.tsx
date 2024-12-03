import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { updateProduct } from "../store/slices/productsSlice";
import { updateInvoicesByProduct } from "../store/slices/invoicesSlice";
import DataTable from "./DataTable";
import EditableCell from "./EditableCell";
import { Product } from '../types';

// Component for displaying and managing product data
const ProductsTab: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => {
    console.log('Entire Redux State:', state);
    console.log('Products State:', state.products);
    return state.products.items;
  });
  const loading = useSelector((state: RootState) => state.products.loading);

  console.log('Products from store:', products);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <p>No products available. Please upload data first.</p>
      </div>
    );
  }

  // Handle updates to product data
  const handleUpdate = (productId: string, field: string, value: any) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedProduct = { ...product, [field]: value };
    dispatch(updateProduct(updatedProduct));

    // Update related invoices
    if (field === "name") {
      dispatch(
        updateInvoicesByProduct({
          productId,
          updates: { productName: value },
        })
      );
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value: string, row: Product) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "name", newValue)}
        />
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value: number, row: Product) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "quantity", Number(newValue))}
          type="number"
        />
      ),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      render: (value: number, row: Product) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "unitPrice", Number(newValue))}
          type="number"
        />
      ),
    },
    {
      key: "tax",
      header: "Tax",
      render: (value: number, row: Product) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "tax", Number(newValue))}
          type="number"
        />
      ),
    },
    {
      key: "priceWithTax",
      header: "Price with Tax",
      render: (value: number, row: Product) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "priceWithTax", Number(newValue))}
          type="number"
        />
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (value: number, row: Product) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "discount", Number(newValue))}
          type="number"
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Products</h2>
      <DataTable data={products} columns={columns} />
    </div>
  );
  
};

export default ProductsTab;