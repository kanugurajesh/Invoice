When making the request the backend may give response with some delay this is due to the backend is deployed on render.com which spins down the server if it not used but once you send a request the server spins up and the delay won't be there for the consequent request

# Automated Data Extraction and Invoice Management System

A React-based application for Swipe that automates the extraction, processing, and management of invoice data from various file formats. The application organizes extracted data into three main sections: Invoices, Products, and Customers, with real-time synchronization using Redux.

## 🎯 Project Overview

This application successfully implements all requirements and test cases, providing a robust solution for automated invoice processing.

### ✅ Key Features

- **Multi-format File Processing**
  - Excel files (transaction details)
  - PDF invoices
  - Image-based invoices
  - Seamless handling of mixed file types

- **AI-Powered Data Extraction**
  - Implemented using Google Gemini API
  - Intelligent data recognition and categorization
  - Automatic field mapping and organization

- **Interactive Dashboard**
  - Invoices Tab: Complete transaction details
  - Products Tab: Comprehensive product inventory
  - Customers Tab: Customer information and purchase history

- **Real-time Data Synchronization**
  - Redux-based state management
  - Instant updates across all tabs
  - Consistent data representation

### ✅ Test Cases Completed

All test cases have been successfully implemented and thoroughly tested:

1. **Case-1**: Single Invoice PDFs
2. **Case-2**: Mixed Invoice PDFs and Images
3. **Case-3**: Single Excel File Processing
4. **Case-4**: Multiple Excel Files
5. **Case-5**: Mixed File Types (All Formats)

## 🚀 Live Demo

App Link :- https://invoice-kc4j.vercel.app/
<br />
Video Link :- https://youtu.be/XNAYFbIKPXA

<!-- TODO: Add live demo link -->

## 🛠️ Technology Stack

- **Frontend**: React.js, Redux
- **UI Framework**: Material UI
- **AI Integration**: Google Gemini API
- **State Management**: Redux
- **Styling**: Tailwind Css
- **Backend**: Express.js, Node.js
- **Language**: Typescript

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kanugurajesh/invoice
   ```

2. Install dependencies
   ```bash
   cd frontend
   npm install
   create .env file and add the following environment variable. in VITE_API_URL add link of the hosted backend
   cd ../backend
   create .env file and add the following environment variable
   GEMINI_API_KEY=
   npm install
   ```

3. Run the development server
   ```bash
   cd frontend
   npm run dev
   cd ../backend
   npm run dev
   ```

## 💻 Usage

### Data Tables
The application features interactive data tables with the following capabilities:
- In-line cell editing
- Data consistency

### File Upload
Upload data files to import information into the system:
- Supported formats: Pdf's, Excel, Images
- Automatic validation
- Error handling for invalid data

### Error Handling
The application includes comprehensive error handling:
- Graceful error recovery
- User-friendly error messages
- Detailed error logging

## 👥 Authors

- kanugurajesh

## Demo

[![Invoice](https://img.youtube.com/vi/XNAYFbIKPXA/0.jpg)](https://youtu.be/XNAYFbIKPXA)
