import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { updateProduct } from "../store/slices/productsSlice";
import { updateInvoicesByProduct } from "../store/slices/invoicesSlice";
import DataTable from "./DataTable";
import EditableCell from "./EditableCell";

const ProductsTab: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.items);

  const handleUpdate = (productId: string, field: string, value: any) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedProduct = { ...product, [field]: value };
    dispatch(updateProduct(updatedProduct));

    // Update related invoices
    // if (field === "name") {
    //   dispatch(
    //     updateInvoicesByProduct({
    //       productId,
    //       updates: { productName: value },
    //     })
    //   );
    // }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value: string, row: any) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "name", newValue)}
        />
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value: string, row: any) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "quantity", newValue)}
          type="number"
        />
      ),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      render: (value: number, row: any) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "unitPrice", newValue)}
          type="number"
        />
      ),
    },
    {
      key: "tax",
      header: "Tax",
      render: (value: number, row: any) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "tax", newValue)}
          type="number"
        />
      ),
    },
    {
      key: "priceWithTax",
      header: "Price with Tax",
      render: (value: any, row: any) => (
        <EditableCell
          value={value || 0}
          onSave={(newValue) => handleUpdate(row.id, "priceWithTax", newValue)}
          type="number"
        />
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (value: number | undefined, row: any) => (
        <EditableCell
          value={value || 0}
          onSave={(newValue) => handleUpdate(row.id, "discount", newValue)}
          type="number"
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Products</h2>
      <DataTable data={products[0]} columns={columns} />
    </div>
  );
  
};

export default ProductsTab;