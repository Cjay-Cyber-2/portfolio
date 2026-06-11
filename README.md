# NEURAL VOID — Portfolio of Joseph Chijioke Emmanuel (Cjay-Cyber)

A brutalist-futurist, AI-native portfolio. Void black × acid chartreuse, live 3D neural
network, scramble typography, magnetic interactions — zero build step, pure
HTML/CSS/JS + Three.js from CDN.

## Run it

Any static server works. A zero-dependency one is included:

```powershell
node serve.js
```

Then open http://localhost:5517. (Or use `npx serve .` / `python -m http.server` if you prefer.)

> Opening `index.html` directly by double-clicking mostly works too, but a local
> server guarantees fonts + the 3D scene load correctly.

## Deploy (free)

- **GitHub Pages**: push this repo, then Settings → Pages → deploy from `main`.
- **Vercel / Netlify**: import the repo, framework = "Other", no build command, output dir = root.

## Customize — your 10-minute checklist

Everything you must personalize is marked with `▼ REPLACE` / `▼ EDIT` comments in `index.html`.

1. **Your photo** — drop an image at `assets/me.jpg`, then in the About section delete the
   `.photo-placeholder` div and un-comment the `<img>` line.
2. **Project cards** (`#work`) — 4 template cards. For each: title, description, tags,
   link URL, and swap the `.thumb-placeholder` div for
   `<img src="assets/project-1.jpg" alt="..." />`. Duplicate a card to add more.
3. **Stats** (`#about`) — edit the `data-count` numbers and labels.
4. **Journey** (`#journey`) — replace the timeline entries with your real roles/education.
5. **Socials** (`#contact`) — fill in your LinkedIn / X / resume URLs.
6. **Footer coordinates** — put your city in `.footer__coords`.
7. **Bio text** (`#about`) — make the story yours.
8. **Hero roles** — the rotating scramble titles live in `script.js` → `roles` array.

## Theme tokens

All colors/fonts are CSS variables at the top of `styles.css`:

| Token | Value | Role |
|---|---|---|
| `--void` | `#050507` | background |
| `--bone` | `#f2f0ea` | text |
| `--acid` | `#c6ff00` | the signature accent |
| `--font-display` | Clash Display | headlines |
| `--font-body` | General Sans | paragraphs |
| `--font-mono` | JetBrains Mono | labels/code |

Change `--acid` to re-skin the entire site in one line.

## Notes

- The 3D scene auto-disables for `prefers-reduced-motion` users and degrades
  gracefully if the Three.js CDN is unreachable — the site never breaks.
- Custom cursor only appears on devices with a fine pointer (desktop).
- Fully responsive down to small phones.
