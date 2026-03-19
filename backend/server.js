require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const chatRoutes = require('./routes/chat');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Init DB
(async () => {
  try {
    await initDB();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/chat', chatRoutes);

    // Health check
    app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

    app.listen(PORT, () => console.log(`🚀 Placement Trainer API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  }
})();