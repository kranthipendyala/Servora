# SERVORA - Project Proposal & Pricing Document

**Prepared by:** Development Team
**Date:** March 28, 2026
**Version:** 1.0

---

## 1. PROJECT OVERVIEW

**Servora** is a full-stack **Home Services Business Directory & Booking Platform** that connects users with verified service providers across cities in India. The platform includes a responsive web application, admin panel, business owner dashboard, and a RESTful API backend.

**Live URL:** https://servora.vercel.app

---

## 2. PROJECT SCOPE & FEATURES

### 2.1 Public-Facing Website (22 Pages)

| Feature | Description |
|---------|-------------|
| Homepage | Featured businesses, popular cities, categories, search |
| Business Listings | Browse by city, category, locality with filters |
| Business Detail Page | Full profile with images, reviews, ratings, contact info, map |
| Search | Full-text search across businesses with advanced filters |
| Reviews & Ratings | Users can submit reviews with 1-5 star ratings |
| User Registration & Login | Secure authentication with role-based access |
| SEO Optimized | Dynamic meta tags, Open Graph, structured data (Schema.org) |
| Sitemap & Robots.txt | Auto-generated for search engine indexing |
| Breadcrumb Navigation | With schema markup for SEO |
| Responsive Design | Mobile-first, works on all devices |

### 2.2 Admin Panel (10 Modules)

| Module | Functionality |
|--------|---------------|
| Dashboard | Stats overview — businesses, users, reviews, categories, cities |
| Business Management | Create, edit, approve, verify, feature, delete businesses |
| Category Management | Create, edit, delete categories (hierarchical) |
| City Management | Create, edit cities with geolocation |
| Locality Management | Manage localities within cities |
| Review Moderation | Approve, reject, delete user reviews |
| User Management | Create, edit users with role assignment |
| SEO Management | Per-page meta title, description, OG tags, canonical URLs |
| Claims Management | Business ownership claim approvals |
| Settings | Global application settings |

### 2.3 Business Owner Dashboard

| Feature | Description |
|---------|-------------|
| My Business | View and edit business profile |
| Image Management | Upload/delete business images |
| Reviews | View customer reviews |
| Statistics | Business performance stats |

### 2.4 Backend API (60+ Endpoints)

| API Group | Endpoints |
|-----------|-----------|
| Authentication | Register, Login, Logout, Profile |
| Businesses | List, Detail, Search, CRUD |
| Categories | List, Detail, CRUD |
| Cities & Localities | List, Detail, CRUD |
| Reviews | List, Create, Approve, Delete |
| Users | List, Create, Update |
| SEO | Meta management, Sitemap generation |
| Dashboard | Owner stats, Business management |
| Admin | Full admin operations (32 endpoints) |

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2 | React framework with SSR/SSG |
| React | 18.3 | UI component library |
| TypeScript | 5.4 | Type-safe JavaScript |
| Tailwind CSS | 3.4 | Utility-first CSS framework |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| PHP | 8.1+ | Server-side language |
| CodeIgniter 3 | 3.x | MVC PHP framework |
| MySQL | 8.0 | Relational database |

### 3.3 Database (13 Tables)

| Table | Purpose |
|-------|---------|
| states | Geographic states |
| cities | Cities with geolocation |
| localities | Neighborhoods within cities |
| categories | Service categories (hierarchical) |
| businesses | Core business listings |
| business_categories | Business-category mapping |
| business_images | Business gallery images |
| users | User accounts (4 roles) |
| reviews | Customer reviews & ratings |
| business_claims | Ownership claims |
| seo_meta | Custom SEO overrides |
| pages | CMS pages |
| settings | App-wide settings |

---

## 4. AI TOOLS USED IN DEVELOPMENT

| AI Tool | Purpose | Usage |
|---------|---------|-------|
| Claude Code (Anthropic) | Primary AI development assistant | Architecture design, full-stack code generation, debugging, API development, database schema design |
| Claude Opus 4.6 | Advanced AI model | Complex problem solving, code review, optimization |

**AI-Assisted Development Areas:**
- Complete frontend UI/UX development
- Backend API architecture and implementation
- Database schema design and migrations
- SEO optimization and structured data implementation
- Admin panel development
- Authentication and authorization system
- Search functionality
- Deployment configuration
- CORS and security configuration
- Code review and optimization

---

## 5. DEVELOPMENT TIMELINE

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Planning & Architecture | 1 week | Tech stack selection, database design, API design |
| Database & Backend API | 2 weeks | MySQL schema, 60+ API endpoints, authentication |
| Frontend - Public Pages | 2 weeks | Homepage, listings, search, business detail, SEO |
| Admin Panel | 2 weeks | 10 admin modules with full CRUD |
| Business Owner Dashboard | 1 week | Owner portal with image management |
| Reviews & Ratings System | 1 week | Review submission, moderation, display |
| SEO & Performance | 1 week | Meta tags, schema markup, sitemap, optimization |
| Testing & Bug Fixes | 1 week | Cross-browser testing, API testing, bug fixes |
| Deployment & Configuration | 1 week | Server setup, domain, SSL, CI/CD |

**Total Estimated Duration: 12 Weeks (3 Months)**

---

## 6. HOSTING & INFRASTRUCTURE COSTS

### 6.1 Domain Registration

| Domain | Provider | Cost (Annual) |
|--------|----------|---------------|
| servora.in | Namecheap / GoDaddy | $5 - $8/year |
| servora.com | Namecheap / GoDaddy | $10 - $15/year |
| **Recommended:** .com + .in (both) | | **$15 - $23/year** |

### 6.2 Hosting Plans — Option A: Budget (Shared Hosting)

Best for: **Low to medium traffic (up to 50K visits/month)**

| Service | Provider | Monthly | Annual |
|---------|----------|---------|--------|
| Frontend Hosting | Vercel (Hobby Plan) | FREE | FREE |
| Backend API + MySQL | Hostinger (Business Plan) | $3.99/month | $47.88/year |
| SSL Certificate | Let's Encrypt (included) | FREE | FREE |
| Domain (.com) | Included 1st year with Hostinger | FREE (1st yr) | $12/year after |
| Email Hosting | Included with Hostinger | FREE | FREE |
| **TOTAL** | | **$3.99/month** | **$47.88/year** |

**Architecture:**
```
servora.com         → Vercel (Frontend)
api.servora.com     → Hostinger (PHP API + MySQL)
```

### 6.3 Hosting Plans — Option B: Professional (VPS/WHM)

Best for: **Medium to high traffic (50K-500K visits/month), full server control**

| Service | Provider | Monthly | Annual |
|---------|----------|---------|--------|
| Frontend Hosting | Vercel (Hobby Plan) | FREE | FREE |
| VPS Server (2 CPU, 4GB RAM, 80GB SSD) | Hostinger VPS | $7.99/month | $95.88/year |
| WHM/cPanel License | Included with Hostinger VPS | FREE | FREE |
| SSL Certificate | Let's Encrypt | FREE | FREE |
| Domain (.com) | Namecheap | $10/year | $10/year |
| Dedicated IP | Included with VPS | FREE | FREE |
| **TOTAL** | | **$7.99/month** | **$105.88/year** |

**Architecture:**
```
servora.com         → Vercel (Frontend)
api.servora.com     → VPS/WHM (PHP API)
MySQL Database            → VPS (localhost:3306 — fastest)
```

### 6.4 Hosting Plans — Option C: Premium (Dedicated Resources)

Best for: **High traffic (500K+ visits/month), enterprise clients**

| Service | Provider | Monthly | Annual |
|---------|----------|---------|--------|
| Frontend Hosting | Vercel (Pro Plan) | $20/month | $240/year |
| VPS Server (4 CPU, 8GB RAM, 200GB SSD) | DigitalOcean / Hostinger | $24/month | $288/year |
| Managed MySQL Database | DigitalOcean Managed DB | $15/month | $180/year |
| SSL Certificate | Let's Encrypt | FREE | FREE |
| Domain (.com + .in) | Namecheap | $1.50/month | $18/year |
| CDN | Cloudflare (Free) | FREE | FREE |
| Daily Backups | Included with providers | FREE | FREE |
| Uptime Monitoring | UptimeRobot (Free) | FREE | FREE |
| **TOTAL** | | **$60.50/month** | **$726/year** |

**Architecture:**
```
servora.com         → Vercel Pro (Frontend + CDN)
api.servora.com     → VPS (PHP API)
db.servora.com      → Managed MySQL (auto backups, scaling)
CDN                       → Cloudflare (global caching)
```

### 6.5 Hosting Comparison Summary

| Feature | Budget ($48/yr) | Professional ($106/yr) | Premium ($726/yr) |
|---------|-----------------|----------------------|-------------------|
| Monthly Traffic | Up to 50K | Up to 500K | Unlimited |
| Server Control | Shared (limited) | Full (WHM/root) | Full (WHM/root) |
| CPU / RAM | Shared | 2 CPU / 4GB | 4 CPU / 8GB |
| Storage | 100GB | 80GB SSD | 200GB SSD |
| Database | Shared MySQL | Dedicated MySQL | Managed MySQL |
| SSL | Free | Free | Free |
| Backups | Weekly | Daily | Daily + offsite |
| Email Hosting | Included | Included | Included |
| Uptime SLA | 99.9% | 99.9% | 99.99% |
| Support | Chat | Priority | Premium 24/7 |
| **Best For** | Startups | Growing business | Enterprise |

### 6.6 Annual Hosting Cost to Client

| Item | Budget | Professional | Premium |
|------|--------|-------------|---------|
| Hosting (1st Year) | $48 | $106 | $726 |
| Domain (.com) | $12 | $12 | $18 |
| Setup & Configuration | $200 | $300 | $500 |
| **Year 1 Total** | **$260** | **$418** | **$1,244** |
| **Year 2+ (Renewal)** | **$60/year** | **$118/year** | **$744/year** |

---

## 7. PROJECT PRICING

### 7.1 Development Cost Breakdown

| Component | Hours | Rate (USD) | Cost (USD) |
|-----------|-------|------------|------------|
| Project Planning & Architecture | 40 hrs | $50/hr | $2,000 |
| Database Design & Setup | 30 hrs | $50/hr | $1,500 |
| Backend API Development (60+ endpoints) | 120 hrs | $50/hr | $6,000 |
| Frontend - Public Pages (22 pages) | 100 hrs | $50/hr | $5,000 |
| Admin Panel (10 modules) | 80 hrs | $50/hr | $4,000 |
| Business Owner Dashboard | 40 hrs | $50/hr | $2,000 |
| SEO Implementation | 30 hrs | $50/hr | $1,500 |
| Authentication & Security | 25 hrs | $50/hr | $1,250 |
| Testing & QA | 35 hrs | $50/hr | $1,750 |
| Deployment & DevOps | 20 hrs | $50/hr | $1,000 |
| **TOTAL** | **520 hrs** | | **$26,000** |

### 7.2 Pricing Packages

#### Package A — Starter
| Item | Cost |
|------|------|
| Full Platform Development | $26,000 |
| Domain Registration (.com — 1 Year) | $12 |
| Hosting Setup — Budget (Shared, 1 Year) | $48 |
| Server Configuration & Deployment | $200 |
| SSL Certificate Setup | Included |
| 3 Months Bug Fix Support | Included |
| Documentation | Included |
| **Total** | **$26,260** |
| **Annual Renewal (Year 2+)** | **$60/year** |

#### Package B — Professional (Recommended)
| Item | Cost |
|------|------|
| Full Platform Development | $26,000 |
| Mobile App (React Native — iOS & Android) | $8,000 |
| Domain Registration (.com + .in — 1 Year) | $18 |
| Hosting Setup — VPS/WHM (1 Year) | $106 |
| Server Configuration & Deployment | $300 |
| SSL Certificate Setup | Included |
| CDN Setup (Cloudflare) | Included |
| 6 Months Support & Maintenance | $3,000 |
| SEO Audit & Optimization | $1,000 |
| **Total** | **$38,424** |
| **Annual Renewal (Year 2+)** | **$118/year** |

#### Package C — Enterprise
| Item | Cost |
|------|------|
| Full Platform Development | $26,000 |
| Mobile App (React Native — iOS & Android) | $8,000 |
| Domain Registration (.com + .in — 1 Year) | $18 |
| Hosting Setup — Premium VPS + Managed DB (1 Year) | $726 |
| Server Configuration & Deployment | $500 |
| SSL Certificate Setup | Included |
| CDN Setup (Cloudflare Pro) | Included |
| Uptime Monitoring & Alerts | Included |
| Daily Automated Backups | Included |
| 12 Months Support & Maintenance | $6,000 |
| SEO Audit & Optimization | $1,000 |
| Performance Optimization | $2,000 |
| Custom Integrations | $3,000 |
| **Total** | **$47,244** |
| **Annual Renewal (Year 2+)** | **$744/year** |

---

## 8. MAINTENANCE & SUPPORT (Post-Launch)

| Service | Monthly Cost |
|---------|-------------|
| Bug Fixes & Updates | $500/month |
| Feature Enhancements | $50/hr (as needed) |
| Server Monitoring | $200/month |
| Security Updates | Included in maintenance |
| Database Backups | Included in maintenance |

---

## 9. PROJECT STATISTICS

| Metric | Value |
|--------|-------|
| Total Pages/Routes | 22 |
| API Endpoints | 60+ |
| Reusable Components | 20 |
| Database Tables | 13 |
| Lines of Code (Core) | ~15,000-20,000 |
| Total Source Files | 82+ |

---

## 10. WHAT THE CLIENT GETS

1. **Complete Source Code** — Full ownership of frontend and backend code
2. **Database** — Complete schema with seed data
3. **Admin Panel** — Full control over content, users, and settings
4. **SEO Ready** — Structured data, meta tags, sitemap, robots.txt
5. **Responsive Design** — Works on desktop, tablet, and mobile
6. **Documentation** — API documentation and deployment guide
7. **Deployment Support** — Assistance with initial server setup
8. **Post-Launch Support** — Bug fixes for the agreed duration

---

## 11. PAYMENT TERMS

### Development Payment (Milestone-Based)

| Milestone | Percentage | Starter | Professional | Enterprise |
|-----------|------------|---------|-------------|------------|
| Project Kickoff | 30% | $7,878 | $11,527 | $14,173 |
| Backend API Complete | 20% | $5,252 | $7,685 | $9,449 |
| Frontend Complete | 25% | $6,565 | $9,606 | $11,811 |
| Admin Panel Complete | 15% | $3,939 | $5,764 | $7,087 |
| Final Delivery & Go-Live | 10% | $2,626 | $3,842 | $4,724 |
| **Total** | **100%** | **$26,260** | **$38,424** | **$47,244** |

### Recurring Annual Costs (Client Pays Directly)

| Item | Starter | Professional | Enterprise |
|------|---------|-------------|------------|
| Domain Renewal | $12/year | $18/year | $18/year |
| Hosting Renewal | $48/year | $100/year | $726/year |
| **Annual Total** | **$60/year** | **$118/year** | **$744/year** |

---

**Note:** All prices are in USD. Pricing may vary based on additional requirements, customizations, or scope changes. A detailed scope document will be prepared before project commencement.

---

*Document generated on March 28, 2026*
*Servora — Connecting You with Trusted Home Services*
