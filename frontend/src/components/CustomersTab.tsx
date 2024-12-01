import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateCustomer } from '../store/slices/customersSlice';
import { updateInvoicesByCustomer } from '../store/slices/invoicesSlice';
import DataTable from './DataTable';
import EditableCell from './EditableCell';
import { Customer } from '../types';

const CustomersTab: React.FC = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => {
    const items = state.customers.items;
    const flattenedItems = items.flat();
    console.log('Flattened customers data:', flattenedItems);
    return flattenedItems;
  });

  const handleUpdate = (customerId: string, field: string, value: any) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const updatedCustomer = { ...customer, [field]: value };
    dispatch(updateCustomer(updatedCustomer));

    // Update related invoices
    if (field === 'name') {
      dispatch(updateInvoicesByCustomer({
        customerId,
        updates: { customerName: value }
      }));
    }    
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer Name',
      render: (value: string, row: Customer) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'name', newValue)}
        />
      )
    },
    {
      key: 'phoneNumber',
      header: 'Phone Number',
      render: (value: string, row: Customer) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'phoneNumber', newValue)}
        />
      )
    },
    {
      key: 'totalPurchaseAmount',
      header: 'Total Purchase Amount',
      render: (value: number, row: Customer) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, 'totalPurchaseAmount', Number(newValue))}
          type="number"
        />
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string | undefined, row: Customer) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'email', newValue)}
        />
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (value: string | undefined, row: Customer) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'address', newValue)}
        />
      )
    },
  ];

  // Add debug render to check if we have data
  if (!customers || customers.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Customers</h2>
        <p>No customers available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Customers</h2>
      <DataTable data={customers} columns={columns} />
    </div>
  );
};

export default CustomersTab;