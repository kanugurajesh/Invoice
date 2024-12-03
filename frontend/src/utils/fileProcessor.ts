import * as XLSX from 'xlsx';
import { Invoice, Product, Customer } from '../types';
import urls from '../data';
import { mergeDataSets } from './dataMerger';

interface ExcelRow {
  [key: string]: any;
}

// Helper function to find value from multiple possible column names
const findValue = (row: ExcelRow, possibleNames: string[]): string => {
  for (const name of possibleNames) {
    if (row[name] !== undefined) return String(row[name]);
  }
  return '';
};

// Helper function to find numeric value
const findNumericValue = (row: ExcelRow, possibleNames: string[]): number => {
  for (const name of possibleNames) {
    if (row[name] !== undefined) return Number(row[name]) || 0;
  }
  return 0;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const processFile = async (files: FileList | File) => {
  // Convert FileList to array or wrap single File in array
  const fileArray = files instanceof FileList ? Array.from(files) : [files];
  const processedDataSets = [];

  console.log('Number of files to process:', fileArray.length);

  // Process each file
  for (const file of fileArray) {
    try {
      let data;
      console.log('Processing file:', file.name);

      if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
        data = await processExcel(file);
        console.log('Excel data processed:', {
          productsCount: data.products.length,
          customersCount: data.customers.length,
          invoicesCount: data.invoices.length,
        });
      } else if (file.type.includes('pdf')) {
        data = await processPDF(file);
      } else if (file.type.includes('image')) {
        data = await processImage(file);
      } else {
        console.warn(`Skipping unsupported file type: ${file.type}`);
        continue;
      }

      processedDataSets.push(data);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw error;
    }
  }

  console.log('Total processed datasets:', processedDataSets.length);

  // If only one file, return its data directly
  if (processedDataSets.length === 1) {
    return processedDataSets[0];
  }

  // Merge all processed datasets
  const mergedData = mergeDataSets(processedDataSets);
  console.log('Merged data:', {
    productsCount: mergedData.products.length,
    customersCount: mergedData.customers.length,
    invoicesCount: mergedData.invoices.length,
  });

  return mergedData;
};

const processExcel = async (
  file: File
): Promise<{
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        const productsMap = new Map<string, Product>();
        const customersMap = new Map<string, Customer>();
        const invoices: Invoice[] = [];

        rawData.forEach((row, index) => {
          // Extract values using multiple possible column names
          const serialNumber =
            findValue(row, [
              'Serial Number',
              'SerialNumber',
              'Invoice Number',
              'Bill Number',
            ]) || `INV-${index + 1}`;

          const customerName = findValue(row, [
            'Customer Name',
            'Party Name',
            'Client Name',
            'Customer',
          ]);

          const companyName = findValue(row, [
            'Company Name',
            'Party Company Name',
            'Organization',
            'Business Name',
          ]);

          const productName = findValue(row, [
            'Product Name',
            'Item Name',
            'Description',
            'Product',
          ]);

          const quantity =
            findNumericValue(row, ['Quantity', 'Qty', 'Count']) || 1;
          const netAmount = findNumericValue(row, [
            'Net Amount',
            'Amount',
            'Price',
            'Unit Price',
          ]);
          const taxAmount = findNumericValue(row, [
            'Tax Amount',
            'Tax',
            'GST',
            'VAT',
          ]);
          const totalAmount = findNumericValue(row, [
            'Total Amount',
            'Total',
            'Gross Amount',
          ]);

          // Create customer key and name
          const fullCustomerName =
            companyName && customerName
              ? `${companyName} - ${customerName}`
              : companyName || customerName || 'Unknown Customer';

          // Create or update customer
          if (!customersMap.has(fullCustomerName)) {
            const customer: Customer = {
              id: `customer-${index}`,
              name: customerName,
              companyName: companyName || 'N/A',
              phoneNumber:
                findValue(row, ['Phone', 'Phone Number', 'Contact']) || 'N/A',
              totalPurchaseAmount: totalAmount,
            };
            customersMap.set(fullCustomerName, customer);
          } else {
            const existingCustomer = customersMap.get(fullCustomerName)!;
            existingCustomer.totalPurchaseAmount += totalAmount;
          }

          // Create product with actual product name
          const actualProductName = productName || `Product-${index}`;
          const product: Product = {
            id: `product-${index}`,
            name: actualProductName,
            quantity: quantity,
            unitPrice: netAmount,
            tax: taxAmount,
            priceWithTax: totalAmount,
          };
          productsMap.set(actualProductName, product);

          // Create invoice
          const invoice: Invoice = {
            id: `invoice-${index}`,
            serialNumber: serialNumber,
            customerId: `customer-${index}`,
            customerName: fullCustomerName,
            productId: `product-${index}`,
            productName: actualProductName,
            quantity: quantity,
            tax: taxAmount,
            totalAmount: totalAmount,
            date: findValue(row, ['Date', 'Invoice Date'])
              ? new Date(findValue(row, ['Date', 'Invoice Date'])).toISOString()
              : new Date().toISOString(),
          };
          invoices.push(invoice);
        });

        resolve({
          products: Array.from(productsMap.values()),
          customers: Array.from(customersMap.values()),
          invoices,
        });
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

const processPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(urls.transcribePdf, {
    method: 'POST',
    body: formData,
  }).catch((error) => {
    console.error('Network error:', error);
    throw new Error(
      'Failed to connect to server. Please check if the backend is running.'
    );
  });
  const data = await response.json();

  // First create products and customers with IDs
  const products = Array.isArray(data.ProductsTab)
    ? data.ProductsTab.map((product: any, index: number) => ({
        ...product,
        id: product.id || `product-${index}`,
        name: product.name || product.productName, // handle both name formats
      }))
    : [{ ...data.ProductsTab, id: 'product-0' }];

  const customers = Array.isArray(data.CustomersTab)
    ? data.CustomersTab.map((customer: any, index: number) => ({
        ...customer,
        id: customer.id || `customer-${index}`,
        name: customer.customerName || customer.name, // handle both name formats
      }))
    : [{ ...data.CustomersTab, id: 'customer-0' }];

  // Helper function to generate unique IDs
  const generateUniqueId = (prefix: string, index: number) =>
    `${prefix}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Then create invoices with proper relationships
  const invoices = Array.isArray(data.InvoicesTab)
    ? data.InvoicesTab.map((invoice: any, index: number) => {
        const matchedProduct = products.find(
          (p: Product) => p.name === invoice.productName
        );
        const matchedCustomer = customers.find(
          (c: Customer) => c.name === invoice.customerName
        );
        return {
          ...invoice,
          id: invoice.id || generateUniqueId('invoice', index),
          productId:
            matchedProduct?.id || generateUniqueId('product-unknown', index),
          customerId:
            matchedCustomer?.id || generateUniqueId('customer-unknown', index),
        };
      })
    : [
        {
          ...data.InvoicesTab,
          id: generateUniqueId('invoice', 0),
          productId: generateUniqueId('product', 0),
          customerId: generateUniqueId('customer', 0),
        },
      ];

  return { products, customers, invoices };
};

const processImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(urls.transcribeImage, {
      method: 'POST',
      body: formData,
    }).catch((error) => {
      console.error('Network error:', error);
      throw new Error(
        'Failed to connect to server. Please check if the backend is running.'
      );
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error || data.message) {
      throw new Error(data.error || data.message);
    }

    // First create products and customers with IDs
    const products = Array.isArray(data.ProductsTab)
      ? data.ProductsTab.map((product: any, index: number) => ({
          ...product,
          id: product.id || `product-${index}`,
          name: product.name || product.productName, // handle both name formats
          quantity: Number(product.quantity) || 0,
          unitPrice: Number(product.unitPrice) || 0,
          tax: Number(product.tax) || 0,
          priceWithTax:
            Number(product.priceWithTax) ||
            product.unitPrice * (1 + (product.tax || 0) / 100) ||
            0,
        }))
      : data.ProductsTab
        ? [
            {
              ...data.ProductsTab,
              id: 'product-0',
              quantity: Number(data.ProductsTab.quantity) || 0,
              unitPrice: Number(data.ProductsTab.unitPrice) || 0,
              tax: Number(data.ProductsTab.tax) || 0,
              priceWithTax:
                Number(data.ProductsTab.priceWithTax) ||
                data.ProductsTab.unitPrice *
                  (1 + (data.ProductsTab.tax || 0) / 100) ||
                0,
            },
          ]
        : [];

    const customers = Array.isArray(data.CustomersTab)
      ? data.CustomersTab.map((customer: any, index: number) => ({
          ...customer,
          id: customer.id || `customer-${index}`,
          name: customer.name || customer.customerName, // handle both name formats
          phoneNumber: customer.phoneNumber || 'N/A',
          totalPurchaseAmount: Number(customer.totalPurchaseAmount) || 0,
        }))
      : data.CustomersTab
        ? [
            {
              ...data.CustomersTab,
              id: 'customer-0',
              phoneNumber: data.CustomersTab.phoneNumber || 'N/A',
              totalPurchaseAmount:
                Number(data.CustomersTab.totalPurchaseAmount) || 0,
            },
          ]
        : [];

    // Helper function to generate unique IDs
    const generateUniqueId = (prefix: string, index: number) =>
      `${prefix}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Then create invoices with proper relationships
    const invoices = Array.isArray(data.InvoicesTab)
      ? data.InvoicesTab.map((invoice: any, index: number) => {
          const matchedProduct = products.find(
            (p: Product) => p.name === invoice.productName
          );
          const matchedCustomer = customers.find(
            (c: Customer) => c.name === invoice.customerName
          );
          return {
            ...invoice,
            id: invoice.id || generateUniqueId('invoice', index),
            productId:
              matchedProduct?.id || generateUniqueId('product-unknown', index),
            customerId:
              matchedCustomer?.id ||
              generateUniqueId('customer-unknown', index),
          };
        })
      : [];

    console.log('Processed Image Data:', { products, customers, invoices });

    return { products, customers, invoices };
  } catch (error) {
    console.error('Image processing error:', error);
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('connect')
      ) {
        throw new Error(
          'Unable to connect to server. Please ensure the backend service is running.'
        );
      }
      throw error;
    }
    throw new Error('Failed to process image');
  }
};

export const validateData = (data: {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}) => {
  const errors: string[] = [];

  // Validate products
  data.products.forEach((product) => {
    const missingFields = [];
    if (!product.name?.trim()) missingFields.push('name');
    if (product.quantity === undefined) missingFields.push('quantity');
    if (product.unitPrice === undefined) missingFields.push('unit price');
    if (product.tax === undefined) missingFields.push('tax');
    if (product.priceWithTax === undefined)
      missingFields.push('price with tax');

    if (missingFields.length > 0) {
      errors.push(
        `Missing fields for product ${product.id}: ${missingFields.join(', ')}`
      );
    }

    // Validate existing fields
    if (product.quantity < 0) {
      errors.push(
        `Invalid quantity for product: ${product.name || product.id}`
      );
    }
    if (product.unitPrice < 0) {
      errors.push(
        `Invalid unit price for product: ${product.name || product.id}`
      );
    }
    if (product.tax < 0) {
      errors.push(
        `Invalid tax percentage for product: ${product.name || product.id}`
      );
    }
  });

  // Validate customers
  data.customers.forEach((customer) => {
    const missingFields = [];
    if (!customer.name?.trim()) missingFields.push('name');
    if (!customer.phoneNumber?.trim()) missingFields.push('phone number');
    if (!customer.email?.trim()) missingFields.push('email');
    if (!customer.address?.trim()) missingFields.push('address');
    if (customer.totalPurchaseAmount === undefined)
      missingFields.push('total purchase amount');

    if (missingFields.length > 0) {
      errors.push(
        `Missing fields for customer ${customer.id}: ${missingFields.join(', ')}`
      );
    }

    // Validate existing fields
    if (customer.totalPurchaseAmount < 0) {
      errors.push(
        `Invalid total purchase amount for customer: ${customer.name || customer.id}`
      );
    }
    // Validate email format if present
    if (customer.email && !isValidEmail(customer.email)) {
      errors.push(
        `Invalid email format for customer: ${customer.name || customer.id}`
      );
    }
  });

  // Validate invoices
  data.invoices.forEach((invoice) => {
    const missingFields = [];
    if (!invoice.serialNumber?.trim()) missingFields.push('serial number');
    if (!invoice.customerId) missingFields.push('customer ID');
    if (!invoice.customerName?.trim()) missingFields.push('customer name');
    if (!invoice.productId) missingFields.push('product ID');
    if (!invoice.productName?.trim()) missingFields.push('product name');
    if (invoice.quantity === undefined) missingFields.push('quantity');
    if (invoice.tax === undefined) missingFields.push('tax');
    if (invoice.totalAmount === undefined) missingFields.push('total amount');
    if (!invoice.date) missingFields.push('date');

    if (missingFields.length > 0) {
      errors.push(
        `Missing fields for invoice ${invoice.id}: ${missingFields.join(', ')}`
      );
    }

    // Validate existing fields
    if (invoice.quantity <= 0) {
      errors.push(
        `Invalid quantity for invoice: ${invoice.serialNumber || invoice.id}`
      );
    }
    if (invoice.tax < 0) {
      errors.push(
        `Invalid tax for invoice: ${invoice.serialNumber || invoice.id}`
      );
    }
    if (invoice.totalAmount < 0) {
      errors.push(
        `Invalid total amount for invoice: ${invoice.serialNumber || invoice.id}`
      );
    }
  });

  return errors;
};

export { processExcel };
