# 🌟 Printing Press Online Platform (V3)

Welcome to the **Printing Press Online Platform**, a massive enterprise-grade solution built with Next.js 15, Payload CMS 3.0, and PostgreSQL. This system seamlessly integrates a modern e-commerce storefront with a fully automated, internal prepress and production tracking engine.

---

## 🏛️ Architecture & Stack

### Tech Stack
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Headless CMS & Backend:** Payload CMS 3.0
- **Database:** PostgreSQL (with `@payloadcms/db-postgres`)
- **Styling:** TailwindCSS (Glassmorphism design, native animations)
- **Icons:** Lucide React
- **Typography:** Vazirmatn (Persian standard font)

### Core Modules
1. **Dynamic Pricing Engine:** Calculates complex printing costs in real-time based on sheet counts, layouts, dimensions, print methods (Offset/Digital), and finishing options (Gold foil, lamination, etc.).
2. **Production Kanban (State Machine):** A strict workflow state machine transitioning orders from `draft` -> `paid` -> `file_review` -> `proof_approved` -> `prepress` -> `printing` -> `finishing` -> `ready` -> `shipped`.
3. **Automated B2B/Credit System:** Allows corporate clients to purchase on credit, managed by an organizational wallet with multi-user access limits.
4. **Preflight File Checker:** Automatically analyzes uploaded files for DPI, color space (CMYK vs RGB), and bleed lines, enforcing printing quality standards before production.
5. **Customer Proofing (Sign-off):** Forces customers to digitally sign off on a prepress layout/mockup before moving the job to the offset zinc plates.
6. **Accounting & Invoicing:** Auto-generates standard PDF invoices upon payment completion.
7. **Automated Shipping:** Integrates with local couriers (Tipax, AloPeyk, Post) to issue tracking codes automatically when an order is packed.

---

## 📂 Directory Structure

```text
src/
├── app/                  # Next.js App Router (Frontend + Portals)
│   ├── (portal)/         # Authenticated User Dashboard
│   ├── products/         # Public Catalog & Configurator
│   └── api/              # API Routes (Payload Mount)
├── components/           # Reusable UI & Layout Components
│   ├── admin/            # Custom Payload Admin UI Overrides
│   ├── products/         # Configurator UI 
│   └── ui/               # Core Design System (Buttons, Modals)
├── payload/              # Payload CMS Configuration
│   ├── collections/      # DB Schema Definitions
│   │   ├── b2b/          # Corporate Organizations
│   │   ├── catalog/      # Paper Types, Finishing, Pricing Rules
│   │   ├── design/       # Design Studio Briefs
│   │   ├── orders/       # Order management, Invoices, Proofs
│   │   └── media/        # Uploaded Artworks
│   └── globals/          # Site Settings
├── modules/              # Pure Business Logic
│   ├── pricing/          # Offset vs Digital math engines
│   ├── preflight/        # File validation rules
│   └── workflow/         # Strict State Machine Logic
└── utils/                # Formatters, Helpers
```

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18.20+
- PostgreSQL Database
- S3 Compatible Storage (MinIO or AWS) for large print files

### 2. Environment Variables
Create a `.env` file in the root based on your setup:
```env
DATABASE_URI=postgres://user:pass@localhost:5432/chapkhane
PAYLOAD_SECRET=YOUR_SECRET_KEY
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=chapkhane
S3_REGION=us-east-1
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
npm start
```

### 4. Admin Access
Navigate to `/admin` to access the Payload CMS dashboard. You will be prompted to create the first admin user upon fresh database initialization.

---

## 🛡️ License & Ownership
Created and engineered in **2026** by Google Antigravity & Deepmind. All rights reserved for the target organization.
