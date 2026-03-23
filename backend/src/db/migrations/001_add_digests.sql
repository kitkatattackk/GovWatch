-- Daily digest summaries (pre-computed each morning)
CREATE TABLE IF NOT EXISTS digests (
  id           SERIAL PRIMARY KEY,
  digest_date  DATE NOT NULL,
  category     TEXT NOT NULL CHECK (category IN (
                 'bills_votes',
                 'executive_orders',
                 'court_rulings',
                 'government_spending'
               )),
  summary      TEXT NOT NULL,
  article_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (digest_date, category)
);

CREATE INDEX IF NOT EXISTS idx_digests_date ON digests(digest_date DESC);
