import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateCustomer } from '../store/slices/customersSlice';
import { updateInvoicesByCustomer } from '../store/slices/invoicesSlice';
import DataTable from './DataTable';
import EditableCell from './EditableCell';

const CustomersTab: React.FC = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => state.customers.items);

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
      key: 'customerName',
      header: 'Customer Name',
      render: (value: string, row: any) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'name', newValue)}
        />
      )
    },
    {
      key: 'phoneNumber',
      header: 'Phone Number',
      render: (value: string, row: any) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'phoneNumber', newValue)}
        />
      )
    },
    {
      key: 'totalPurchaseAmount',
      header: 'Total Purchase Amount',
      render: (value: string | undefined, row: any) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'amount', newValue)}
        />
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string | undefined, row: any) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'email', newValue)}
        />
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (value: string | undefined, row: any) => (
        <EditableCell
          value={value || '-'}
          onSave={(newValue) => handleUpdate(row.id, 'address', newValue)}
        />
      )
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Customers</h2>
      <DataTable data={customers[0]} columns={columns} />
    </div>
  );
};

export default CustomersTab;