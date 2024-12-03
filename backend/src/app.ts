import express from 'express';
import cors from 'cors';
import routes from './routes';
import fs from 'fs';
import path from 'path';

const app = express();

// Enable CORS
app.use(cors({
    origin: '*'
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use routes with /api prefix
app.use('/api', routes);

export default app;