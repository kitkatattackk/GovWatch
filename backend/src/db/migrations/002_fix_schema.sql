-- Fix: add opinion category, ensure avatar_url and bio columns exist on authors

-- Add avatar_url column if it doesn't exist
ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio TEXT;

-- Drop and recreate category constraint to include 'opinion'
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE articles ADD CONSTRAINT articles_category_check
  CHECK (category IN (
    'bills_votes',
    'executive_orders',
    'court_rulings',
    'government_spending',
    'opinion'
  ));
