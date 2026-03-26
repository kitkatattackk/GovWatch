const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../settings.json');

const DEFAULTS = {
  sources: {
    substack:        true,
    congress:        true,
    federalregister: true,
    courtlistener:   true,
    usaspending:     true,
  },
  feed: {
    days:     30,
    pageSize: 50,
  },
};

function loadSettings() {
  try {
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    return {
      sources: { ...DEFAULTS.sources, ...(raw.sources || {}) },
      feed:    { ...DEFAULTS.feed,    ...(raw.feed    || {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
}

router.get('/', (req, res) => {
  res.json(loadSettings());
});

router.post('/', (req, res) => {
  const current = loadSettings();
  const updated = {
    sources: { ...current.sources, ...(req.body.sources || {}) },
    feed:    { ...current.feed,    ...(req.body.feed    || {}) },
  };
  saveSettings(updated);
  res.json(updated);
});

module.exports = { router, loadSettings };
