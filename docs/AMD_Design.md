---
version: alpha
name: AMD.com
description: Dark, enterprise-focused marketing design system for AMD’s AI and product homepage experiences. Typography uses Klavika for display headlines and Open Sans for supporting content. Primary actions are outlined, high-contrast, and cyan-accented on a near-black surface.
colors:
  primary: "#00c2de"
  secondary: "#ffffff"
  tertiary: "#374151"
  neutral:
    0: "#000000"
    900: "#121212"
    800: "#1f2937"
    700: "#374151"
    100: "#f3f4f6"
  surface:
    default: "#121212"
    elevated: "#121212"
    overlay: "#000000"
  on-surface:
    default: "#ffffff"
    muted: "#9ca3af"
  error: "#ef4444"
typography:
  fontFamily:
    display: "Klavika, arial, sans-serif"
    body: "Open Sans, arial, sans-serif"
  headline-display:
    fontFamily: "Klavika, arial, sans-serif"
    fontSize: 40.515px
    fontWeight: 500
    lineHeight: 43.715px
    letterSpacing: 0px
  headline-lg:
    fontFamily: "Klavika, arial, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 36.8px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 22.0237px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: 0px
  body-lg:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 14.8251px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  label-lg:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  label-md:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 14.8251px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  label-sm:
    fontFamily: "Open Sans, arial, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 2px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 26px
  xl: 34px
components:
  button:
    primary:
      backgroundColor: transparent
      color: "#ffffff"
      borderColor: "#00c2de"
      borderRadius: 2px
      borderWidth: 1px
      borderStyle: solid
      padding: "16px 34px"
      fontSize: 14.8251px
      fontWeight: 600
      minWidth: 229px
      minHeight: 56px
      textDecoration: none
      boxShadow: none
      fontFamily: "Open Sans, arial, sans-serif"
    secondary:
      backgroundColor: transparent
      color: "#ffffff"
      borderColor: "#00c2de"
      borderRadius: 2px
      borderWidth: 1px
      borderStyle: solid
      padding: "16px 34px"
      fontSize: 14.8251px
      fontWeight: 600
      minWidth: 229px
      minHeight: 56px
      textDecoration: none
      boxShadow: none
      fontFamily: "Open Sans, arial, sans-serif"
    link:
      backgroundColor: transparent
      color: "#ffffff"
      borderColor: transparent
      borderRadius: 0px
      borderWidth: 0px
      borderStyle: none
      padding: 0px
      fontSize: 14.8251px
      fontWeight: 600
      minWidth: 0px
      minHeight: 0px
      textDecoration: none
      boxShadow: none
      fontFamily: "Open Sans, arial, sans-serif"
  card:
    backgroundColor: "#121212"
    borderColor: "#374151"
    borderRadius: 8px
    borderWidth: 1px
    borderStyle: solid
    padding: 16px
    boxShadow: none
    textColor: "#ffffff"
---

# Overview

AMD.com is a dark, high-contrast marketing site centered on AI, products, and enterprise storytelling. The visual tone is technical, restrained, and premium: black surfaces, white text, cyan outlines, and large hero imagery. Pages emphasize layered content blocks, carousel-driven feature promotion, and editorial/news modules.

Use Klavika for prominent page headlines and Open Sans for all support text, links, buttons, and metadata. Preserve the strong contrast and minimal decorative treatment; the interface should feel engineered rather than ornamental.

# Colors

Primary color is a cyan accent used for interactive borders, link emphasis, and system highlights.

- `colors.primary` is the brand accent: `#00c2de`
- `colors.secondary` is the default foreground on dark surfaces: `#ffffff`
- `colors.neutral.900` / `colors.surface.default` define the core page background: `#121212`
- `colors.tertiary` / `colors.neutral.700` support borders and dividers: `#374151`
- `colors.on-surface.muted` is appropriate for secondary copy and utility icons: `#9ca3af`

Implementation guidance:
- Keep most major surfaces near-black; avoid light sections unless a specific content module requires them.
- Use cyan sparingly to signal action, focus, and navigation.
- Do not introduce additional saturated brand colors unless they are product-specific and already established elsewhere on the page.

# Typography

Headlines are large, compact, and slightly industrial. Supporting copy is neutral, readable, and grounded in Open Sans.

Recommended hierarchy:
- `headline-display`: hero titles and page-level statements
- `headline-lg`: section headers
- `headline-md`: feature-card or promo-module headings
- `body-lg`: lead paragraphs in hero or editorial modules
- `body-md`: standard body copy
- `body-sm` / `label-md`: buttons, tags, and utility labels

Rules:
- Use Klavika for top-level headlines only; do not mix display families within the same heading level.
- Keep letter spacing at `0px` for all primary text styles.
- Favor sentence case over all caps for marketing content.
- Button text should remain compact and emphatic; the observed site uses a semi-bold Open Sans treatment.

# Layout

The homepage uses a full-width, content-heavy structure with stacked promotional sections.

Observed structure:
- A dark global header with left-aligned logo and top-level navigation.
- A large hero area with background imagery and a centered headline.
- A prominent carousel card overlaying the hero background, with left/right controls and pagination dots.
- Follow-on sections for trust messaging, product portfolios, developer resources, and latest news.
- Cards and content modules are aligned to a broad page grid with generous horizontal padding.

Implementation guidance:
- Use wide containers and avoid narrow editorial widths for primary promos.
- Maintain clear separation between sections using spacing rather than heavy borders.
- Keep hero media large, edge-to-edge, and visually dominant.
- Center or left-align content depending on the module; feature cards often combine left copy with right imagery.

# Elevation & Depth

The site relies more on contrast and layering than on heavy shadows.

- `shadows.sm` is the only meaningful elevation token and can be used for subtle separation.
- Most cards and overlays appear flat or minimally raised.
- The hero feature card is visually separated primarily by opacity, rounded corners, and a dark overlay rather than shadow.

Guidance:
- Prefer overlays, translucency, and contrast over large drop shadows.
- Use inset depth only when a component needs internal separation.
- Do not apply pronounced shadows to nav, cards, or buttons.

# Shapes

Rounded geometry is subtle and functional.

- `rounded.sm` / `2px` matches button outlines and precise interactive controls.
- `rounded.md` / `8px` is appropriate for cards and larger content panels.
- Large media or carousel containers may use slightly softer corners, but remain restrained.

Guidance:
- Keep buttons sharp and technical.
- Use rounded corners only where they improve scannability or visual containment.
- Avoid pill-shaped controls unless the component is explicitly a chip, badge, or utility icon button.

# Components

## Buttons

Use outlined buttons as the default call to action.

Primary button:
- Transparent background
- White text
- Cyan border
- 1px solid outline
- Minimum target size of `229px` by `56px`
- Padding `16px 34px`

Secondary button:
- Same visual treatment as primary in the extracted styleguide; use only when the content model requires two actions with equal weight.

Link button:
- Text-only, no padding, no border
- Use for inline or low-emphasis navigation such as “Explore” or “Learn More”

Behavior:
- Keep labels concise and action-oriented.
- Use the button width token to preserve the broad, premium CTA feel.
- Do not convert primary CTAs into filled buttons unless a specific page template explicitly requires it.

## Cards

Cards are dark panels with thin borders and minimal depth.

- Background: `#121212`
- Border: `#374151`
- Radius: `8px`
- Padding: `16px`

Use cards for:
- hero feature overlays
- news items
- solution tiles
- content previews

## Navigation

The global navigation is slim, dark, and utility-forward.

- Logo sits at top left.
- Primary nav items are horizontal and understated.
- Utility icons are aligned top right and rendered as simple monochrome symbols.

Guidance:
- Keep nav text low-contrast relative to body copy unless hovered or active.
- Reserve cyan accents for active state, focus state, or selection indicators.

## Carousel / Hero promo

The homepage hero uses a carousel pattern with:
- one dominant featured card
- left/right arrow controls
- pagination dots beneath the module
- large background image treatment

Guidance:
- Always provide a clear current-slide indicator.
- Keep controls visible but secondary to the promotional content.
- Ensure text remains readable over image-heavy compositions.

## News and editorial lists

News modules mix headlines, dates, and linked titles.

Guidance:
- Use compact vertical rhythm.
- Keep dates subordinate to titles.
- Maintain clear link styling with no underline by default unless hover state is supported.

# Do's and Don'ts

Do:
- Do use a dark base surface for the full page and major content blocks.
- Do pair Klavika headlines with Open Sans body text.
- Do keep primary CTAs outlined with cyan borders and white text.
- Do use large, high-impact imagery with restrained overlays.
- Do preserve the airy spacing between major homepage modules.
- Do keep cards simple, bordered, and low-elevation.

Don't:
- Don't switch the homepage to a light theme.
- Don't use thick shadows, glossy effects, or skeuomorphic treatments.
- Don't overuse cyan; it should remain an accent, not a fill color.
- Don't use decorative scripts, serif fonts, or condensed display faces.
- Don't make buttons pill-shaped or overly rounded.
- Don't crowd navigation or content cards with dense text blocks; AMD.com favors readable, modular sections.