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
    return data;
  };

  const data = await handleFileUpload();

  // Process the data and organize it into the required format

  

  return {
    invoices: [],
    products: [],
    customers: [],
  };
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
  const invoices: Invoice[] = [];
  const products: Product[] = [];
  const customers: Customer[] = [];

  // Process raw data and organize it into the appropriate arrays
  // This is a simplified example - you would need to implement the actual logic
  // based on your data structure

  return { invoices, products, customers };
};

export const validateData = (data: any) => {
  // Implement validation logic here
  return true;
};
