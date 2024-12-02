import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { processFile, validateData } from '../utils/fileProcessor';
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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const processingToast = toast.info(
      `Processing ${files.length} file${files.length > 1 ? 's' : ''}...`, 
      { autoClose: false }
    );

    try {
      const data = await processFile(files);

      // Validate the extracted data
      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          toast.warning(error);
        });
      }

      // Update store
      dispatch(setProducts(data.products));
      dispatch(setCustomers(data.customers));
      dispatch(setInvoices(data.invoices));

      toast.dismiss(processingToast);
      toast.success(`Successfully processed ${files.length} file${files.length > 1 ? 's' : ''}!`);

    } catch (error) {
      toast.dismiss(processingToast);
      toast.error(error instanceof Error ? error.message : 'Failed to process files');
    } finally {
      setIsLoading(false);
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
            multiple
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
