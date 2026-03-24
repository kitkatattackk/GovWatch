# GovWatch

A political news aggregator that pulls from government data sources and followed Substack authors, generates AI summaries, and presents a clean daily digest.

**Live backend:** `https://govwatch-production-ddaf.up.railway.app`

---

## Architecture

- **Backend:** Node.js / Express, deployed on Railway
- **Database:** PostgreSQL (Railway managed)
- **Frontend:** Static HTML pages (Tailwind CSS, vanilla JS)
- **AI:** Claude Haiku via Anthropic API for article summarization and categorization

---

## Data Sources

| Source | Category | Polling Frequency |
|---|---|---|
| Substack (followed authors) | opinion | Every 4 hours |
| Congress.gov | bills_votes | Every 6 hours |
| Federal Register | executive_orders | Every 6 hours |
| CourtListener | court_rulings | Every 6 hours |
| USASpending.gov | government_spending | Every 6 hours |

Each poller fetches at most **5 items per run** and skips anything older than **7 days** to keep Claude API costs low.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/feed` | Article feed. Params: `?category=`, `?days=2`, `?limit=10`, `?offset=0` |
| `GET` | `/api/digest` | Last 24h articles grouped by category |
| `GET` | `/api/digest/today` | Today's pre-computed digest with AI summaries |
| `GET` | `/api/authors` | List followed Substack authors |
| `POST` | `/api/authors` | Add author `{ name, substack_slug }` |
| `DELETE` | `/api/authors/:id` | Unfollow an author |
| `POST` | `/api/poll` | Manually trigger all pollers |
| `GET` | `/health` | Health check |

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `CONGRESS_API_KEY` | Congress.gov API key |
| `COURTLISTENER_API_KEY` | CourtListener API key (optional) |

---

## Frontend Pages

Located in `connected_*/code.html`:

- `connected_home_feed/` — Main article feed
- `connected_daily_digest/` — Daily digest view
- `connected_author_list/` — Manage followed authors
- `connected_article_detail/` — Individual article view

---

## Local Development

```bash
cd backend
cp .env.example .env   # fill in your keys
npm install
npm run dev            # nodemon on port 3000
```

---

## Estimated Running Cost

| Service | Cost |
|---|---|
| Railway (backend + Postgres) | ~$5/month |
| Anthropic API (Claude Haiku) | ~$1/month |
| Frontend hosting (Vercel) | Free |
| **Total** | **~$6/month** |
