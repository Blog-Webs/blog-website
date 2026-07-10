const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { attachUser } = require('./middleware/auth');
const { getLiveCount } = require('./sockets/liveUsers');

const authRoutes = require('./modules/auth/authRoutes');
const contentRoutes = require('./modules/content/contentRoutes');
const progressRoutes = require('./modules/workspace/progressRoutes');
const bookmarkRoutes = require('./modules/workspace/bookmarkRoutes');
const todoRoutes = require('./modules/workspace/todoRoutes');
const blogRoutes = require('./modules/blog/blogRoutes');
const seriesRoutes = require('./modules/series/seriesRoutes');
const newsletterRoutes = require('./modules/newsletter/newsletterRoutes');
const contactRoutes = require('./modules/contact/contactRoutes');
const searchRoutes = require('./modules/search/searchRoutes');
const adminContentRoutes = require('./modules/content/adminContentRoutes');
const adminRoutes = require('./modules/blog/adminRoutes');
const noteRoutes = require('./modules/workspace/noteRoutes');
const studentOSRoutes = require('./modules/studentos/routes/index');
const forumRoutes = require('./modules/forum/forumRoutes');
const notificationRoutes = require('./modules/admin/notificationRoutes');

// Load EventBus listeners
require('./events');

const compression = require('compression');

const app = express();
app.use(compression());

app.set('trust proxy', 1);

// Supports one or more comma-separated origins, e.g.
// CLIENT_URL=https://httptechnex.vercel.app,https://httptechnex-git-main.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (server-to-server, curl, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(
          `[CORS] Blocked request from origin "${origin}". ` +
          `Allowed origins: ${allowedOrigins.join(', ')}. ` +
          'If this should be allowed, add it to CLIENT_URL on the server (comma-separated).'
        );
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Attach req.user (or null) on every request based on the Authorization header
app.use(attachUser);

app.get('/', (req, res) => {
  res.json({ service: 'HttpTechNex API', status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', liveUsers: getLiveCount() });
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/studentos', studentOSRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Central error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Cross-origin request blocked.' });
  }
  console.error('[Error]', err.message);
  if (err.message === 'Only image files are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong on our end.' });
});

module.exports = app;
