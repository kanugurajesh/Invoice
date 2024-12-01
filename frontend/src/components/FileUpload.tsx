import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { processFile } from "../utils/fileProcessor";
import { useDispatch } from "react-redux";
import { addInvoice } from "../store/slices/invoicesSlice";
import { setProducts } from "../store/slices/productsSlice";
import { addCustomer } from "../store/slices/customersSlice";

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          // @ts-ignore
          const { invoices, products, customers } = await processFile(file);

          dispatch(setProducts(products));
          
          invoices.forEach((invoice: any) => dispatch(addInvoice(invoice)));
          customers.forEach((customer: any) => dispatch(addCustomer(customer)));
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? "Drop the files here..."
          : "Drag & drop files here, or click to select files"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Supports PDF, Excel (.xlsx, .xls), and image files
      </p>
    </div>
  );
};

export default FileUpload;
