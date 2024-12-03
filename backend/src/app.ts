import express from 'express';
import cors from 'cors';
import routes from './routes';
import fs from 'fs';
import path from 'path';

const app = express();

// Configure CORS for frontend access
app.use(cors({
    origin: 'https://invoice-kc4j.vercel.app',  // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory for file storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Mount API routes
app.use('/api', routes);

export default app;