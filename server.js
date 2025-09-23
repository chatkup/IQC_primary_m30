require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🔧 Configuration:');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   GOOGLE_SCRIPT_URL:', process.env.GOOGLE_SCRIPT_URL ? 'Set' : 'Not set');
console.log('   CORS_ORIGIN:', process.env.CORS_ORIGIN);

// CORS Configuration - อนุญาตทุก origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

app.use(express.json());

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// Main IQC API endpoint
app.get('/api/iqc', async (req, res) => {
  try {
    console.log('🔄 Fetching data from Google Apps Script...');
    
    if (!process.env.GOOGLE_SCRIPT_URL) {
      throw new Error('GOOGLE_SCRIPT_URL not configured');
    }

    const response = await fetch(`${process.env.GOOGLE_SCRIPT_URL}?action=api`, {
      method: 'GET',
      headers: {
        'User-Agent': 'IQC-Proxy-Server/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched IQC data');
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Error fetching IQC data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IQC data',
      details: error.message
    });
  }
});

// Config API endpoint
app.get('/api/config', async (req, res) => {
  try {
    console.log('⚙️ Fetching config from Google Apps Script...');
    
    if (!process.env.GOOGLE_SCRIPT_URL) {
      throw new Error('GOOGLE_SCRIPT_URL not configured');
    }

    const response = await fetch(`${process.env.GOOGLE_SCRIPT_URL}?action=getConfig`, {
      method: 'GET',
      headers: {
        'User-Agent': 'IQC-Proxy-Server/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched config');
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Error fetching config:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch config',
      details: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: ['/health', '/api/iqc', '/api/config']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 IQC Proxy Server started!');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('\n📊 Available endpoints:');
  console.log(`   Health: /health`);
  console.log(`   IQC Data: /api/iqc`);
  console.log(`   Config: /api/config`);
});