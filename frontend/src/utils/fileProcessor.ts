import * as XLSX from "xlsx";
import { Invoice, Product, Customer } from "../types";
import urls from "../data";
import { mergeData } from "./dataMerger";

interface ExcelRow {
  [key: string]: any;
}

// interface ColumnMapping {
//   [key: string]: {
//     possibleNames: string[];
//     required: boolean;
//     transform?: (value: any) => any;
//   };
// }

// const COLUMN_MAPPINGS: ColumnMapping = {
//   serialNumber: {
//     possibleNames: ['Serial Number', 'SerialNumber', 'Invoice Number'],
//     required: true,
//   },
//   customerName: {
//     possibleNames: ['Party Name'],
//     required: true,
//   },
//   companyName: {
//     possibleNames: ['Party Company Name'],
//     required: false,
//   },
//   productName: {
//     possibleNames: ['Party Name'],
//     required: true,
//   },
//   quantity: {
//     possibleNames: ['Quantity'],
//     required: false,
//     transform: (value: any) => Number(value) || 1,
//   },
//   unitPrice: {
//     possibleNames: ['Net Amount'],
//     required: true,
//     transform: (value: any) => Number(value) || 0,
//   },
//   tax: {
//     possibleNames: ['Tax Amount'],
//     required: false,
//     transform: (value: any) => Number(value) || 0,
//   },
//   totalAmount: {
//     possibleNames: ['Total Amount'],
//     required: true,
//     transform: (value: any) => Number(value) || 0,
//   },
//   date: {
//     possibleNames: ['Date'],
//     required: true,
//     transform: (value: any) => {
//       if (!value) return new Date().toISOString();
//       return new Date(value).toISOString();
//     },
//   },
// };

// const findMatchingColumn = (headers: string[], possibleNames: string[]): string | undefined => {
//   const headerLower = headers.map(h => h.toLowerCase());
//   return headers.find((_, index) =>
//     possibleNames.some(name =>
//       headerLower[index].includes(name.toLowerCase()) ||
//       name.toLowerCase().includes(headerLower[index])
//     )
//   );
// };

export const processFile = async (files: FileList | File) => {
  // Handle multiple files
  if (files instanceof FileList && files.length > 1) {
    const mergedData = {
      products: [] as Product[],
      customers: [] as Customer[],
      invoices: [] as Invoice[]
    };

    // Process each file
    for (const file of Array.from(files)) {
      try {
        let data;
        if (file.type.includes("spreadsheet") || file.type.includes("excel")) {
          data = await processExcel(file);
        } else if (file.type.includes("pdf")) {
          data = await processPDF(file);
        } else if (file.type.includes("image")) {
          data = await processImage(file);
        } else {
          console.warn(`Skipping unsupported file type: ${file.type}`);
          continue;
        }

        // Merge the data from each file
        mergeData(mergedData, data);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        throw error;
      }
    }

    return mergedData;
  }

  // Single file processing
  const file = files instanceof FileList ? files[0] : files;
  if (file.type.includes("spreadsheet") || file.type.includes("excel")) {
    return processExcel(file);
  } else if (file.type.includes("pdf")) {
    return processPDF(file);
  } else if (file.type.includes("image")) {
    return processImage(file);
  }

  throw new Error("Unsupported file type");
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
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        console.log("Raw Excel Data:", rawData);

        const productsMap = new Map<string, Product>();
        const customersMap = new Map<string, Customer>();
        const invoices: Invoice[] = [];

        // Helper function to find value from multiple possible column names
        const findValue = (row: ExcelRow, possibleNames: string[]): string => {
          for (const name of possibleNames) {
            if (row[name] !== undefined) return String(row[name]);
          }
          return "";
        };

        // Helper function to find numeric value
        const findNumericValue = (
          row: ExcelRow,
          possibleNames: string[]
        ): number => {
          for (const name of possibleNames) {
            if (row[name] !== undefined) return Number(row[name]) || 0;
          }
          return 0;
        };

        rawData.forEach((row, index) => {
          // Try to find values using multiple possible column names
          const serialNumber =
            findValue(row, [
              "Serial Number",
              "SerialNumber",
              "Invoice Number",
              "Bill Number",
              "Invoice No",
              "Serial No",
            ]) || `INV-${index + 1}`;

          const companyName = findValue(row, [
            "Party Company Name",
            "Company Name",
            "Organization",
            "Business Name",
          ]);

          const partyName = findValue(row, [
            "Party Name",
            "Customer Name",
            "Client Name",
            "Name",
            "Customer",
          ]);

          const netAmount = findNumericValue(row, [
            "Net Amount",
            "Amount",
            "Price",
            "Unit Price",
            "Base Amount",
          ]);

          const taxAmount = findNumericValue(row, [
            "Tax Amount",
            "Tax",
            "GST",
            "VAT",
            "Tax Value",
          ]);

          const totalAmount = findNumericValue(row, [
            "Total Amount",
            "Total",
            "Final Amount",
            "Gross Amount",
            "Amount with Tax",
          ]);

          const dateValue = findValue(row, [
            "Date",
            "Invoice Date",
            "Bill Date",
            "Transaction Date",
          ]);

          // Create customer key
          const customerKey =
            companyName && partyName
              ? `${companyName} - ${partyName}`
              : companyName || partyName || "Unknown Customer";

          // Create or update customer
          if (!customersMap.has(customerKey)) {
            const customer: Customer = {
              id: `customer-${index}`,
              name: customerKey,
              phoneNumber:
                findValue(row, [
                  "Phone",
                  "Phone Number",
                  "Contact",
                  "Mobile",
                ]) || "N/A",
              totalPurchaseAmount: totalAmount,
            };
            customersMap.set(customerKey, customer);
          } else {
            // Update existing customer's total purchase amount
            const existingCustomer = customersMap.get(customerKey)!;
            existingCustomer.totalPurchaseAmount += totalAmount;
            customersMap.set(customerKey, existingCustomer);
          }

          // Create product
          const productName = partyName || `Product-${index}`;
          const product: Product = {
            id: `product-${index}`,
            name: productName,
            quantity: findNumericValue(row, ["Quantity", "Qty", "Count"]) || 1,
            unitPrice: netAmount,
            tax: taxAmount,
            priceWithTax: totalAmount,
          };
          productsMap.set(`${productName}-${index}`, product);

          // Create invoice
          const invoice: Invoice = {
            id: `invoice-${index}`,
            serialNumber: serialNumber,
            customerId: `customer-${index}`,
            customerName: customerKey,
            productId: `product-${index}`,
            productName: productName,
            quantity: product.quantity,
            tax: taxAmount,
            totalAmount: totalAmount,
            date: dateValue
              ? new Date(dateValue).toISOString()
              : new Date().toISOString(),
          };
          invoices.push(invoice);
        });

        const processedData = {
          products: Array.from(productsMap.values()),
          customers: Array.from(customersMap.values()),
          invoices,
        };

        console.log("Processed Data:", processedData);
        resolve(processedData);
      } catch (error) {
        console.error("Excel processing error details:", error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read Excel file"));
    reader.readAsArrayBuffer(file);
  });
};

const processPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(urls.transcribePdf, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  // First create products and customers with IDs
  const products = Array.isArray(data.ProductsTab)
    ? data.ProductsTab.map((product: any, index: number) => ({
        ...product,
        id: product.id || `product-${index}`,
        name: product.name || product.productName, // handle both name formats
      }))
    : [{ ...data.ProductsTab, id: "product-0" }];

  const customers = Array.isArray(data.CustomersTab)
    ? data.CustomersTab.map((customer: any, index: number) => ({
        ...customer,
        id: customer.id || `customer-${index}`,
        name: customer.customerName || customer.name, // handle both name formats
      }))
    : [{ ...data.CustomersTab, id: "customer-0" }];

  // Helper function to generate unique IDs
  const generateUniqueId = (prefix: string, index: number) => 
    `${prefix}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Then create invoices with proper relationships
  const invoices = Array.isArray(data.InvoicesTab)
    ? data.InvoicesTab.map((invoice: any, index: number) => {
        const matchedProduct = products.find((p: Product) => p.name === invoice.productName);
        const matchedCustomer = customers.find((c: Customer) => c.name === invoice.customerName);
        return {
          ...invoice,
          id: invoice.id || generateUniqueId('invoice', index),
          productId: matchedProduct?.id || generateUniqueId('product-unknown', index),
          customerId: matchedCustomer?.id || generateUniqueId('customer-unknown', index)
        };
      })
    : [{
        ...data.InvoicesTab,
        id: generateUniqueId('invoice', 0),
        productId: generateUniqueId('product', 0),
        customerId: generateUniqueId('customer', 0)
      }];

  return { products, customers, invoices };
};

const processImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(urls.transcribeImage, {
      method: "POST",
      body: formData,
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('Failed to connect to server. Please check if the backend is running.');
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
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
          priceWithTax: Number(product.priceWithTax) || 
            (product.unitPrice * (1 + (product.tax || 0) / 100)) || 0
        }))
      : data.ProductsTab 
        ? [{ 
            ...data.ProductsTab, 
            id: "product-0",
            quantity: Number(data.ProductsTab.quantity) || 0,
            unitPrice: Number(data.ProductsTab.unitPrice) || 0,
            tax: Number(data.ProductsTab.tax) || 0,
            priceWithTax: Number(data.ProductsTab.priceWithTax) || 
              (data.ProductsTab.unitPrice * (1 + (data.ProductsTab.tax || 0) / 100)) || 0
          }]
        : [];

    const customers = Array.isArray(data.CustomersTab)
      ? data.CustomersTab.map((customer: any, index: number) => ({
          ...customer,
          id: customer.id || `customer-${index}`,
          name: customer.name || customer.customerName, // handle both name formats
          phoneNumber: customer.phoneNumber || 'N/A',
          totalPurchaseAmount: Number(customer.totalPurchaseAmount) || 0
        }))
      : data.CustomersTab
        ? [{
            ...data.CustomersTab,
            id: "customer-0",
            phoneNumber: data.CustomersTab.phoneNumber || 'N/A',
            totalPurchaseAmount: Number(data.CustomersTab.totalPurchaseAmount) || 0
          }]
        : [];

    // Helper function to generate unique IDs
    const generateUniqueId = (prefix: string, index: number) => 
      `${prefix}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Then create invoices with proper relationships
    const invoices = Array.isArray(data.InvoicesTab)
      ? data.InvoicesTab.map((invoice: any, index: number) => {
          const matchedProduct = products.find((p: Product) => p.name === invoice.productName);
          const matchedCustomer = customers.find((c: Customer) => c.name === invoice.customerName);
          return {
            ...invoice,
            id: invoice.id || generateUniqueId('invoice', index),
            productId: matchedProduct?.id || generateUniqueId('product-unknown', index),
            customerId: matchedCustomer?.id || generateUniqueId('customer-unknown', index)
          };
        })
      : [];

    console.log('Processed Image Data:', { products, customers, invoices });

    return { products, customers, invoices };
  } catch (error) {
    console.error('Image processing error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('connect')) {
        throw new Error('Unable to connect to server. Please ensure the backend service is running.');
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
    if (!product.name?.trim()) {
      errors.push(`Missing product name for product ID: ${product.id}`);
    }
    if (product.quantity < 0) {
      errors.push(`Invalid quantity for product: ${product.name}`);
    }
    if (product.unitPrice < 0) {
      errors.push(`Invalid unit price for product: ${product.name}`);
    }
    if (product.tax < 0) {
      errors.push(`Invalid tax percentage for product: ${product.name}`);
    }
  });

  // Validate customers
  data.customers.forEach((customer) => {
    if (!customer.name?.trim()) {
      errors.push(`Missing customer name for customer ID: ${customer.id}`);
    }
    if (!customer.phoneNumber?.trim()) {
      errors.push(`Missing phone number for customer: ${customer.name}`);
    }
  });

  // Validate invoices
  data.invoices.forEach((invoice) => {
    if (!invoice.serialNumber?.trim()) {
      errors.push(`Missing serial number for invoice ID: ${invoice.id}`);
    }
    if (!invoice.customerId) {
      errors.push(
        `Missing customer reference for invoice: ${invoice.serialNumber}`
      );
    }
    if (!invoice.productId) {
      errors.push(
        `Missing product reference for invoice: ${invoice.serialNumber}`
      );
    }
    if (!invoice.quantity || invoice.quantity <= 0) {
      errors.push(`Invalid quantity for invoice: ${invoice.serialNumber}`);
    }
  });

  return errors;
};

export { processExcel };
