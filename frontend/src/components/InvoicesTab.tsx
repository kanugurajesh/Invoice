import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "./DataTable";
import EditableCell from "./EditableCell";
import { Invoice } from "../types";
import { updateInvoice } from "../store/slices/invoicesSlice";
import { updateProduct } from "../store/slices/productsSlice";
import { updateCustomer } from "../store/slices/customersSlice";
import { 
  selectFlattenedInvoices, 
  selectFlattenedProducts, 
  selectFlattenedCustomers 
} from "../store/selectors";

// Component for displaying and managing invoice data
const InvoicesTab: React.FC = () => {
  const dispatch = useDispatch();
  const invoices = useSelector(selectFlattenedInvoices);
  const products = useSelector(selectFlattenedProducts);
  const customers = useSelector(selectFlattenedCustomers);

  console.log('Current state:', { invoices, products, customers });

  // Handle updates to invoice data
  const handleUpdate = useCallback((invoiceId: string, field: string, value: any) => {
    console.log('Handling update:', { invoiceId, field, value });
    
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      console.error('Invoice not found:', invoiceId);
      return;
    }

    console.log('Found invoice:', invoice);
    console.log('Invoice productId:', invoice.productId);
    console.log('Invoice customerId:', invoice.customerId);
    console.log('Available products:', products);
    console.log('Available customers:', customers);

    const updatedInvoice = { ...invoice, [field]: value };
    dispatch(updateInvoice(updatedInvoice));

    // Update related products and customers based on field changes
    switch (field) {
      case 'quantity': {
        const product = products.find(p => p.id === invoice.productId);
        console.log('Found product for quantity update:', product);
        if (product) {
          const updatedProduct = { 
            ...product, 
            quantity: Number(value)
          };
          dispatch(updateProduct(updatedProduct));
        } else {
          console.error('Product not found for ID:', invoice.productId);
        }
        break;
      }
      case 'tax': {
        const product = products.find(p => p.id === invoice.productId);
        console.log('Updating product tax:', { product, newValue: value });
        if (product) {
          const updatedProduct = { 
            ...product, 
            tax: Number(value),
            priceWithTax: product.unitPrice * (1 + Number(value)/100)
          };
          dispatch(updateProduct(updatedProduct));
        }
        break;
      }
      case 'totalAmount': {
        const customer = customers.find(c => c.id === invoice.customerId);
        console.log('Updating customer total amount:', { customer, newValue: value });
        if (customer) {
          const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
          const totalPurchaseAmount = customerInvoices.reduce((sum, inv) => 
            sum + (inv.id === invoiceId ? Number(value) : (inv.totalAmount || 0)), 0);
          
          const updatedCustomer = {
            ...customer,
            totalPurchaseAmount
          };
          dispatch(updateCustomer(updatedCustomer));
        }
        break;
      }
      case 'productName': {
        const product = products.find(p => p.id === invoice.productId);
        console.log('Updating product name:', { product, newValue: value });
        if (product) {
          dispatch(updateProduct({ ...product, name: value }));
          // Update all invoices with this product
          const relatedInvoices = invoices.filter(inv => inv.productId === product.id && inv.id !== invoiceId);
          console.log('Related invoices to update:', relatedInvoices);
          relatedInvoices.forEach(inv => {
            dispatch(updateInvoice({ ...inv, productName: value }));
          });
        }
        break;
      }
      case 'customerName': {
        const customer = customers.find(c => c.id === invoice.customerId);
        console.log('Updating customer name:', { customer, newValue: value });
        if (customer) {
          dispatch(updateCustomer({ ...customer, name: value }));
          // Update all invoices with this customer
          const relatedInvoices = invoices.filter(inv => inv.customerId === customer.id && inv.id !== invoiceId);
          console.log('Related invoices to update:', relatedInvoices);
          relatedInvoices.forEach(inv => {
            dispatch(updateInvoice({ ...inv, customerName: value }));
          });
        }
        break;
      }
    }
  }, [dispatch, products, customers, invoices]);

  const columns = React.useMemo(() => [
    {
      key: "serialNumber",
      header: "Serial Number",
      render: (value: string, row: Invoice) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "serialNumber", newValue)}
        />
      )
    },
    {
      key: "customerName",
      header: "Customer Name",
      render: (value: string, row: Invoice) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "customerName", newValue)}
        />
      )
    },
    {
      key: "productName",
      header: "Product Name",
      render: (value: string, row: Invoice) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "productName", newValue)}
        />
      )
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value: number, row: Invoice) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "quantity", Number(newValue))}
          type="number"
        />
      )
    },
    {
      key: "tax",
      header: "Tax",
      render: (value: number, row: Invoice) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "tax", Number(newValue))}
          type="number"
        />
      )
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (value: number, row: Invoice) => (
        <EditableCell
          value={value ?? 0}
          onSave={(newValue) => handleUpdate(row.id, "totalAmount", Number(newValue))}
          type="number"
        />
      )
    },
    {
      key: "date",
      header: "Date",
      render: (value: string, row: Invoice) => (
        <EditableCell
          value={value}
          onSave={(newValue) => handleUpdate(row.id, "date", newValue)}
        />
      )
    },
  ], [handleUpdate]);

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

export default React.memo(InvoicesTab);