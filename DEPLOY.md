# Deploy the Odoo Quote Calculator (Free Forever)

This calculator is now a **pure static site** — no server, no database, no monthly bills.

## What you get

- Free hosting forever
- Public URL accessible from anywhere on the internet
- HTTPS included, no setup needed
- Auto-deploys when you update prices and push to GitHub
- Works offline once loaded

## One-time setup (~10 minutes)

### Step 1: Build the static site

```bash
npx vite build
```

This produces a `dist/public/` folder. That folder *is* your entire site — plain HTML, JS, CSS.

### Step 2: Push the project to GitHub

1. Go to https://github.com/new and create a new empty repository (private is fine)
2. From your computer, clone or download this project, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### Step 3: Connect to Cloudflare Pages

1. Sign up free at https://dash.cloudflare.com/sign-up (no credit card needed)
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Pick your GitHub repo
4. Use these build settings:
   - **Framework preset:** None
   - **Build command:** `npx vite build`
   - **Build output directory:** `dist/public`
   - **Root directory:** (leave blank)
5. Click **Save and Deploy**

In ~2 minutes you'll have a live URL like `odoo-calculator.pages.dev`.

### Step 4 (optional): Custom domain

If you want `quotes.yourcompany.com`, buy a domain (~$10/yr at Cloudflare or Namecheap), then in Cloudflare Pages → your project → **Custom domains** → add it. Cloudflare handles HTTPS automatically.

---

## Updating prices later

When Odoo or Catalyst updates pricing:

1. Edit `client/src/pages/Calculator.tsx` — the `PRICING`, `IMPLEMENTATIONS`, `ODOO_SH_PRICING`, and `CATALYST_APR_*` constants are all at the top of the file.
2. Commit and push:

```bash
git add .
git commit -m "Update prices"
git push
```

Cloudflare auto-rebuilds and deploys in ~30 seconds. Done.

---

## Local development (no internet needed)

```bash
npm install
npx vite
```

Opens at `http://localhost:5173`. Hot reload on save.

---

## Alternatives to Cloudflare Pages

All free tiers, all work the same way:

| Service | Notes |
|---|---|
| **Cloudflare Pages** | Recommended — unlimited bandwidth, fastest |
| **Netlify** | 100 GB/mo bandwidth on free tier |
| **Vercel** | 100 GB/mo bandwidth, slightly faster builds |
| **GitHub Pages** | Built into GitHub, simplest if your repo is public |

For any of them, the build command (`npx vite build`) and output folder (`dist/public`) are the same.
