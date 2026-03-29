const cron = require('node-cron');
const { pollSubstack }         = require('./pollers/substack');
const { pollCongress }         = require('./pollers/congress');
const { pollFederalRegister }  = require('./pollers/federal_register');
const { pollCourtListener }    = require('./pollers/courtlistener');
const { pollUSASpending }      = require('./pollers/usaspending');
const { generateDailyDigest }  = require('./services/digest_generator');
const { loadSettings }         = require('./routes/settings');

function startScheduler() {
  // POLLING DISABLED — using existing data only (re-enable before going live)
  console.log('[Scheduler] Disabled — all polling paused, serving existing data only.');
}

module.exports = { startScheduler };
