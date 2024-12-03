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

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  totalPurchaseAmount: number;
}
