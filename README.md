# DHIS2 Climate Dashboard

A DHIS2 web application that visualizes the relationship between climate variables and malaria indicators. Built on the [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Overview

The dashboard provides three main views:

| Page                             | Route                           | Description                                                                                                                             |
| -------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Malaria Situation**    | `/current-malaria-situation`    | Key malaria indicators — confirmed cases, deaths, outcomes, fever totals — displayed as single-value cards, charts, and a map           |
| **Climate–Malaria Relationship** | `/climate-malaria-relationship` | Side-by-side maps and bar/line combo charts showing how temperature, precipitation, and humidity correlate with confirmed malaria cases |
| **CHAP Forecast & Alerts**       | `/chap-forecast-alerts`         | Malaria forecast and alert visualizations (in development)                                                                              |

A compact filter bar at the top of every page lets users scope all visualizations by **org unit** and **period**.

## Prerequisites

- Node.js ≥ 18
- [pnpm](https://pnpm.io/) (version pinned in `package.json`)
- Access to a DHIS2 instance (v2.38+) with the target analytics data

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd dhis2-climate-dashboard
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your DHIS2 instance URL:

```env
DHIS2_PROXY_URL=https://play.dhis2.org/dev
```

### 3. Start the dev server

```bash
pnpm dev        # with DHIS2 proxy (requires .env)
pnpm start      # without proxy
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
pnpm dev        # Start dev server with DHIS2 proxy (requires .env)
pnpm start      # Start dev server without proxy
pnpm build      # Production build — outputs to build/
pnpm test       # Run tests (Jest)
pnpm lint       # ESLint + Prettier check
pnpm format     # Auto-format with Prettier
pnpm deploy     # Deploy to a DHIS2 instance
```

To run a single test file:

```bash
pnpm test -- src/App.test.tsx
```

To deploy, run `pnpm build` first, then `pnpm deploy`. The command will prompt for the target server URL and DHIS2 credentials.

## Tech Stack

| Layer                | Library                                                     |
| -------------------- | ----------------------------------------------------------- |
| Framework            | React 18 + TypeScript (strict)                              |
| DHIS2 platform       | `@dhis2/app-runtime`, `@dhis2/ui`, `@dhis2/cli-app-scripts` |
| Analytics / maps     | `@hisptz/dhis2-analytics` (charts, pivot tables, maps)      |
| Charts (custom)      | Highcharts + `highcharts-react-official`                    |
| Routing              | TanStack Router (file-based)                                |
| Data fetching        | TanStack Query                                              |
| Schema validation    | Zod                                                         |
| Styling              | Tailwind CSS v4                                             |
| Internationalisation | `@dhis2/d2-i18n`                                            |

## Project Structure

```
src/
├── modules/                        # One folder per page/feature
│   ├── __root.tsx                  # Root layout (tabs + filter bar)
│   ├── index.tsx                   # Default route redirect
│   ├── current-malaria-situation/
│   │   ├── constants/              # Visualization IDs
│   │   └── index.tsx               # Page component
│   ├── climate-malaria-relationship/
│   │   ├── constants/              # Map and chart IDs
│   │   └── index.tsx               # Page component
│   └── chap-forecast-alerts/
│       └── index.tsx               # Page component (in development)
└── shared/
    ├── components/
    │   ├── visualizations/         # ChartVisualizer, MapVisualizer, TableVisualizer, etc.
    │   ├── AppTabs.tsx
    │   └── FilterBarCompact.tsx
    ├── constants/                  # App-wide constants
    ├── hooks/                      # Reusable hooks (data fetching, filter state)
    ├── schemas/                    # Zod schemas + inferred TypeScript types
    └── utils/                      # Visualization helpers (layout, series colours, etc.)
```

## License

BSD-3-Clause
