const BASE_URL = 'http://localhost:3000/api';

const urls = {
    transcribePdf: `${BASE_URL}/transcribe/pdf`,
    transcribeExcel: `${BASE_URL}/transcribe/excel`,
    transcribeImage: `${BASE_URL}/transcribe/image`,
}

export default urls;