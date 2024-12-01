import * as XLSX from "xlsx";
import { Invoice, Product, Customer } from "../types";

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

const processExcel = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process the data and organize it into the required format
        const processed = organizeData(jsonData);
        resolve(processed);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const processPDF = async (file: File) => {
  const handleFileUpload = async () => {
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

    console.log('Processed data:', { products, customers, invoices });
    return { products, customers, invoices };
  };

  const data = await handleFileUpload();
  return data;
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

const organizeData = (rawData: any[]) => {
  const productsMap = new Map<string, Product>();
  const customersMap = new Map<string, Customer>();
  const invoices: Invoice[] = [];

  rawData.forEach((row: any, index: number) => {
    try {
      // Extract product information
      const productName = row['Product Name'] || row['ProductName'] || row['product_name'] || row['productName'];
      if (productName && !productsMap.has(productName)) {
        const product: Product = {
          id: `product-${index}`,
          name: productName,
          quantity: Number(row['Quantity'] || row['quantity'] || 0),
          unitPrice: Number(row['Unit Price'] || row['UnitPrice'] || row['unit_price'] || 0),
          tax: Number(row['Tax'] || row['tax'] || 0),
          priceWithTax: 0
        };
        
        // Calculate price with tax
        product.priceWithTax = product.unitPrice * (1 + product.tax / 100);
        productsMap.set(productName, product);
      }

      // Extract customer information
      const customerName = row['Customer Name'] || row['CustomerName'] || row['customer_name'] || row['customerName'];
      if (customerName && !customersMap.has(customerName)) {
        const customer: Customer = {
          id: `customer-${index}`,
          name: customerName,
          phoneNumber: String(row['Phone Number'] || row['PhoneNumber'] || row['phone_number'] || row['phone'] || ''),
          totalPurchaseAmount: Number(row['Total Amount'] || row['TotalAmount'] || row['total_amount'] || 0)
        };
        customersMap.set(customerName, customer);
      }

      // Create invoice entry
      if (productName && customerName) {
        const product = productsMap.get(productName)!;
        const customer = customersMap.get(customerName)!;
        
        const invoice: Invoice = {
          id: `invoice-${index}`,
          serialNumber: String(row['Serial Number'] || row['SerialNumber'] || row['serial_number'] || index + 1),
          customerId: customer.id,
          customerName: customer.name,
          productId: product.id,
          productName: product.name,
          quantity: Number(row['Quantity'] || row['quantity'] || 0),
          tax: product.tax,
          totalAmount: product.priceWithTax * Number(row['Quantity'] || row['quantity'] || 0),
          date: new Date(row['Date'] || row['date'] || Date.now()).toISOString()
        };
        invoices.push(invoice);

        // Update customer's total purchase amount
        const currentCustomer = customersMap.get(customerName)!;
        currentCustomer.totalPurchaseAmount += invoice.totalAmount;
        customersMap.set(customerName, currentCustomer);
      }
    } catch (error) {
      console.error(`Error processing row ${index}:`, error);
      // Continue processing other rows even if one fails
    }
  });

  return {
    products: Array.from(productsMap.values()),
    customers: Array.from(customersMap.values()),
    invoices
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
