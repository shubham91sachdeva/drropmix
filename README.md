# Drrop Mix website (static, GitHub Pages)

Plain HTML/CSS/JS. No build step. `build.py` (in the source bundle) only regenerates the HTML; you can also edit the HTML directly.

## Publish on GitHub Pages with drropmix.com
1. Create a **public** repo (e.g. `drropmix-site`) and upload everything in this folder (including `CNAME` and `.nojekyll`).
2. Repo > Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Custom domain: `drropmix.com`. Tick "Enforce HTTPS" once it becomes available (can take up to ~24h).
3. At your domain registrar's DNS, remove the old Shopify records, then add:
   - A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME `www` -> `<your-github-username>.github.io`
4. Check GitHub's current docs before changing DNS: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## Things to edit
- WhatsApp number, email, promised reply time, optional form endpoint: top of `js/main.js` (`CONFIG`). Reply-time text also appears in `business.html` (`#reply-time`).
- Prices: `PRODUCTS` array in `js/main.js`.
- Recipes: `RECIPES` array in `js/main.js`.
- Founder photos: replace the `.ph` placeholders in `about.html`.
- Venue/event logos: in `business.html`, add logos and remove the `hidden` attribute from `<div class="proof">`.
- Tracking links: add `?utm_source=instagram&utm_medium=bio` etc. to any link you share; the source is added to WhatsApp messages.
