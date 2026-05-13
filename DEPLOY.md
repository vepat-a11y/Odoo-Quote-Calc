# Deploy the Odoo Quote Calculator to GitHub Pages

This calculator is a **pure static site** — no server, no database, no monthly bills. GitHub Pages hosts it free forever.

## One-time setup (~5 minutes)

### Step 1: Push this project to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Turn on GitHub Pages

1. Go to your repo on github.com
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Done — no other settings needed

### Step 3: Trigger the first deploy

The workflow at `.github/workflows/deploy.yml` runs automatically on every push to `main`. To kick off the first one:

```bash
git add .
git commit -m "Enable GitHub Pages deploy"
git push
```

Watch progress under the **Actions** tab on GitHub. After ~2 minutes your site is live at:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

The exact URL appears at **Settings → Pages** once the first deploy finishes.

---

## Updating prices later

When Odoo or Catalyst updates pricing:

1. Edit `client/src/pages/Calculator.tsx` — the `PRICING`, `IMPLEMENTATIONS`, `ODOO_SH_PRICING`, and `CATALYST_APR_*` constants are all near the top.
2. Commit and push:

```bash
git add .
git commit -m "Update prices"
git push
```

GitHub Actions auto-rebuilds and redeploys in ~1 minute.

---

## Local development

```bash
npm install
npx vite
```

Opens at `http://localhost:5173` with hot reload. The `base` path stays `/` locally because the GitHub Action only sets `VITE_BASE_PATH` during the deploy build.

---

## Optional: Custom domain

If you want `quotes.yourcompany.com` instead of `github.io`:

1. Buy a domain (~$10/yr at Cloudflare or Namecheap)
2. In your repo: **Settings → Pages → Custom domain** → enter your domain
3. At your domain registrar, add a CNAME record pointing to `YOUR-USERNAME.github.io`
4. GitHub auto-provisions HTTPS

When using a custom domain at the root (e.g. `quotes.yourcompany.com`), edit `.github/workflows/deploy.yml` and remove the `VITE_BASE_PATH` env var (or set it to `/`), since the site will live at the domain root rather than under `/repo-name/`.
