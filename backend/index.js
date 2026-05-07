require('dotenv').config(); 
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const englishRoutes = require('./routes/englishRoutes');
const progressRoutes = require('./routes/progressRoutes');
const demoRoutes = require('./routes/demoRoutes');
const generalRoutes = require('./routes/generalRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server to attach WebSockets

// Production Middleware
app.use(helmet({
  contentSecurityPolicy: false, // For development and Gemini WS connections if needed
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// WebSocket Bridge Initialization
require('./services/wsBridge')(server);

// Global Rate Limiting to protect API and LLM quotas
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' }
});

app.use('/auth', limiter, authRoutes);
app.use('/interview', limiter, interviewRoutes);
app.use('/english', limiter, englishRoutes);
app.use('/progress', limiter, progressRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api', generalRoutes);

app.get('/', (req, res) => {
  res.send('InterviewAI Backend API + WebSocket Server Running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server + WebSockets running on port ${PORT}`);
  });
});
