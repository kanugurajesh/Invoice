import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { processFile, validateData } from '../utils/fileProcessor';
import { setProducts } from '../store/slices/productsSlice';
import { setCustomers } from '../store/slices/customersSlice';
import { setInvoices } from '../store/slices/invoicesSlice';
import { Product, Customer, Invoice } from '../types';
import { mergeDataSets } from '../utils/dataMerger';

interface ProcessedData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

// component for uploading files and processing them
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
      // Process each file and collect results
      const processedDataSets: ProcessedData[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const fileData = await processFile(files[i]);
        processedDataSets.push(fileData);
      }

      // Merge data from all files
      const mergedData = mergeDataSets(processedDataSets);

      // Validate the merged data
      const validationErrors = validateData(mergedData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          toast.warning(error);
        });
      }

      // Update store with merged data
      dispatch(setProducts(mergedData.products));
      dispatch(setCustomers(mergedData.customers));
      dispatch(setInvoices(mergedData.invoices));

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
