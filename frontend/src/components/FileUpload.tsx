import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { processFile } from '../utils/fileProcessor';
import { setProducts } from '../store/slices/productsSlice';
import { setCustomers } from '../store/slices/customersSlice';
import { setInvoices } from '../store/slices/invoicesSlice';
import { Product, Customer, Invoice } from '../types';

interface ProcessedData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Show processing notification
      const processingToast = toast.info('Processing file...', {
        autoClose: false,
        closeButton: false
      });

      const data = await processFile(file) as ProcessedData;

      // Validate the extracted data
      if (!Array.isArray(data.products) || !Array.isArray(data.customers) || !Array.isArray(data.invoices)) {
        throw new Error('Invalid data structure in file');
      }

      // Update store with extracted data
      dispatch(setProducts(data.products));
      dispatch(setCustomers(data.customers));
      dispatch(setInvoices(data.invoices));

      // Close processing notification and show success
      toast.dismiss(processingToast);
      toast.success('File processed successfully!');

    } catch (error) {
      console.error('File processing error:', error);
      toast.error(error instanceof Error 
        ? error.message 
        : 'Failed to process file. Please try again.'
      );
    } finally {
      setIsLoading(false);
      // Reset input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <label className="relative cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          <div className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <ClipLoader size={16} color="white" />
                <span>Processing...</span>
              </div>
            ) : (
              'Upload File'
            )}
          </div>
        </label>
        {isLoading && (
          <span className="text-sm text-gray-600">
            Please wait while we process your file...
          </span>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Supported formats: Excel (.xlsx, .xls), PDF (.pdf), Images (.png, .jpg, .jpeg)
      </div>
    </div>
  );
};

export default FileUpload;
