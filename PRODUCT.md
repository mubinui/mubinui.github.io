# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary readers, weighted equally:

- **Industry hiring managers and technical recruiters** screening for Software Engineer / AI Engineer roles. They skim fast and look for shipped systems, stack depth, and scope of ownership.
- **Graduate admissions committees and prospective PIs** evaluating MS/PhD research fit. They look for research rigor, publications, collaborators, and evidence of independent investigation.

Both usually arrive from a CV, LinkedIn, or an application link and decide within a minute whether to keep reading.

## Product Purpose

Personal portfolio of Mubin Ul Islam Chowdhury, Software & AI Engineer (R&D) at BRAC IT Services Ltd. It exists to turn a skim into a conversation. Success means the reader **emails** him. The user decided in Sep 2026 that the site has no CV download. GitHub and LinkedIn are the secondary doors.

## Positioning

An engineer who ships production AI systems (the multi-agent BRAC IT AI Kit, fingerprint identification at scale, NL-to-SQL) and who also does measured research: an IEEE Xplore ISS paper co-authored with a NASA/MIT Astrobee scientist via STEMX365, plus information-theoretic analysis work. The combination of production engineering and research is the differentiator. Neither half should read as filler for the other.

## Operating Context

- Static single page deployed on GitHub Pages at https://mubinui.github.io/ (index.html, styles.css, script.js, sw.js, manifest.json).
- Readers use desktop during screening and mobile when opening a link from LinkedIn or email.
- SEO targets: Software Engineer, AI Engineer, AI Researcher (metadata, JSON-LD Person schema, sitemap, robots.txt).

## Capabilities and Constraints

- Hand-written HTML/CSS/JS with no build step. Keep it that way unless the user decides otherwise.
- `sw.js` `CACHE_NAME` must be bumped on every asset change.
- Most projects are proprietary to BRAC IT: no live demos or source code. Only DocumentRAG and put-it-on have public repos.
- The CV PDF (`Mubin_Ul_Islam_Chowdhury_CV.pdf`) is the source of truth for projects and claims. Don't pull portfolio content from GitHub repos on your own initiative. Repos the user names explicitly are the exception: in Sep 2026 they asked for delaxis (the open-source edition of the BRAC IT AI Kit), iron-base, and cricket-entrophy-analysis, with Pages and GitHub links, plus Weft from a README they pasted. **Weft is proprietary BRAC IT work, not open source** (user correction, Sep 2026). `mycvdata.txt` (Apr 2025) is an older CV and still backs the More-work rows.
- Content cuts the user approved (Sep 2026): vanity/count-up stats, the "What I do" services section, the typed-text hero line, and icon-per-item decoration.

## Brand Commitments

- Name: Mubin Ul Islam Chowdhury. GitHub: mubinui. LinkedIn: mubinuic. Email: uic.mubin@gmail.com.
- The user's visual constraint (Sep 2026): **Apple-inspired, free of AI-slop patterns**. Record only; new-work owns what that means.
- Direction history (Sep 2026): the category-standard white build was rejected as not modern Apple. Spatial Windows (dark visionOS) came next. The user then asked for a fusion: the deployed site's layout and light background with white matte Liquid Glass, and none of the deployed site's AI slop. **Light only, white matte glass.**
- Voice: first person, plain, specific. Claims are backed by numbers from the CV (e.g. 100% Rank-1 on FVC2002, 50%+ LLM cost reduction), not adjectives.

## Evidence on Hand

- CV PDF: `Mubin_Ul_Islam_Chowdhury_CV.pdf`
- Portrait: `profile-photo/IMG_5007.jpg`
- Achievement photos: `profile-photo/achievements/Achievements/` (hackathon award, pitch, and winners; Best Mentor award; Kibo-RPC award; photo with the NASA/MIT scientist; Mongol-Tori rover team)
- Workshop photos: `profile-photo/achievements/Taking Training sessions/`
- Publications: IEEE Xplore (ISS precision repairs) and DSpace BRACU (suicidal-intent prediction).
- Awards: Best Mentor BRAC IT 2026; Second Runner Up, AI Engineering Hackathon 2025; Best Team Performer 2023; 3rd place Kibo-RPC (JAXA) 2022.
- TenderSense (user-supplied, Sep 2026, not yet in the CV PDF): 1st Runner-Up, BRAC IT Code Sprint 2026 (The AI Readiness Hackathon, 14 Sep 2026), 33 build-round teams, 48-hour build, team Neuro Warriors with Arnab Dey and Lita Mouri Sarker. Photos: `profile-photo/achievements/Achievements/BracITsHackathonWinner.jpeg`, `BracitHackathon.JPG` (web copies suffixed `-web`). The TenderSense stack is not stated, so don't invent one.
- Current portrait (Sep 2026): `profile-photo/Mubin Ul Islam Chowdhury profile photo.jpeg`, web copy `profile-photo/portrait-web.jpg`.
- **Absent, do not fabricate:** testimonials, client logos, product screenshots of proprietary systems, live demo links, and metrics the CV does not state.

## Product Principles

1. **Evidence over adjectives.** Every claim points to a system, number, paper, or photo.
2. **Two readers, one story.** Engineering and research are presented as one practice, not two competing pitches.
3. **One door, always in reach.** Email is reachable from any point on the page.
4. **Less, but true.** Cut anything that exists to fill space. A section earns its place or goes.
5. **Fast and quiet on every device.** Mobile readers from LinkedIn get the same quality as desktop.

## Accessibility & Inclusion

WCAG 2.2 AA. Honor `prefers-reduced-motion` and `prefers-reduced-transparency`. The site is light-only (white matte glass, Sep 2026). Keep the skip link and semantic landmarks.
