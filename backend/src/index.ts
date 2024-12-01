import express from 'express';
import cors from 'cors';
import routes from './routes';
import fs from 'fs';
import path from 'path';

const app = express();

// Enable CORS
app.use(cors());

// Use routes
app.use('/', routes);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 