export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phoneNumber?: string;
  totalPurchaseAmount: number;
  email?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
  discount?: number;
}

export interface Invoice {
  id: string;
  serialNumber: string;
  customerName: string;
  customerId: string;
  productName: string;
  productId: string;
  quantity: number;
  tax: number;
  totalAmount: number;
  date: string;
  amountPending?: number;
}

export interface Column {
  key: string;
  header: string;
  render: (value: any, row: any) => React.ReactNode;
} 