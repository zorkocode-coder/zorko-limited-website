# ZORKO corporate office website

## Search content update — 18 November 2026

The current build presents Zorko Group, with Zorko Limited retained as the legal company name. It adds food franchise opportunities, franchise investment, food-business consultancy, sales careers in Surat, benefits, learning, food-business formats, resources and two original guides. Existing pages have unique keyword-aligned titles, descriptions, descriptive H1s, internal links, social metadata and Organization/WebSite/WebPage data. Articles have Article data. No fabricated vacancies, salaries, guarantees, review ratings or employer awards are added.

Run `node check-seo.mjs` after building, alongside `npm run check`. The check verifies unique metadata, one H1, valid JSON-LD, local anchor targets, Group identity, indexing controls and production canonical/breadcrumb rendering.

Deployment remains paused. A build without `SITE_URL` is a local preview: noindex, nofollow, robots disallow and an empty sitemap. Production canonicals, breadcrumb URLs, social image URLs and the XML sitemap activate when `SITE_URL` contains the confirmed HTTPS origin. For PowerShell, set `$env:SITE_URL` before running `npm run build`; remove it when returning to a local preview. Node does not automatically read `.env.example`. Do not use an invented domain or point the Group site's canonicals at unrelated existing brand pages. Search Console and field performance verification require the eventual real domain and are not completed by a local build.

The keyword research identifies intent and business relevance, not measured search volumes or difficulty. Current terms, fees, role availability and benefits remain subject to confirmation by the appropriate team. The contact form still prepares an email draft, and applications follow the official careers route.

Eleven static pages with a shared responsive design, accessible navigation, reduced-motion support, scroll reveals, animated counters, gallery filtering and a keyboard-accessible image dialog.

The current corporate design combines white, warm gray and charcoal with the original punchy orange (#FF701C / #FF7E38) and lilac (#C9B8F1 / #D9C9EF). The split homepage uses a blue-to-purple gradient, a statement on the left, and layered office-interior photographs on the right. Orange storytelling and closing sections, purple culture sections and portrait controls retain the earlier brand energy. Typography pairs DM Sans with DM Serif Display. Real office and team photographs lead the experience. Official leadership portraits cover both founders, the COO, CFO, and Company Secretary; 18 management and department photographs form a filterable directory. Profiles open in keyboard-accessible dialogs.

Current design references are https://www.romanklis.com/about-us for editorial company storytelling, an orange narrative section and photographic leadership presentation, https://www.zensar.com/careers for careers information architecture, and Apple’s restrained approach to color. The previous playful iteration remains in Git history and its inactive modules. Corporate layout and interaction files are extended by experience.mjs, experience.css and experience.js for the current homepage, media and scroll effects.

Reference-inspired motion includes masked line-by-line heading reveals, staggered card entrances, gentle desktop photo parallax, image scaling, and navigation feedback, with reduced-motion support. The leadership rail supports pointer dragging and previous/next buttons. The careers page includes team areas, culture, learning, a keyboard-accessible benefits tab group, office imagery, and the official application route. No job vacancies or unsupported employment promises have been invented. Static link and image checks, JavaScript syntax checks, mobile overflow checks, carousel controls, and profile, directory, lightbox, and benefits interactions have been verified.

Scroll-driven effects now include changing rotation, image depth and position in the homepage composition, section-card translate/scale transformations across pages, and an expanding workplace video frame. The original 31.6-second Zorko gallery film is used on the workplace page only. It plays muted when visible, pauses offscreen, offers play/pause and sound controls, and respects reduced-motion and data-saving preferences. Source provenance is recorded in content/media-sources.json. Browser verification confirmed video decoding/playback and changing homepage transforms during scrolling.

## Run

`npm run build` generates the pages. `npm run check` checks local links and assets. `npm run dev` serves the site at http://127.0.0.1:4173.

The local server supports HTTP byte ranges and media MIME types. With the server running, `npm run check:media` verifies video HEAD requests, bounded and suffix ranges, invalid ranges and image MIME types.

The enquiry form prepares an email draft; it does not send or store enquiries. Careers links point to the official Zorko application page. No fabricated job openings are shown.

## Sources

The supplied LV.pdf (Zorko Spotlight, November 2026), and the official zorko.in pages for journey, founders, team, careers, achievements, gallery, consultancy and contact. Research renders remain in `research/`; publishable assets are in `dist/assets/`. Official image origins and captions are recorded in `content/official-assets.json`; the originals are saved in `dist/assets/official/`.

The site is labelled as a corporate website concept. Confirm content, photography rights and current personnel information before placing it on an official company domain.
