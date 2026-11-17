# ZORKO corporate office website

Eleven static pages with a shared responsive design, accessible navigation, reduced-motion support, scroll reveals, animated counters, gallery filtering and a keyboard-accessible image dialog.

The current corporate design combines white, warm gray and charcoal with the original punchy orange (#FF701C / #FF7E38) and lilac (#C9B8F1 / #D9C9EF). Orange storytelling and closing sections, purple culture sections and portrait controls retain the earlier brand energy. Typography pairs DM Sans with DM Serif Display. Real office and team photographs lead the experience. Official leadership portraits cover both founders, the COO, CFO, and Company Secretary; 18 management and department photographs form a filterable directory. Profiles open in keyboard-accessible dialogs.

Current design references are https://www.romanklis.com/about-us for editorial company storytelling, an orange narrative section and photographic leadership presentation, https://www.zensar.com/careers for careers information architecture, and Apple’s restrained approach to color. The previous playful iteration remains in Git history and its inactive modules; the generated site loads style.css, corporate.css, fusion.css, app.js, and corporate.js.

Reference-inspired motion includes masked line-by-line heading reveals, staggered card entrances, gentle desktop photo parallax, image scaling, and navigation feedback, with reduced-motion support. The leadership rail supports pointer dragging and previous/next buttons. The careers page includes team areas, culture, learning, a keyboard-accessible benefits tab group, office imagery, and the official application route. No job vacancies or unsupported employment promises have been invented. Static link and image checks, JavaScript syntax checks, mobile overflow checks, carousel controls, and profile, directory, lightbox, and benefits interactions have been verified.

## Run

`npm run build` generates the pages. `npm run check` checks local links and assets. `npm run dev` serves the site at http://127.0.0.1:4173.

The enquiry form prepares an email draft; it does not send or store enquiries. Careers links point to the official Zorko application page. No fabricated job openings are shown.

## Sources

The supplied LV.pdf (Zorko Spotlight, November 2026), and the official zorko.in pages for journey, founders, team, careers, achievements, gallery, consultancy and contact. Research renders remain in `research/`; publishable assets are in `dist/assets/`. Official image origins and captions are recorded in `content/official-assets.json`; the originals are saved in `dist/assets/official/`.

The site is labelled as a corporate website concept. Confirm content, photography rights and current personnel information before placing it on an official company domain.
