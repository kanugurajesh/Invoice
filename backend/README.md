# Backend Documentation - Invoice Management System

## Overview
This is the backend service for the Automated Data Extraction and Invoice Management System. It provides APIs for processing various file formats (Excel, PDF, Images) and manages data for invoices, products, and customers using AI-powered extraction.

## Tech Stack
- Node.js
- Express.js
- Google Gemini AI API (for data extraction)
- Multer (File handling)


## AI Data Extraction

The system uses Google Gemini AI for extracting data from various file formats:

1. **PDF Processing**
   - Extracts text and tabular data
   - Identifies invoice details, product information, and customer data
   - Handles multiple page documents

2. **Image Processing**
   - OCR capabilities for text extraction
   - Structure recognition for invoice layouts
   - Support for various image formats (PNG, JPEG, etc.)

3. **Excel Processing**
   - Processes structured data
   - Maps columns to appropriate data models
   - Handles multiple sheets

## Error Handling

The system implements comprehensive error handling for:
- Invalid file formats
- Missing required fields
- Data validation failures
- AI extraction errors
- Database operation failures

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the server: `npm run dev`
