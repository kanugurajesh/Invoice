import { Provider } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { store } from './store';
import FileUpload from './components/FileUpload';
import InvoicesTab from './components/InvoicesTab';
import ProductsTab from './components/ProductsTab';
import CustomersTab from './components/CustomersTab';
import { FileText, Package, Users } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Swipe Invoice Manager</h1>
            
            <div className="mb-8">
              <FileUpload />
            </div>

            <Tabs className="mt-6">
              <TabList className="flex border-b border-gray-200 mb-6">
                <Tab className="flex items-center px-6 py-3 font-medium text-gray-600 border-b-2 border-transparent cursor-pointer hover:text-gray-900 hover:border-gray-300">
                  <FileText className="w-5 h-5 mr-2" />
                  Invoices
                </Tab>
                <Tab className="flex items-center px-6 py-3 font-medium text-gray-600 border-b-2 border-transparent cursor-pointer hover:text-gray-900 hover:border-gray-300">
                  <Package className="w-5 h-5 mr-2" />
                  Products
                </Tab>
                <Tab className="flex items-center px-6 py-3 font-medium text-gray-600 border-b-2 border-transparent cursor-pointer hover:text-gray-900 hover:border-gray-300">
                  <Users className="w-5 h-5 mr-2" />
                  Customers
                </Tab>
              </TabList>

              <TabPanel>
                <InvoicesTab />
              </TabPanel>
              <TabPanel>
                <ProductsTab />
              </TabPanel>
              <TabPanel>
                <CustomersTab />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </Provider>
  );
}

export default App;