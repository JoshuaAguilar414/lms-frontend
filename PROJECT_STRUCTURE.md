# VECTRA LMS Dashboard - Project Structure

Scalable, component-based Next.js dashboard modeled after the VECTRA INTERNATIONAL design.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Custom inline SVGs (no external icon library)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Dashboard page
│   └── globals.css         # Global styles & theme
│
├── components/
│   ├── layout/             # Layout shell components
│   │   ├── Header/
│   │   │   ├── Header.tsx      # Header wrapper
│   │   │   ├── TopBar.tsx      # "Enabling Positive Impact" bar
│   │   │   ├── MainNav.tsx     # Main navigation with logo, links, search
│   │   │   ├── SearchBar.tsx   # Search input
│   │   │   └── index.ts
│   │   ├── Footer/
│   │   │   ├── Footer.tsx          # Footer wrapper
│   │   │   ├── FooterCompany.tsx   # Logo, address, contact
│   │   │   ├── FooterLinks.tsx     # Services, Shop, Company links
│   │   │   ├── FooterNewsletter.tsx # Region, newsletter, social
│   │   │   ├── FooterBottom.tsx    # Copyright, pledges, legal
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── MyTrainingsCard.tsx   # Training list card
│   │   ├── OtherProductsCard.tsx # Explore shop card
│   │   ├── TrainingItem.tsx      # Single training row
│   │   └── index.ts
│   │
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx      # Button with variants
│   │   ├── Card.tsx        # Card & CardHeader
│   │   └── index.ts
│   │
│   └── icons/              # Shared icon components
│       └── index.tsx
│
├── lib/
│   └── constants.ts        # Company info, footer links, social
│
└── types/
    └── index.ts            # TypeScript interfaces
```

## Component Hierarchy

```
Page (Dashboard)
├── Header
│   ├── TopBar
│   └── MainNav
│       └── SearchBar
├── Main Content
│   ├── MyTrainingsCard
│   │   └── TrainingItem (×N)
│   └── OtherProductsCard
└── Footer
    ├── FooterCompany
    ├── FooterLinks
    ├── FooterNewsletter
    └── FooterBottom
```

## Design Tokens

- **Green:** `#54bd01` - Primary actions, buttons, accents, links
- **Navy:** `#00263d` - Headers, primary UI elements, important text
- **Charcoal Grey:** `#2d3142` - Secondary text, borders, subtle elements
- **Gray:** `gray-100` - Background, `gray-900` - Footer

## Scalability Notes

1. **Component isolation** – Each component has a single responsibility
2. **Composition** – Use `Card`, `CardHeader`, `Button` for consistency
3. **Constants** – Edit `lib/constants.ts` for content changes
4. **Types** – Extend `types/index.ts` for new data structures
5. **Add pages** – Create new routes under `app/` and reuse layout components

## Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.
