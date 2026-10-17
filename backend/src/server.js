/**
 * AccessVision Assistant – Backend Server
 *
 * Microservice providing AI-assisted summarization, contextual image alt-text
 * generation, automated WCAG 2.2 accessibility auditing, and user feedback intake.
 */

// Load environment variables if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional in environments where variables are passed directly
}

const express = require('express');
const cors = require('cors');

const summarizeRoutes = require('./routes/summarize');
const altTextRoutes = require('./routes/altText');
const auditRoutes = require('./routes/audit');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow extension popups, content scripts, and demo website
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use('/api/summarize', summarizeRoutes);
app.use('/api/alt-text', altTextRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AccessVision Backend Service',
    version: '1.0.0',
    uptime: process.uptime(),
    aiProviders: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      huggingface: Boolean(process.env.HUGGINGFACE_API_KEY),
      localTextRank: true
    },
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AccessVision API Service.',
    documentation: 'See docs/Design.md and docs/Implementation-Guide.md for API specs.',
    endpoints: [
      'POST /api/summarize',
      'POST /api/alt-text',
      'POST /api/alt-text/batch',
      'POST /api/audit',
      'POST /api/feedback',
      'GET  /api/feedback',
      'GET  /api/health'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` AccessVision Assistant Backend running on port ${PORT}`);
    console.log(` Health check available at: http://localhost:${PORT}/api/health`);
    console.log(` AI Providers: OpenAI (${Boolean(process.env.OPENAI_API_KEY)}), HuggingFace (${Boolean(process.env.HUGGINGFACE_API_KEY)}), Local NLP (Active)`);
    console.log(`====================================================`);
  });
}

module.exports = app;
