# Third-party audit — pulseclient.xyz

Audited: 17 November 2026. Scope: `index.html`, `logs.html`, `api_current.html`, `app.js`, `logs.js`, `assets/js/skinview3d.bundle.js`, all CSS, plus the deployed `dist/` tree. Method: grep for every external host, script tag and `fetch` target, then manual review of each hit.

## Summary

- **No advertising, analytics or session-replay SDK is present.** No gtag, GTM, Meta pixel, PostHog, Clarity, Hotjar, Sentry, Mixpanel or Amplitude.
- 8 third-party services are actually contacted by the public site; 3 more only by the staff dashboard / anti-abuse flow.
- Main compliance gaps: Google Fonts loads before any consent, five different IP-intelligence providers are queried from the browser, and the Supabase SDK is loaded from a floating major version without SRI.

## Services contacted by the public site

| Service | Where | Data exposed | Storage | Consent | Risk |
|---|---|---|---|---|---|
| Cloudflare | Hosting, CDN, DNS, bot management | IP, URL, user agent, security signals | `__cf_bm`, `cf_clearance`, `_cfuvid` | Strictly necessary | Low |
| Supabase (`qxyggegnnxdsgjcutsrl.supabase.co`) | Auth + database | Discord ID, email, license, logs | `sb-*-auth-token` in localStorage | Necessary for sign-in | Low |
| Discord (`discord.gg`, `cdn.discordapp.com`, OAuth) | Sign-in, roles, avatars | Discord ID, username, email, avatar | Discord's own cookies on their domain | Necessary for sign-in | Low |
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Typography | IP, user agent, Referer | None | **None — loads before consent** | **Medium (GDPR)** |
| jsDelivr (`cdn.jsdelivr.net`) | Supabase JS `@2` | IP, user agent, Referer | None | None | Medium |
| GitHub (`raw.githubusercontent.com`) | Streams the `.jar` download | IP, user agent | None | None (user-initiated) | Low |
| mc-heads.net | Minecraft head/skin renders | Minecraft username or UUID | None | None | Low |
| Hugging Face Spaces (`errormissing-pulse-bot.hf.space`) | API fallback when `api.pulseclient.xyz` fails | Discord ID, license key, IP | None | None (functional) | Medium |

## Services used by staff tooling / anti-abuse

| Service | Where | Data exposed | Notes |
|---|---|---|---|
| freeipapi.com | `app.js` layer 1 — IP + proxy/ASN check | User IP | Runs for every visitor during the gate check |
| api.ipify.org | Client IP resolution (3 call sites) | User IP | Duplicate of what the server already sees |
| blackbox.ipinfo.app | Layer 2 — threat lookup | User IP | Third-party blacklist |
| api.ipquery.io | Layer 3 — threat engine | User IP | |
| ipwho.is | Layer 4 — provider/security analysis | User IP | |

That is **five separate providers** receiving the same IP during a single sign-in. Each one is a processor relationship and a cross-border transfer to document.

## SDK inventory

| SDK | Version | Delivery | License | Issue |
|---|---|---|---|---|
| `@supabase/supabase-js` | `@2` (floating) | jsDelivr CDN | MIT | Unpinned major, no `integrity` hash, no `crossorigin` |
| skinview3d (bundles three.js) | self-hosted bundle | `assets/js/skinview3d.bundle.js` | MIT | Fine; keep the license header and `.map` out of production |
| Tailwind / Next assets in `_next/` | build output | self-hosted | MIT | Leftover from a previous Next.js build, not linked from the site |

The Supabase **anon key** in `app.js` is expected to be public. Row-level security must enforce access; the key alone must not grant admin reads.

## Findings and recommended fixes

1. **Google Fonts before consent (high).** Self-host the six families in `fonts/` and drop the `fonts.googleapis.com` links plus the `@import` in `style.css`. That removes a US transfer on first paint, removes a render-blocking third-party request, and makes the CSP story simpler.
2. **Consolidate IP intelligence (high).** Resolve VPN/proxy/threat flags server-side in `api.pulseclient.xyz` and return a single verdict. The browser then contacts zero IP providers, and the user's IP stops being shared with five companies.
3. **Pin the Supabase SDK (medium).** Use a fixed version (`@2.116.0`) with an `integrity` hash, or bundle it locally like `skinview3d`.
4. **Consent gate is ready but empty.** `consent.js` exposes `window.PulseConsent.has(category)` and activates `<script type="text/plain" data-consent="analytics" data-src="…">` only after opt-in. Any future analytics must go through it.
5. **Hugging Face fallback (medium).** Confirm the Space's privacy terms and that it stores nothing beyond the request; otherwise disable the fallback for EU users.
6. **Leftover files (low).** `radium_raw.html` contains a Cloudflare Web Analytics beacon and is not linked anywhere; `_next/` and `PulseClient/` are stale build trees. Remove them from the deploy to avoid shipping dead pages and extra attack surface.
7. **CSP (medium).** With fonts self-hosted and the SDK pinned, a `Content-Security-Policy` header can restrict scripts to `'self'` plus `api.pulseclient.xyz`, which would also neutralise any injected third-party script.

## Files that implement the current policy

- `privacy.html` — processor table, retention, rights
- `cookies.html` — full storage inventory
- `licenses.html` — attribution for fonts, libraries and assets
- `consent.js` — consent storage and script gating
