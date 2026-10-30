# InfraDash

Infrastructure dashboard demo built with Next.js (App Router), Tailwind CSS and the
shadcn/ui `dashboard-01` block.

Live: https://majitap.github.io/infradash/

> **All data is fake.** Every page reads from `lib/mock-data.ts` only.
> There are no API calls and no tokens anywhere in this project.

## Pages

| Route       | Content                                                              |
| ----------- | -------------------------------------------------------------------- |
| `/`         | Overview: KPI cards, pipeline area chart, joiners/leavers bar chart  |
| `/users`    | User table with All / Joiners / Leavers tabs and search              |
| `/runners`  | Runner list (online / offline / paused); restart = confirm + toast   |
| `/upgrade`  | Current → target version upgrade path with per-step checklists       |

All pages share one layout (`SidebarProvider` + `AppSidebar` + `SiteHeader`) in
`app/layout.tsx`. Sidebar items are defined in `lib/nav.ts`.

## Development

```bash
npm install
npm run dev
```

Because of `basePath`, the dev server serves the app at http://localhost:3000/infradash/.

## Build and deploy

`next.config.ts` uses `output: "export"`, `basePath: "/infradash"`,
`trailingSlash: true` and `images.unoptimized: true`.

```bash
npm run build   # static site in ./out
```

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and
deploys `./out` to GitHub Pages (Settings > Pages > Source: GitHub Actions).
