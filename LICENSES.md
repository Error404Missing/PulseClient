# Asset license inventory

Checked: 17 November 2026. Public attribution lives in `licenses.html`; this file is the internal record of what is licensed, what is original, and what still needs a paper trail.

## Fonts

| File / family | Where it is used | License | Status |
|---|---|---|---|
| Plus Jakarta Sans | Site UI (`style.css`, legal pages) | SIL OFL 1.1 (Google Fonts) | OK — served from Google Fonts CDN |
| Space Grotesk | Headings | SIL OFL 1.1 | OK |
| JetBrains Mono | Code, metrics, badges | SIL OFL 1.1 | OK |
| Silkscreen | Pixel accents | SIL OFL 1.1 | OK |
| Syne | Display headings | SIL OFL 1.1 | OK |
| Outfit | Logs dashboard | SIL OFL 1.1 | OK |
| `fonts/ProductSans-Medium.ttf` | Desktop overlay GUI (`@font-face` `CorzGui`) | **Proprietary — Google Product Sans** | **Action: not redistributable.** Replace with Inter or Plus Jakarta Sans, or obtain a written license, before shipping the bundle publicly |
| Geist, Poppins, Caveat, minecraft, corzWave fonts inside `_next/static/media` and `PulseClient/` | Stale Next.js build output | Mixed (OFL / proprietary `minecraft`) | Not linked by the site; delete the folder to avoid distributing them |

OFL requires that the license text travel with any redistributed font file. Because the site loads fonts from Google's CDN, nothing is redistributed today — that changes the moment fonts are self-hosted, so add `fonts/OFL.txt` at the same time.

## Libraries

| Library | Location | License | Status |
|---|---|---|---|
| Supabase JS | jsDelivr `@2` | MIT | OK — pin the version and add SRI |
| skinview3d | `assets/js/skinview3d.bundle.js` | MIT | OK — keep the copyright notice |
| three.js | bundled inside skinview3d | MIT | OK |
| Fabric Loader / Fabric API | referenced by the client jar | Apache-2.0 | OK — keep NOTICE if redistributed |
| Tailwind CSS | `_next/`, `PulseClient/dist/_next/` | MIT | Stale build; safe to delete |

## Images and artwork

| Asset | Origin | Status |
|---|---|---|
| `logo.png`, `logo-original.jpg`, `pulse-logo.png` | Original PulseClient artwork | Owned |
| `icon-48.png`, `icon-96.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon.ico`, `pulse_cleaner.ico` | Generated from the logo / original | Owned |
| `og-cover.png` | Generated for social cards (PIL script, Product Sans text rasterised — raster is fine, font file is not redistributed) | Owned |
| `error404missing.png`, `error404missing.webp` | Original illustration | Owned |
| `mogged.png`, `vpn-block-preview.png` | Original illustrations | Owned |
| `images/bots/*.png` (14 files) | Original pixel art for the community bots | Owned |
| `assets/skins/*.png`, `assets/avatars/*.png` | Minecraft skins/avatars of the team | Owned by the depicted players; display only |
| `evila.mp3` | Staff dashboard alert sound | **Unknown provenance — replace with a licensed clip or record the source and license** |

## Actions before the next public release

1. Replace `fonts/ProductSans-Medium.ttf` (proprietary) or document a license for it.
2. Add a licensed replacement for `evila.mp3`, or remove it from the deploy.
3. Delete stale `_next/`, `PulseClient/` and `dist/_next/` trees from the served output.
4. Add `fonts/OFL.txt` (SIL OFL 1.1 text) if fonts are ever self-hosted.
5. Keep `licenses.html` in sync whenever a new asset or library is added.
