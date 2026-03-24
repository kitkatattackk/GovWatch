require('dotenv').config();

// Startup diagnostics
console.log('[Boot] DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('[Boot] NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[Boot] PORT:', process.env.PORT || '3000 (default)');

const express = require('express');
const cors = require('cors');
const { startScheduler } = require('./scheduler');
const { pollSubstack }        = require('./pollers/substack');
const { pollCongress }        = require('./pollers/congress');
const { pollFederalRegister } = require('./pollers/federal_register');
const { pollCourtListener }   = require('./pollers/courtlistener');
const { pollUSASpending }      = require('./pollers/usaspending');
const { generateDailyDigest }  = require('./services/digest_generator');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feed',     require('./routes/feed'));
app.use('/api/articles', require('./routes/feed'));
app.use('/api/digest',   require('./routes/digest'));
app.use('/api/authors',  require('./routes/authors'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual trigger: run all pollers immediately (useful during dev)
app.post('/api/poll', async (req, res) => {
  console.log('[Manual] Triggering all pollers...');
  res.json({ message: 'Polling started — check server logs.' });
  await pollSubstack();
  await pollCongress();
  await pollFederalRegister();
  await pollCourtListener();
  await pollUSASpending();
  console.log('[Manual] All pollers complete.');
  await generateDailyDigest();
  console.log('[Manual] Digest generated.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\nGovWatch API running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /api/feed           — article feed (optional ?category=)');
  console.log('  GET  /api/digest         — last 24h grouped by category');
  console.log('  GET  /api/authors        — followed authors');
  console.log('  POST /api/authors        — add an author { name, substack_slug }');
  console.log('  DELETE /api/authors/:id  — unfollow an author');
  console.log('  POST /api/poll           — manually trigger all pollers');
  console.log('  GET  /health\n');

  startScheduler();
});
