# Tailor AI

**AI-powered clothing resale listing tool** — Upload photos of clothing items, get optimized listings across eBay, Poshmark, Mercari, and Depop.

![Status](https://img.shields.io/badge/status-MVP%20in%20development-yellow) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-18+-blue)

## Why Tailor AI?

Clothing resellers spend hours manually creating listings across multiple marketplaces. Tailor AI **automates the entire pipeline**:

- 📸 **AI Photo Analysis** — Brand identification, size detection, condition grading, fabric composition
- 🏷️ **Cross-Platform Listings** — eBay, Poshmark, Mercari, Depop from a single photo set
- 💰 **Smart Pricing** — Brand-aware pricing suggestions based on sold listings
- 🔓 **Open Source** — Inspect the code, self-host, bring your own API keys
- ⚡ **No Per-Listing Credits** — Flat rate or free with your own Claude API key

## Status

**Phase 1 (MVP):** eBay listing via Expo web browser

- [x] Project scaffolding (Expo + Fastify monorepo)
- [x] eBay OAuth integration
- [x] Photo upload interface (6 clothing photos)
- [x] Clothing AI pipeline (Claude vision → structured JSON)
- [x] Draft review & editing
- [x] Publish to eBay (sandbox)
- [ ] eBay taxonomy mapping (hardcoded by gender today)
- [ ] Pricing suggestions
- [ ] Measurements prompt
- [ ] Listing history

**Roadmap:**
- Phase 2: Polish, drafts, templates, bulk upload
- Phase 3: Cross-platform (Poshmark, Mercari, Depop) + iOS app
- Phase 4: Community ecosystem, analytics, team features

## Getting Started (Development)

### Prerequisites

- Node.js 18+
- npm or yarn
- eBay Developer account (sandbox & production)
- Anthropic API key

### Local Setup

```bash
# Clone the repo
git clone https://github.com/cable-ai/tailor-ai.git
cd tailor-ai

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Project Structure

```
tailor-ai/
├── apps/
│   ├── web/                 # Expo web (React Native + TypeScript)
│   │   ├── src/
│   │   │   ├── screens/     # PhotoUploadScreen, ReviewScreen, PublishScreen
│   │   │   ├── components/  # Reusable UI components
│   │   │   └── App.tsx
│   │   └── app.json         # Expo config
│   │
│   └── api/                 # Fastify backend
│       ├── src/
│       │   ├── services/
│       │   │   ├── ebay.ts       # eBay OAuth + Inventory API
│       │   │   └── ai.ts         # Claude vision pipeline
│       │   └── main.ts           # Fastify server + all routes
│       └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md      # System design & data flow
│   ├── AI_PROMPTS.md        # Clothing analysis prompt engineering
│   └── EBAY_INTEGRATION.md  # eBay API setup guide
│
├── .env.example
├── package.json             # Monorepo root
├── tsconfig.json
├── .gitignore
└── README.md
```

## Configuration

### Environment Variables

Create `.env.local` in the project root:

```env
# eBay (Sandbox)
EBAY_SANDBOX_CLIENT_ID=your_app_id
EBAY_SANDBOX_CLIENT_SECRET=your_cert_id
EBAY_SANDBOX_REDIRECT_URI=YourName-AppName-SBX-xxxxxxxx   # RuName from eBay developer portal

# eBay account deletion notifications (compliance requirement)
EBAY_VERIFICATION_TOKEN=your_random_verification_token
EBAY_NOTIFICATION_ENDPOINT_URL=https://yourdomain.com/api/marketplace/account-deletion

# eBay (Production)
EBAY_PROD_CLIENT_ID=your_prod_client_id
EBAY_PROD_CLIENT_SECRET=your_prod_cert_id
EBAY_PROD_REDIRECT_URI=https://yourdomain.com/auth/ebay/callback

# Claude API
ANTHROPIC_API_KEY=your_api_key

# App
NODE_ENV=development
API_PORT=4000
EXPO_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:8081
```

## Tech Stack

- **Frontend:** React Native + TypeScript + Expo (web + iOS)
- **UI:** NativeWind (Tailwind for React Native)
- **Backend:** Fastify + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Cache:** Redis (Upstash)
- **AI:** Anthropic Claude API (Haiku 4.5 default, Sonnet 4.6 premium)
- **Payments:** Stripe (future)
- **Hosting:** Railway or Fly.io (MVP)

## Key Features

### Phase 1: MVP (eBay)

**Photo Upload**
- Gallery upload for up to 6 clothing photos
- Photos: front flat lay, back flat lay, brand tag, size tag, care label, flaws (optional)

**AI Analysis Pipeline**
- Claude Vision processes all 6 photos → structured JSON
- Extracts: brand, size, color, material, condition grade, style, item type, keywords
- Suggests: eBay category, required item specifics, pricing

**Measurements**
- AI identifies which measurements are needed (pit-to-pit, length, waist, etc.)
- Prompts user with visual guides for manual measurement entry

**Draft Review**
- Edit all AI-generated fields (title, description, price, condition, etc.)
- Real-time preview of eBay listing
- Save as draft for later publishing

**Publish**
- Upload images via eBay Media API
- Create inventory item → create offer → publish to eBay
- Track published listings and sold prices

### Future Phases

- **Poshmark, Mercari, Depop:** Browser automation (Playwright)
- **iOS App:** Guided camera capture flow
- **Brand Value DB:** Crowdsourced resale pricing by brand + size + condition
- **Analytics:** Sell-through rates, average prices by brand, platform performance
- **Multi-User:** Team/closet support

## Architecture

```
┌─────────────────────────────────────────┐
│  Expo Web (React Native + TypeScript)   │
│  - Photo gallery upload                 │
│  - AI review & editing                  │
│  - Marketplace OAuth flows              │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│  Fastify Backend (Node.js + TypeScript) │
│                                         │
│  ┌──────────────┐  ┌────────────────┐  │
│  │ AI Service   │  │ Marketplace    │  │
│  │ - Claude     │  │ - eBay Auth    │  │
│  │ - Vision     │  │ - Inventory    │  │
│  │ - Pricing    │  │ - Media Upload │  │
│  └──────────────┘  └────────────────┘  │
│                                         │
│  PostgreSQL + Redis                     │
└─────────────────────────────────────────┘
```

## AI Cost Analysis

### Per-Listing Cost

| Model | Cost | Accuracy |
|-------|------|----------|
| Haiku 4.5 | ~$0.02-0.03 | Good for brand/tag reading, descriptions |
| Sonnet 4.6 | ~$0.07-0.08 | Better for niche/vintage items |

With **prompt caching** on the system prompt, input costs drop ~90%.

### Monthly Costs

| User Type | Listings/mo | Haiku Cost |
|-----------|------------|-----------|
| Personal use | 30-50 | $0.60-1.50 |
| Free-tier user | 15 | $0.30-0.45 |
| Active Pro | 100-200 | $2-6 |
| Power seller | 500+ | $10-15 |

## Monetization

```
Free (forever)
├─ 15 AI listings/month
├─ eBay only
├─ Haiku 4.5 AI
└─ Open source self-hosters (unlimited with own API key)

Pro ($12-15/month via Stripe)
├─ Unlimited listings
├─ Cross-platform (Poshmark, Mercari, Depop)
├─ Brand value intelligence
├─ Sonnet 4.6 "Premium AI" option
└─ Priority support
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-thing`)
3. **Commit** your changes (`git commit -m 'Add amazing thing'`)
4. **Push** to your fork (`git push origin feature/amazing-thing`)
5. **Open a Pull Request** with a clear description

### Areas We Need Help With

- AI prompt refinement for clothing-specific details
- eBay API integration improvements
- UI/UX feedback and contributions
- Documentation
- Testing and bug reports
- Community brand database (crowdsourced resale pricing)

## Community

- **GitHub Discussions** — Ask questions, share ideas, discuss features
- **GitHub Issues** — Report bugs, request features
- **Security Issues** — See [SECURITY.md](./SECURITY.md) for responsible disclosure

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| eBay API production approval | Build in sandbox first; ensure human review; apply early |
| AI misidentifies details | Always require user review before publish; easy editing |
| Cross-platform APIs unofficial (Poshmark, Mercari, Depop) | Start eBay-only; research ToS; community maintains integrations |
| Haiku 4.5 not accurate enough | Test early; offer Sonnet option; improve prompts |

## Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md) for detailed phase planning.

## License

MIT — See [LICENSE](./LICENSE) for details.

## Author

Built by the Tailor AI community. Start with Phase 1, build in the open, grow together.

---

**Join us on GitHub!** Star ⭐ if you find this useful, and open an issue if you have ideas.
