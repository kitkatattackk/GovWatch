-- GovWatch Database Schema

CREATE TABLE IF NOT EXISTS authors (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  substack_slug TEXT UNIQUE,  -- e.g. 'aaronparnas' from aaronparnas.substack.com
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id          SERIAL PRIMARY KEY,
  author_id   INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  external_id TEXT UNIQUE NOT NULL,  -- URL or gov doc ID for deduplication
  title       TEXT NOT NULL,
  content     TEXT,
  ai_brief    TEXT,
  category    TEXT CHECK (category IN (
                'bills_votes',
                'executive_orders',
                'court_rulings',
                'government_spending'
              )),
  source      TEXT NOT NULL CHECK (source IN (
                'substack',
                'congress',
                'federal_register',
                'courtlistener',
                'usaspending'
              )),
  source_url  TEXT,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category     ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_articles_created_at   ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source       ON articles(source);

-- Seed: Aaron Parnas as the first followed author
INSERT INTO authors (name, substack_slug)
VALUES ('Aaron Parnas', 'aaronparnas')
ON CONFLICT (substack_slug) DO NOTHING;
