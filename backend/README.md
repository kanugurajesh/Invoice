# Backend Documentation - Invoice Management System

## Overview
This is the backend service for the Automated Data Extraction and Invoice Management System. The service processes various file formats (Excel, PDF, Images) and extracts invoice, product, and customer data using Google Gemini AI.

## Tech Stack
- Node.js
- Express.js
- Google Gemini AI API (for data extraction)
- Multer (File handling)


## File Processing & AI Data Extraction

The system processes three types of files:

1. **PDF Files**
   - Extracts text and tabular data
   - Identifies invoice details, product information, and customer data

2. **Image Files**
   - Uses Google Gemini AI's vision capabilities
   - Extracts text from invoice images
   - Processes structured data from images

3. **Excel Files**
   - Processes structured data
   - Maps columns to appropriate data models
   - Handles multiple sheets

## Error Handling
The system implements error handling for:
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