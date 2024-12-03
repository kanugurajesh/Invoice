// API URL configuration
const BASE_URL = import.meta.env.VITE_API_URL;

// Define API endpoints
const urls = {
  transcribePdf: `${BASE_URL}${import.meta.env.VITE_TRANSCRIBE_PDF_URL}`,
  transcribeImage: `${BASE_URL}${import.meta.env.VITE_TRANSCRIBE_IMAGE_URL}`,
};

export default urls;
