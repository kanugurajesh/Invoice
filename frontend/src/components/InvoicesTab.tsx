import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import DataTable from "./DataTable";
import { Invoice } from "../types";

const InvoicesTab: React.FC = () => {
  const invoices = useSelector((state: RootState) => {
    const items = state.invoices.items;
    const flattenedItems = items.flat();
    console.log('Flattened invoices data:', flattenedItems);
    return flattenedItems;
  });

  console.log('Rendered invoices:', invoices);

  const columns = [
    { key: "serialNumber", header: "Serial Number" },
    { key: "customerName", header: "Customer Name" },
    { key: "productName", header: "Product Name" },
    { key: "quantity", header: "Quantity" },
    { 
      key: 'tax', 
      header: 'Tax', 
      render: (value: number) => {
        console.log('Tax value:', value);
        const numValue = Number(value);
        return !isNaN(numValue) ? `$${numValue.toFixed(2)}` : '$0.00';
      }
    },
    { 
      key: 'totalAmount', 
      header: 'Total Amount', 
      render: (value: number) => {
        console.log('Total amount value:', value);
        const numValue = Number(value);
        return !isNaN(numValue) ? `$${numValue.toFixed(2)}` : '$0.00';
      }
    },
    { key: "date", header: "Date" },
  ];

  // Add debug render to check if we have data
  if (!invoices || invoices.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Invoices</h2>
        <p>No invoices available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Invoices</h2>
      <DataTable data={invoices} columns={columns} />
    </div>
  );
};

export default InvoicesTab;