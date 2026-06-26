# Epic Mayan Tours — PWA 3.0 Desktop Edition

> Belize's premier Maya ruins and jungle adventure tour website.  
> Built as a fully installable, offline-capable Progressive Web App.  
> Deployed on Cloudflare Pages via GitHub.

---

## Project Structure

```
EpicMayanTours/
│
├── index.html          Main page (Hero · Tours · Gallery · Contact)
├── style.css           All styles — Desktop-only, no RWD
├── app.js              SW registration · Install prompt · Animations
│
├── manifest.json       PWA manifest — install metadata & icons
├── sw.js               Service Worker — offline cache & update logic
├── offline.html        Offline fallback page
│
├── _headers            Cloudflare Pages cache & security headers
│
├── images/
│   ├── hero.jpg        Hero parallax background (1920×1080 recommended)
│   ├── sunset.jpg      Parallax divider background (1920×800 recommended)
│   ├── altun-ha.jpg    Tour card + gallery (800×600 recommended)
│   ├── lamanai.jpg
│   ├── snorkeling.jpg
│   ├── cave.jpg
│   ├── jungle.jpg
│   └── city.jpg
│
├── icons/
│   ├── icon-192.png    PWA icon — standard (192×192)
│   ├── icon-512.png    PWA icon — large (512×512)
│   └── maskable-512.png  PWA icon — maskable with safe zone (512×512)
│
└── assets/
    ├── lightbox.css    Lightbox2 v2.11.4 stylesheet
    └── lightbox.js     Lightbox2 v2.11.4 script
```

---

## Prerequisites

| Item | Requirement |
|---|---|
| GitHub account | Free tier is sufficient |
| Cloudflare account | Free tier is sufficient |
| Lightbox2 files | Download from https://lokeshdhakar.com/projects/lightbox2/ |
| Images | Place your own photos in `/images/` and `/icons/` |
| Node.js | Not required — no build step |

---

## Step 1 — Download Lightbox2

1. Go to https://lokeshdhakar.com/projects/lightbox2/
2. Download version **2.11.4**
3. Copy these two files into your project:
   - `dist/css/lightbox.css` → `/assets/lightbox.css`
   - `dist/js/lightbox.min.js` → `/assets/lightbox.js`

> Lightbox2 also requires its own arrow and close icons (inside `dist/images/`).  
> Copy that `images/` folder into `/assets/images/` and verify the paths inside `lightbox.css` point to `images/` (they do by default).

---

## Step 2 — Prepare Your Images

### Required images

| File | Recommended size | Notes |
|---|---|---|
| `images/hero.jpg` | 1920 × 1080 px | Hero parallax — use a dramatic Maya ruin shot |
| `images/sunset.jpg` | 1920 × 800 px | Parallax divider — warm sunset tones |
| `images/altun-ha.jpg` | 800 × 600 px | Tour card + gallery |
| `images/lamanai.jpg` | 800 × 600 px | Tour card + gallery |
| `images/snorkeling.jpg` | 800 × 600 px | Gallery only |
| `images/cave.jpg` | 800 × 600 px | Tour card + gallery |
| `images/jungle.jpg` | 800 × 600 px | Gallery only |
| `images/city.jpg` | 800 × 600 px | Gallery only |

### Required icons

| File | Size | Notes |
|---|---|---|
| `icons/icon-192.png` | 192 × 192 px | Transparent background OK |
| `icons/icon-512.png` | 512 × 512 px | Transparent background OK |
| `icons/maskable-512.png` | 512 × 512 px | Logo must fit within centre 80% (safe zone) |

> **Tip:** Use https://maskable.app to preview and verify your maskable icon safe zone before deploying.

---

## Step 3 — Update WhatsApp Number

Open `index.html` and find this line:

```html
<a href="https://wa.me/5016000000" ...>
```

Replace `5016000000` with your actual WhatsApp number in international format (no `+`, no spaces):

```html
<a href="https://wa.me/50112345678" ...>
```

---

## Step 4 — Add Your QR Code (Optional)

Inside `index.html`, find the QR placeholder comment:

```html
<!-- Replace with: <img src="/images/qr-whatsapp.png" alt="WhatsApp QR Code"> -->
```

1. Generate a WhatsApp QR code at https://wa.me/qr (or any QR generator)
2. Save it as `images/qr-whatsapp.png`
3. Replace the comment with:

```html
<img src="/images/qr-whatsapp.png" alt="WhatsApp QR Code" width="140" height="140">
```

---

## Step 5 — Push to GitHub

```bash
# If starting fresh
git init
git add .
git commit -m "Initial commit — Epic Mayan Tours PWA 3.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/epic-mayan-tours.git
git push -u origin main

# For subsequent updates
git add .
git commit -m "Update: describe your change here"
git push
```

---

## Step 6 — Deploy on Cloudflare Pages

1. Log in to https://dash.cloudflare.com
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your GitHub repository (`epic-mayan-tours`)
4. Configure build settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | *(leave empty — no build step)* |
| Build output directory | `/` (root) |

5. Click **Save and Deploy**
6. Cloudflare assigns a URL: `https://epic-mayan-tours.pages.dev`
7. (Optional) Add a custom domain under **Custom Domains**

> Cloudflare Pages automatically enables **HTTPS**, **Brotli compression**, and **HTTP/2** — no additional configuration required.

---

## Step 7 — Verify PWA Installation

After deployment, open your site in Chrome on Desktop:

1. Open **DevTools** → **Application** tab
2. Check **Manifest** — all fields should show green ✅
3. Check **Service Workers** — status should be `activated and running`
4. Check **Storage** → **Cache Storage** → `CACHE_V1` — all assets listed
5. Look for the **install icon** (⊕) in the Chrome address bar
6. Click it → **Install Epic Mayan Tours**

### Run Lighthouse audit

1. DevTools → **Lighthouse** tab
2. Select: **Desktop** · **Navigation**
3. Check all categories: Performance · Accessibility · Best Practices · SEO · PWA
4. Target scores:

| Category | Target |
|---|---|
| Performance | 95 – 100 |
| Accessibility | 95 – 100 |
| Best Practices | 100 |
| SEO | 100 |
| PWA | Installable + Offline |

---

## Updating the Site

### Content changes (text, images)

```bash
# Edit files locally, then:
git add .
git commit -m "Update: new hero image"
git push
# Cloudflare Pages redeploys automatically within ~30 seconds
```

### CSS or JS changes

Because `style.css` and `app.js` are cached with `immutable`, append a version query string in `index.html` when you update them:

```html
<!-- Before -->
<link rel="stylesheet" href="/style.css">

<!-- After update -->
<link rel="stylesheet" href="/style.css?v=2">
```

### Cache version bump (forces all users to re-download)

Open `sw.js` and change:

```js
const CACHE_VERSION = 'CACHE_V1';
// change to:
const CACHE_VERSION = 'CACHE_V2';
```

Users will see the **"New content available — Refresh"** toast on their next visit.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Install button not appearing | Check DevTools → Application → Manifest for errors. Ensure HTTPS is active. |
| SW not registering | Open DevTools → Console. Check for path errors. Confirm `sw.js` is at root `/`. |
| Images not showing offline | Confirm image filenames exactly match the `PRECACHE_ASSETS` list in `sw.js`. |
| Lightbox not opening | Confirm `/assets/lightbox.js` and `/assets/lightbox.css` are present. Check Console for 404 errors. |
| Fonts not loading offline | Google Fonts load from CDN — they require an internet connection. This is expected behaviour. |
| Old content showing after update | Bump `CACHE_VERSION` in `sw.js` and push. Users get the update toast on next visit. |

---

## Technology Stack

| Layer | Technology |
|---|---|
| HTML | Semantic HTML5 |
| CSS | Vanilla CSS3 — CSS custom properties, Grid, Flexbox |
| JavaScript | Vanilla ES2020 — no frameworks, no build step |
| PWA | Web App Manifest + Service Worker (Cache API) |
| Gallery | Lightbox2 v2.11.4 |
| Fonts | Google Fonts — Cinzel + Lato |
| Hosting | Cloudflare Pages (free tier) |
| Version control | GitHub |

---

## License

© 2025 Epic Mayan Tours · Belize · All rights reserved.
