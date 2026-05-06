# Tailor AI Roadmap

## Phase 1: Foundation — eBay MVP (Current)

**Goal:** Build a complete eBay listing workflow from photo upload to publish.

**Timeline:** 2-3 months

### Core Features

- [x] Project scaffolding (Expo + Fastify monorepo)
- [ ] Expo web gallery upload (up to 6 clothing photos)
- [ ] eBay OAuth 2.0 integration (sandbox & production)
- [ ] Claude Vision pipeline for clothing analysis
- [ ] Structured output: brand, size, color, material, condition, style
- [ ] eBay Taxonomy API integration (category mapping)
- [ ] eBay Browse API (pricing suggestions)
- [ ] Measurements prompt (item-type specific)
- [ ] Draft review & editing screen
- [ ] Image upload via eBay Media API
- [ ] Publish to eBay (inventory → offer → publish)
- [ ] Listing history & tracking

### Technical Milestones

1. **Week 1-2:** Monorepo setup, Fastify scaffold, Expo web
2. **Week 3-4:** eBay OAuth, photo upload UI
3. **Week 5-6:** Claude Vision pipeline, structured output
4. **Week 7-8:** eBay API integration (taxonomy, pricing)
5. **Week 9-10:** Review screen, publish workflow
6. **Week 11-12:** Testing, bug fixes, documentation

### Testing & Validation

- Test on eBay sandbox with real items
- Validate AI accuracy on 20+ real clothing items
- User testing with 3-5 beta testers
- Documentation & setup guide

---

## Phase 2: Polish & Monetization (Months 4-6)

**Goal:** Improve MVP, add core features, launch monetized tier.

### Features

- [ ] Background removal / photo enhancement for flat lays
- [ ] Seller policies (shipping, returns) saved templates
- [ ] Draft saving (come back and publish later)
- [ ] Listing templates for repeat item types
- [ ] Bulk upload mode (multiple items at once)
- [ ] Brand value database (crowdsourced pricing intel)
- [ ] User authentication & accounts
- [ ] Stripe integration for Pro tier
- [ ] Free tier limit enforcement (15 listings/month)
- [ ] Analytics dashboard (basic version)

### Monetization Launch

```
Free: 15 listings/month, eBay only, Haiku 4.5
Pro: $12-15/month, unlimited listings, eBay only, Sonnet option
```

### Technical Work

- Supabase PostgreSQL setup (users, listings, policies)
- Redis for caching & rate limiting
- Stripe webhooks
- Session/JWT auth
- Email notifications

---

## Phase 3: Cross-Platform & Native iOS (Months 7-12)

**Goal:** Enable listing on multiple marketplaces from one photo set. Ship iOS app.

### Marketplace Integrations

- [ ] **Poshmark** — Browser automation (Playwright), platform-specific descriptions
- [ ] **Mercari** — Browser automation, API or web scraping
- [ ] **Depop** — Browser automation, API if available
- [ ] Unified listing manager (view all listings across platforms)
- [ ] Auto-delist when item sells on one platform

### iOS Native App

- [ ] Guided camera capture flow (walk through each shot)
- [ ] Image processing & preview
- [ ] Same backend, Expo codebase native build
- [ ] Offline draft saving (syncs when online)

### Features

- [ ] Platform-specific description/title generation
- [ ] Multi-platform pricing optimization
- [ ] Listing templates per platform (different requirements)
- [ ] Advanced condition grading with visual guide
- [ ] Measurement library (save common measurements)

### Technical Work

- Playwright for browser automation on Poshmark/Mercari/Depop
- Rate limiting & session management for automation
- Platform-specific API clients
- Image processing improvements
- Native iOS build from Expo

---

## Phase 4: Community & Growth (Month 13+)

**Goal:** Build ecosystem, enable power users, grow community.

### Community Features

- [ ] Community-contributed AI prompt packs (vintage, streetwear, designer, kids, athletic)
- [ ] Crowdsourced brand resale value database
- [ ] Visual condition grading guide (photos from community)
- [ ] Best practices guides per niche
- [ ] Discussion forum for sellers

### Power User Features

- [ ] Analytics dashboard (sell-through rate, avg price by brand, best platforms)
- [ ] Price optimization / repricing across platforms
- [ ] Bundle suggestions ("these 3 items would sell well as a lot")
- [ ] Inventory management (quantity tracking)
- [ ] Multi-user / team support

### Business Tier

```
Business: $25-30/month
├─ Everything in Pro
├─ Analytics dashboard
├─ Team/multi-closet support
├─ API access
└─ Priority support
```

### Technical Work

- Advanced analytics & reporting
- API for developers (self-hosters)
- Multi-user / workspace management
- Machine learning for pricing optimization
- Warehouse setup (for power sellers managing inventory)

---

## Long-Term Vision (Year 2+)

### Potential Expansions

- **Depop Integration** — Officially supported API when available
- **Facebook Marketplace** — Via Commerce Manager API
- **Etsy** — For vintage & handmade items
- **ThredUP, Vinted, Vestiaire Collective** — Consignment platforms
- **Shopify Integration** — For sellers with their own stores

### Sustainability

- Open source community maintaining marketplace integrations
- Ecosystem of contributor-built features
- Brand database maintained by community resellers
- API program for developers building extensions
- Sponsorships from AI/infrastructure partners

---

## Success Metrics

### Phase 1
- ✅ First eBay listing published via Tailor AI
- ✅ 5+ beta users testing the MVP
- ✅ Claude Vision accuracy >90% on clothing photo analysis
- ✅ Documentation & setup guide for developers

### Phase 2
- 📊 100+ active free users
- 💰 10+ Pro tier subscriptions
- 📝 50+ AI-powered listings published
- 🔄 Retention >70% month-over-month

### Phase 3
- 📊 500+ active users
- 🛒 Poshmark + Mercari support live
- 📱 iOS app launched
- 💰 50+ Pro subscriptions

### Phase 4
- 📊 1000+ active users
- 📊 Business tier with 5+ customers
- 🌍 Multi-country support (UK, Canada, Australia eBay)
- 💬 Active community ecosystem

---

## How to Help

### Phase 1 (Now)
- Test the MVP and provide feedback
- Refine clothing analysis prompts
- Help with eBay API integration
- Write documentation

### Phase 2
- Contribute brand resale data
- Test and improve UI/UX
- Help with Stripe integration
- Community support in discussions

### Phase 3
- Research Poshmark/Mercari/Depop APIs
- Test browser automation approaches
- iOS feedback and testing
- Platform-specific prompt refinement

### Phase 4
- Maintain community integrations
- Contribute to brand database
- Build community features
- Help with API documentation

---

**This roadmap is a living document.** Community feedback, market needs, and technical discoveries may shift priorities. Let's build this together! 🚀
