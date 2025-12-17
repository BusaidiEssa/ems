import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// TEST ROUTES - Use these to verify everything works
// ============================================

// Root route - http://localhost:5000/
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ EMS API is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Test route - http://localhost:5000/api/test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Test route working!',
    status: 'success',
    endpoints: {
      root: 'http://localhost:5000/',
      test: 'http://localhost:5000/api/test',
      health: 'http://localhost:5000/api/health'
    }
  });
});

// Health check route - http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'success',
    message: '✅ Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      port: PORT
    }
  };
  res.json(healthCheck);
});

// Test database connection - http://localhost:5000/api/db-test
app.get('/api/db-test', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    
    res.json({
      status: dbState === 1 ? 'success' : 'error',
      message: `Database is ${states[dbState]}`,
      mongodb: {
        status: states[dbState],
        host: mongoose.connection.host || 'Not connected',
        name: mongoose.connection.name || 'Not connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database check failed',
      error: error.message
    });
  }
});

// ============================================
// CONNECT TO MONGODB
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('   💡 Tip: Check your MONGODB_URI in .env file');
  });

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`   EMS Server is running!`);
  console.log('   ===================================');
  console.log(`   📍 Local: http://localhost:${PORT}`);
  console.log(`   📍 Test:  http://localhost:${PORT}/api/test`);
  console.log('   ===================================\n');
});

// Handle server errors
app.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// 404 handler - for routes that don't exist
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '❌ Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'GET /api/health',
      'GET /api/db-test'
    ]
  });
});