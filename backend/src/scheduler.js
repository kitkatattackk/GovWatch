const cron = require('node-cron');
const { pollSubstack }         = require('./pollers/substack');
const { pollCongress }         = require('./pollers/congress');
const { pollFederalRegister }  = require('./pollers/federal_register');
const { pollCourtListener }    = require('./pollers/courtlistener');
const { pollUSASpending }      = require('./pollers/usaspending');
const { generateDailyDigest }  = require('./services/digest_generator');

function startScheduler() {
  // Substack: every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Scheduler] → Substack poll starting...');
    await pollSubstack();
    console.log('[Scheduler] ✓ Substack poll done.');
  });

  // Government APIs: every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] → Government APIs poll starting...');
    await pollCongress();
    await pollFederalRegister();
    await pollCourtListener();
    await pollUSASpending();
    console.log('[Scheduler] ✓ Government APIs poll done.');
  });

  // Daily Digest: every morning at 6 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] → Daily digest generation starting...');
    await generateDailyDigest();
    console.log('[Scheduler] ✓ Daily digest done.');
  });

  console.log('[Scheduler] Started — Substack: 15min | Gov APIs: 30min | Digest: 6AM daily');
}

module.exports = { startScheduler };
