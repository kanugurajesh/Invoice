import * as XLSX from "xlsx";
import { Invoice, Product, Customer } from "../types";

interface ExcelRow {
  [key: string]: any;
}

const findColumnName = (headers: string[], possibleNames: string[]): string | undefined => {
  return headers.find(header => 
    possibleNames.some(name => 
      header.toLowerCase().includes(name.toLowerCase())
    )
  );
};

export const processFile = async (file: File) => {
  const fileType = file.type;
  let data;

  try {
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      data = await processExcel(file);
    } else if (fileType.includes("pdf")) {
      data = await processPDF(file);
    } else if (fileType.includes("image")) {
      data = await processImage(file);
    } else {
      throw new Error("Unsupported file type");
    }

    return data;
  } catch (error) {
    console.error("Error processing file:", error);
    throw error;
  }
};

const processExcel = async (file: File): Promise<{
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
        const rawData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { header: "A" });

        // Get headers from the first row
        const headers = Object.keys(rawData[0] || {}).map(key => rawData[0][key]?.toString() || '');
        console.log('Excel Headers:', headers);

        // Define possible column names
        const columnMappings = {
          productName: ['Product Name', 'ProductName', 'Item Name', 'Description', 'Product'],
          quantity: ['Qty', 'Quantity', 'QTY', 'Count'],
          unitPrice: ['Unit Price', 'UnitPrice', 'Price', 'Rate'],
          tax: ['Tax (%)', 'Tax', 'GST', 'VAT'],
          priceWithTax: ['Price with Tax', 'Total Price', 'Final Price'],
          customerName: ['Party Name', 'Customer Name', 'Client', 'Customer'],
          companyName: ['Party Company Name', 'Company Name', 'Organization'],
          serialNumber: ['Serial Number', 'Invoice Number', 'Bill Number'],
          date: ['Invoice Date', 'Date', 'Bill Date'],
          totalAmount: ['Total Amount', 'Net Amount', 'Final Amount']
        };

        // Find actual column names in the Excel
        const actualColumns: { [key: string]: string } = {};
        Object.entries(columnMappings).forEach(([key, possibleNames]) => {
          actualColumns[key] = findColumnName(headers, possibleNames) || '';
        });

        console.log('Mapped Columns:', actualColumns);

        // Skip header row
        const dataRows = rawData.slice(1);

        const productsMap = new Map<string, Product>();
        const customersMap = new Map<string, Customer>();
        const invoices: Invoice[] = [];

        dataRows.forEach((row, index) => {
          // Extract product name using flexible matching
          let productName = '';
          if (actualColumns.productName) {
            productName = row[actualColumns.productName]?.toString() || '';
          } else {
            // Try to find a column that might contain product name
            const possibleProductColumn = Object.entries(row).find(([_, value]) => 
              typeof value === 'string' && value.length > 0 && 
              !value.includes('charge') && !value.includes('shipping')
            );
            if (possibleProductColumn) {
              productName = possibleProductColumn[1].toString();
            }
          }

          if (productName && !productsMap.has(productName)) {
            const product: Product = {
              id: `product-${index}`,
              name: productName,
              quantity: Number(row[actualColumns.quantity] || 0),
              unitPrice: Number(row[actualColumns.unitPrice] || 0),
              tax: Number(row[actualColumns.tax] || 0),
              priceWithTax: Number(row[actualColumns.priceWithTax] || 0)
            };
            productsMap.set(productName, product);
          }

          // Extract customer information
          const customerName = row[actualColumns.customerName] || row[actualColumns.companyName] || 'Unknown Customer';
          if (customerName && !customersMap.has(customerName.toString())) {
            const customer: Customer = {
              id: `customer-${index}`,
              name: customerName.toString(),
              phoneNumber: 'N/A',
              totalPurchaseAmount: Number(row[actualColumns.totalAmount] || 0)
            };
            customersMap.set(customerName.toString(), customer);
          }

          // Create invoice
          if (productName && customerName) {
            const product = productsMap.get(productName);
            const customer = customersMap.get(customerName.toString());

            if (product && customer) {
              const invoice: Invoice = {
                id: `invoice-${index}`,
                serialNumber: String(row[actualColumns.serialNumber] || `INV-${index + 1}`),
                customerId: customer.id,
                customerName: customer.name,
                productId: product.id,
                productName: product.name,
                quantity: Number(row[actualColumns.quantity] || 1),
                tax: Number(row[actualColumns.tax] || 0),
                totalAmount: Number(row[actualColumns.totalAmount] || 0),
                date: row[actualColumns.date] 
                  ? new Date(row[actualColumns.date]).toISOString() 
                  : new Date().toISOString()
              };
              invoices.push(invoice);
            }
          }
        });

        const processedData = {
          products: Array.from(productsMap.values()),
          customers: Array.from(customersMap.values()),
          invoices
        };

        console.log('Processed Data:', processedData);

        resolve(processedData);
      } catch (error) {
        console.error('Excel processing error details:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : '');
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

const processPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("http://localhost:3000/transcribe/pdf", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  
  // First create products and customers with IDs
  const products = Array.isArray(data.ProductsTab) 
    ? data.ProductsTab.map((product: any, index: number) => ({
        ...product,
        id: product.id || `product-${index}`,
        name: product.name || product.productName // handle both name formats
      }))
    : [{ ...data.ProductsTab, id: 'product-0' }];

  const customers = Array.isArray(data.CustomersTab)
    ? data.CustomersTab.map((customer: any, index: number) => ({
        ...customer,
        id: customer.id || `customer-${index}`,
        name: customer.customerName || customer.name // handle both name formats
      }))
    : [{ ...data.CustomersTab, id: 'customer-0' }];

  // Then create invoices with proper relationships
  const invoices = Array.isArray(data.InvoicesTab)
    ? data.InvoicesTab.map((invoice: any, index: number) => {
        // Find corresponding product and customer
        const product = products.find((p: { name: string }) => p.name === invoice.productName);
        const customer = customers.find((c: { name: string }) => c.name === invoice.customerName);
        
        return {
          ...invoice,
          id: invoice.id || `invoice-${index}`,
          productId: product?.id || `product-unknown`,
          customerId: customer?.id || `customer-unknown`,
        };
      })
    : [{
        ...data.InvoicesTab,
        id: 'invoice-0',
        productId: 'product-0',
        customerId: 'customer-0'
      }];

  return { products, customers, invoices };
};

const processImage = async (file: File) => {
  // Implement image processing logic here
  // This would typically involve using OCR
  // For now, return mock data
  return {
    invoices: [],
    products: [],
    customers: [],
  };
};

export const validateData = (data: { products: Product[], customers: Customer[], invoices: Invoice[] }) => {
  const errors: string[] = [];

  // Validate products
  data.products.forEach(product => {
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
  data.customers.forEach(customer => {
    if (!customer.name?.trim()) {
      errors.push(`Missing customer name for customer ID: ${customer.id}`);
    }
    if (!customer.phoneNumber?.trim()) {
      errors.push(`Missing phone number for customer: ${customer.name}`);
    }
  });

  // Validate invoices
  data.invoices.forEach(invoice => {
    if (!invoice.serialNumber?.trim()) {
      errors.push(`Missing serial number for invoice ID: ${invoice.id}`);
    }
    if (!invoice.customerId) {
      errors.push(`Missing customer reference for invoice: ${invoice.serialNumber}`);
    }
    if (!invoice.productId) {
      errors.push(`Missing product reference for invoice: ${invoice.serialNumber}`);
    }
    if (!invoice.quantity || invoice.quantity <= 0) {
      errors.push(`Invalid quantity for invoice: ${invoice.serialNumber}`);
    }
  });

  return errors;
};

export { processExcel };
