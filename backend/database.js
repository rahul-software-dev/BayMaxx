import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import cluster from 'cluster';
import os from 'os';
import responseTime from 'response-time';

// Load Environment Variables
dotenv.config();

// Import Config & Middleware
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import Routes
import apiRoutes from './routes/apiRoutes.js';
import emotionRoutes from './routes/emotionRoutes.js';
import medicalRoutes from './routes/medicalRoutes.js';

// Constants
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Cluster Mode for Performance Optimization
if (cluster.isPrimary) {
  console.log(`🛠 Primary Cluster: ${process.pid} Spawning Workers...`);
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`❌ Worker ${worker.process.pid} Died! Restarting...`);
    cluster.fork();
  });
} else {
  // Initialize Express App
  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // 🛠 Connect Database
  connectDB();

  // ✅ Middleware Setup
  app.use(express.json({ limit: '1mb' })); // JSON body parsing with size limit
  app.use(express.urlencoded({ extended: true, limit: '1mb' })); // URL-encoded parsing
  app.use(cookieParser()); // Parse cookies
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true })); // CORS policy
  app.use(helmet()); // Security headers
  app.use(compression()); // Gzip compression for faster responses
  app.use(morgan(isProduction ? 'combined' : 'dev')); // Logging based on environment
  app.use(requestLogger); // Custom request logging
  app.use(responseTime()); // Tracks API response time

  // 🚀 **Rate Limiting (Prevents DoS Attacks)**
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
  });
  app.use('/api', limiter); // Apply rate limit to all API routes

  // 🚀 **API Routes**
  app.use('/api', apiRoutes);
  app.use('/api/emotion', emotionRoutes);
  app.use('/api/medical', medicalRoutes);

  // 🚀 **WebSockets for Real-Time AI Interaction**
  io.on('connection', (socket) => {
    console.log(`⚡ Client Connected: ${socket.id}`);

    socket.on('chatMessage', (msg) => {
      console.log(`🗨️ Message: ${msg}`);
      io.emit('chatResponse', `AI Response to: ${msg}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client Disconnected: ${socket.id}`);
    });
  });

  // ✅ **Default Route**
  app.get('/', (req, res) => {
    res.status(200).json({ message: '🚀 BayMaxx AI Backend is Running!' });
  });

  // ✅ **Error Handling Middleware**
  app.use(errorHandler);

  // ✅ **Start Server**
  server.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} Listening on Port ${PORT}`);
  });
}