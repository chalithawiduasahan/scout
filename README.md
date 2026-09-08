# Scout — Find Leads. Prove Value. Send It.

**Scout** is an autonomous AI agent that finds real small businesses, researches their pain points, builds a *real, working automation prototype* for them on the spot, and drafts a personalized cold outreach email with visual proof attached — all with a human approving the final send.

Built for the **"Agents for Humans"** hackathon.

🔗 **Live app:** [ai-scout-agent.vercel.app](https://ai-scout-agent.vercel.app/)

---

## The problem

Cold outreach for freelance automation work is usually generic ("I can automate your business!") with nothing to back it up. Scout instead shows up with a finished, working demo built *specifically* for that business, before the first email is even sent.

## How it works

Scout runs a 4-stage autonomous pipeline for each business it targets:

1. **Discovery** — Searches the web for real businesses matching a given niche, location, and scale (small / medium / large), automatically excluding any business already contacted by that user before.
2. **Research** — Investigates the selected business's website and online presence to find a real, specific manual task they likely struggle with — and a contact email, if publicly available.
3. **Live Demo Build** — Actually builds and runs a working automation, end-to-end:
   - Auto-fills and submits a real lead-capture form (via Playwright)
   - Logs the lead into a live Airtable CRM
   - Drafts and renders an instant auto-reply email
   - Renders a mock Slack notification alerting the "team" to the new lead
   - Takes a screenshot of all four steps as proof
4. **Outreach Drafting** — Writes a short, natural cold email referencing the specific pain point found and the four attached proof screenshots — held for human review and approval before it's ever sent.

Nothing is emailed without a person clicking **Approve & send**.

## Key features

- **Batch runs** — set a run count and Scout finds, researches, and builds demos for multiple businesses in one go, queued up for individual review.
- **No duplicate outreach** — checks Supabase before selecting a business, so the same business is never contacted twice by the same user.
- **Self-healing CRM view** — automatically clears any stale demo data left behind by a previous run before capturing a fresh screenshot.
- **Persistent history** — every sent outreach (including all four proof screenshots) is permanently stored via Supabase Storage, so it's never lost even after a server restart.
- **Analytics dashboard** — tracks total businesses reached, execution success rate, and estimated hours saved.

## Tech stack

| Layer | Technology |
|---|---|
| Agent framework | [Strands Agents SDK](https://github.com/strands-agents) |
| LLM | Claude Haiku 4.5 via Amazon Bedrock |
| Web research | Linkup Search API |
| Browser automation | Playwright (headless Chromium) |
| Demo CRM | Airtable |
| Demo email delivery | Amazon SES |
| Backend | FastAPI (Python) |
| Frontend | React + TypeScript + Tailwind |
| Data & file storage | Supabase (Postgres + Storage) |
| Hosting | Render (backend), Vercel (frontend) |

## Architecture

```
User sets niche/location/scale/count
        │
        ▼
 Discovery Agent (Linkup search)
        │  finds & excludes already-contacted businesses
        ▼
 Research Agent (Linkup search)
        │  finds pain point + contact email
        ▼
 Demo Builder (Playwright + Airtable + SES + Slack mock)
        │  builds working automation, captures 4 screenshots
        ▼
 Outreach Agent (Claude Haiku)
        │  drafts personalized pitch email
        ▼
 Human review → Approve & Send
        │
        ▼
 Screenshots uploaded to Supabase Storage
 Record saved to Supabase (History + Analytics)
```

## Running it locally

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* Playwright browsers

**Backend:**
```bash
git clone https://github.com/chalithawiduasahan/scout.git
cd scout
python -m venv venv

#on macOS/Linux:
source venv/bin/activate

#on Windows:
venv\scripts\activate

pip install -r requirements.txt
playwright install chromium
```

Create a `.env` file in the project root with:
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
TAVILY_API_KEY=your_tavily_key
TALLY_FORM_URL=your_tally_url
AIRTABLE_TOKEN=your_airtable_token
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_airtable_table_name
AIRTABLE_SHARE_URL=your_airtable_share_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
SES_SENDER_EMAIL=your_verified_sender
SES_TEST_RECIPIENT=your_verified_recipient
```

Then run:
```bash
uvicorn server:app --reload
```

**Frontend:** 
Open a new terminal window and navigate to the `project/` folder and run,

```bash
cd project
npm install
npm run dev
```

## Challenges faced

- **AWS SES sandbox restrictions** — SES requires both sender *and* recipient emails to be verified while in sandbox mode. Rather than rushing into SES production access (which reviews cold-outreach use cases strictly and can take days), we deliberately stayed in sandbox and used pre-verified test recipients for the demo — a full multi-tenant reply-routing system (unique per-user reply aliases + inbound email parsing) is scoped as a post-hackathon roadmap item.
- **Playwright on a resource-constrained host** — screenshots that worked reliably locally began timing out once deployed to Render, caused by a combination of missing container launch flags (`--disable-dev-shm-usage`, `--no-sandbox`), an overly strict page-load wait condition, and free-tier CPU limits. Solved with adjusted Chromium launch args, `domcontentloaded` wait conditions with longer timeouts, and upgrading to a paid Render tier for consistent performance.
- **Ephemeral server storage** — screenshots saved to local disk vanished on every Render restart/redeploy, breaking the History tab over time. Solved by uploading proof screenshots to Supabase Storage at send-time and persisting permanent public URLs instead of local file paths.
- **Demo integrity** — an early version could describe one automated pain point in the outreach email while attaching screenshots of a different, generic demo system. Fixed by standardizing the outreach email to always describe the actual lead-capture demo shown in the screenshots, keeping every claim in the email backed by visual proof.

## What's next

- Full multi-tenant SES production setup with per-user reply-to aliases and an in-app reply inbox
- Custom, business-specific automation builds instead of a single canonical demo pattern
- Support for additional automation categories beyond lead capture

## License

MIT — see [LICENSE](./LICENSE).
