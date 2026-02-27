# Matt Walsh CXO — Personal Website

A production static website for Matt Walsh, Fractional Chief Experience Officer and founder of Green Stone.

## Site Structure

```
/
├── index.html          ← Homepage (hero, methods, clients, stats, CTA)
├── work.html           ← Past Projects (project cards across 3 career eras)
├── recognition.html    ← Recognition (testimonials, awards table, press/articles)
├── contact.html        ← Contact (split layout with form + info)
├── css/
│   └── styles.css      ← Shared stylesheet
├── js/
│   └── main.js         ← Shared JS (parallax engine, interactions, form handler)
└── README.md
```

## Features

- **Parallax effects** — Floating depth orbs, heading drift, hero zoom, staggered reveals, and kicker line-draw animations. All GPU-accelerated via `translate3d` and `requestAnimationFrame`. Automatically disabled on mobile for performance.
- **Responsive** — Breakpoints at 960px and 580px with mobile hamburger nav.
- **Contact form** — Submits via Google Apps Script to email + HubSpot BCC, with Google Sheets logging.
- **Interactive elements** — Client list filtering (B2C/B2B), expandable testimonials, awards, and articles sections.

## Hosting

This site is hosted on **GitHub Pages** with a custom domain via GoDaddy DNS.

### Deployment

Every push to `main` auto-deploys. No build step required — the site is plain HTML/CSS/JS.

### DNS Configuration (GoDaddy)

**A Records** (apex domain):
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME Record** (www):
```
www → [github-username].github.io
```

HTTPS is provided free by GitHub Pages. Enable it under repo Settings → Pages → Enforce HTTPS.

## Contact Form Setup

The contact form on `contact.html` posts to a Google Apps Script web app which sends an email to matt.walsh@greenstone.co and BCCs HubSpot for CRM tracking. Submissions are also logged to a Google Sheet.

### Setup Steps

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Paste the contents of the Apps Script (provided separately, not in this repo)
3. Replace `YOUR_SHEET_ID` in the script with your Google Sheet ID
4. **Deploy → New Deployment** → Web app → Execute as: Me → Access: Anyone
5. Copy the deployed URL
6. In `js/main.js`, replace `YOUR_APPS_SCRIPT_URL` with that URL

### Google Sheet

Create a blank Google Sheet for submission logging. The script appends rows with columns: **Timestamp | Name | Email | Company | Message**. The Sheet ID is the long string in the URL between `/d/` and `/edit`.

## Fonts

- **Familjen Grotesk** — Headings, kickers, nav, buttons
- **Outfit** — Body text, descriptions, form fields

Both loaded via Google Fonts.

## Design Tokens

| Token     | Value                    | Usage                  |
|-----------|--------------------------|------------------------|
| `--bg`    | `#F2EDE3`                | Page background        |
| `--bg2`   | `#E8E0D2`                | Section backgrounds    |
| `--ink`   | `#141C1A`                | Primary text           |
| `--teal`  | `#1A6B62`                | Primary accent         |
| `--teal2` | `#2E9485`                | Secondary accent/hover |
| `--gold`  | `#C4883A`                | Award badge accent     |
| `--muted` | `#7A8480`                | Secondary text         |

## Images

Project card images and the homepage hero photo are placeholders. Replace the placeholder `<div>` elements with `<img>` tags pointing to your actual image files. Recommended: add an `images/` folder to the repo.

## License

© 2026 Matt Walsh. All rights reserved. Client work shown with permission and remains the property of its respective owners.
