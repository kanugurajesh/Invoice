import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DataTable from './DataTable';

const InvoicesTab: React.FC = () => {
  const invoices = useSelector((state: RootState) => state.invoices.items);

  const columns = [
    { key: 'serialNumber', header: 'Serial Number' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'productName', header: 'Product Name' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'tax', header: 'Tax', render: (value: number) => `${value}%` },
    { key: 'totalAmount', header: 'Total Amount', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'date', header: 'Date' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Invoices</h2>
      <DataTable data={invoices} columns={columns} />
    </div>
  );
};

export default InvoicesTab;