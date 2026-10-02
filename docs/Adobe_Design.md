---
version: alpha
name: adobe.com
description: Dark-first Adobe homepage system with high-contrast typography, rounded pill CTAs, and large editorial cards for promotional and product storytelling.
colors:
  primary: "#ffffff"
  secondary: "#121212"
  tertiary: "#374151"
  neutral: "#000000"
  surface: "#121212"
  on-surface: "#ffffff"
  error: "#ff0000"
typography:
  headline-display:
    fontFamily: "Adobe Clean Display Black"
    fontFallbacks:
      - "Adobe Clean Display Black"
      - "Adobe Clean Display"
      - "adobe-clean-display"
      - "Arial Bold Adjusted"
      - "sans-serif"
    fontSize: "56px"
    lineHeight: 56
    letterSpacing: "-1.68px"
    fontWeight: 900
  headline-lg:
    fontFamily: "Adobe Clean Display Black"
    fontFallbacks:
      - "Adobe Clean Display Black"
      - "Adobe Clean Display"
      - "adobe-clean-display"
      - "Arial Bold Adjusted"
      - "sans-serif"
    fontSize: "42px"
    lineHeight: 56
    letterSpacing: "-1.68px"
    fontWeight: 900
  headline-md:
    fontFamily: "Adobe Clean Display Black"
    fontFallbacks:
      - "Adobe Clean Display Black"
      - "Adobe Clean Display"
      - "adobe-clean-display"
      - "Arial Bold Adjusted"
      - "sans-serif"
    fontSize: "32px"
    lineHeight: 40
    letterSpacing: "-1.2px"
    fontWeight: 900
  body-lg:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "18px"
    lineHeight: 27
    letterSpacing: "0.16px"
    fontWeight: 400
  body-md:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "16px"
    lineHeight: 24
    letterSpacing: "0.16px"
    fontWeight: 400
  body-sm:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "14px"
    lineHeight: 20
    letterSpacing: "0.16px"
    fontWeight: 400
  label-lg:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "14px"
    lineHeight: 20
    letterSpacing: "0px"
    fontWeight: 700
  label-md:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "14px"
    lineHeight: 20
    letterSpacing: "0px"
    fontWeight: 700
  label-sm:
    fontFamily: "Adobe Clean"
    fontFallbacks:
      - "Adobe Clean"
      - "adobe-clean"
      - "Trebuchet MS"
      - "sans-serif"
    fontSize: "12px"
    lineHeight: 16
    letterSpacing: "0px"
    fontWeight: 700
rounded:
  none: "0px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  full: "75px"
spacing:
  xs: "6px"
  sm: "16px"
  md: "40px"
  lg: "48px"
  xl: "84px"
components:
  button:
    primary:
      backgroundColor: "{colors.primary}"
      color: "{colors.neutral}"
      borderColor: "{colors.primary}"
      borderStyle: solid
      borderWidth: "1px"
      borderRadius: "{rounded.full}"
      padding: "13px 24px"
      minHeight: "40px"
      minWidth: "135px"
      fontFamily: "{typography.label-lg.fontFamily}"
      fontSize: "{typography.label-lg.fontSize}"
      fontWeight: "{typography.label-lg.fontWeight}"
      textDecoration: none
      boxShadow: none
    secondary:
      backgroundColor: transparent
      color: "{colors.on-surface}"
      borderColor: "{colors.on-surface}"
      borderStyle: solid
      borderWidth: "1px"
      borderRadius: "{rounded.full}"
      padding: "13px 24px"
      minHeight: "40px"
      minWidth: "135px"
      fontFamily: "{typography.label-lg.fontFamily}"
      fontSize: "{typography.label-lg.fontSize}"
      fontWeight: "{typography.label-lg.fontWeight}"
      textDecoration: none
      boxShadow: none
    link:
      backgroundColor: transparent
      color: "{colors.neutral}"
      borderColor: transparent
      borderStyle: none
      borderWidth: "0px"
      borderRadius: "{rounded.none}"
      padding: "0px"
      minHeight: "0px"
      minWidth: "0px"
      fontFamily: "{typography.label-lg.fontFamily}"
      fontSize: "{typography.label-lg.fontSize}"
      fontWeight: "{typography.label-lg.fontWeight}"
      textDecoration: none
      boxShadow: none
  card:
    backgroundColor: "{colors.surface}"
    color: "{colors.on-surface}"
    borderColor: "{colors.tertiary}"
    borderStyle: solid
    borderWidth: "1px"
    borderRadius: "{rounded.sm}"
    padding: "16px"
    boxShadow: none
---

## Overview

Adobe.com uses a dark, premium promotional layout with strong editorial contrast: bright white type, black/dark surfaces, and large rounded cards. The homepage mixes a utility-led top navigation with a hero CTA and masonry-style promotional pods. The visual tone is playful but controlled, with colorful artwork against a mostly black canvas.

Use this system when building marketing pages, product landing modules, and offer pods that need to feel distinctly Adobe: bold, concise, high-contrast, and image-forward.

## Colors

Core color usage is intentionally minimal.

- `primary` is white and is used for high-emphasis interactive surfaces and text on dark backgrounds.
- `secondary` and `surface` are the dark canvas, matching the homepage and cards.
- `tertiary` is a muted border tone for card strokes and separators.
- `neutral` is black and is used for dark text treatments and link/button copy where shown on light surfaces.
- `on-surface` is white for text and icons on dark cards and hero sections.
- `error` is a conservative alert red placeholder; confirm brand-approved semantic reds before shipping.

Recommended usage:
- Prefer white-on-dark or dark-on-white, not low-contrast mid-tone pairs.
- Use dark backgrounds for promotional modules and reserve white for primary actions and text.
- Keep accent color usage sparse; the page reads best when illustration carries color, not UI chrome.

## Typography

Typography is the clearest system signal on adobe.com: oversized display headlines, compact labels, and readable body copy.

### Headline styles
- `headline-display`: 56px / 56px, black display face, tight tracking for hero statements.
- `headline-lg`: 42px / 56px, for strong section leads.
- `headline-md`: 32px / 40px, for card titles and secondary hero copy.

### Body styles
- `body-lg`: 18px / 27px for supporting hero and offer descriptions.
- `body-md`: 16px / 24px for general content blocks.
- `body-sm`: 14px / 20px for dense supporting text and footnotes.

### Label styles
- `label-lg`, `label-md`: 14px bold for buttons, nav items, and small headings.
- `label-sm`: 12px bold for metadata.

Implementation notes:
- Use the Adobe Clean stack first; fall back conservatively to sans-serif.
- Headings should remain heavy and compressed; avoid medium weights for marketing hero copy.
- Keep body tracking subtle and stable. Do not add extra letter spacing to headlines beyond the tokens.

## Layout

The homepage favors a wide, responsive editorial grid with generous vertical spacing and rounded content cards.

Guidance:
- Use a full-width top nav with a light surface and compact controls.
- Center hero content horizontally with ample top padding and a single primary CTA.
- Place offer cards in a two-column hero band, then transition into a masonry-style multi-card grid.
- Maintain strong edge-to-edge contrast: dark hero region, light page margins only where needed.
- Preserve large visual media areas; these pods rely on image-led composition rather than dense text.

Spacing tokens:
- `xs` 6px for micro gaps and icon/text separation.
- `sm` 16px for internal card padding and compact grouping.
- `md` 40px for section breathing room.
- `lg` 48px for major grid separation.
- `xl` 84px for hero and page-level spacing.

## Elevation & Depth

The system is mostly flat.

- Shadows are effectively none; use contrast, borders, and background shifts instead of elevation.
- Cards rely on 1px borders and rounded corners, not drop shadows.
- Use inset highlights sparingly if a component needs a subtle chrome effect, but do not introduce floating layers.

## Shapes

The homepage uses soft geometry with strong rounding.

- `rounded.full` powers pill buttons and utility chips.
- `rounded.sm` fits the default card shape.
- Larger radii are suitable for hero containers and promotional surfaces if needed, but avoid overly soft or circular treatment on content blocks.
- Keep corners consistent within a section; do not mix sharp and ultra-rounded cards in the same module.

## Components

### Buttons
- **Primary**: white filled pill, black text, 14px bold label, minimum 135px wide.
- **Secondary**: transparent pill with white border and white text, used on dark backgrounds.
- **Link**: text-only button, black text, no border, compact spacing.

Button rules:
- Keep labels short and action-oriented: “See all plans,” “Buy now,” “Learn more.”
- Use pill radius for all prominent actions.
- Never add iconography unless the target module already uses it.

### Cards
- Dark cards use a 1px border, 8px radius, 16px padding, and white text.
- Card content is typically title, short body, then CTA.
- Image-heavy cards may overflow visual art beyond the text region; keep the text area uncluttered.

### Navigation
- The top nav is minimal: brand mark, a few dropdown categories, utility icons, and sign-in.
- Use small, bold labels and avoid oversized navigation treatments.

### Offer pods
- Promotional pods often include:
  - a small uppercase kicker,
  - a strong headline,
  - one or two lines of support copy,
  - a single CTA.
- Keep copy concise and promotional; these modules are not editorial articles.

## Do's and Don'ts

### Do
- Do use large, bold headlines for first-screen impact.
- Do keep text high-contrast, preferably white on black or black on white.
- Do use pill buttons for primary and secondary CTAs.
- Do keep cards simple: border, radius, padding, and clear hierarchy.
- Do let imagery do the expressive work; UI should stay restrained.

### Don't
- Don't use drop shadows to imply depth.
- Don't introduce multiple competing accent colors in UI chrome.
- Don't use thin or medium-weight headlines on marketing pages.
- Don't stack more than one primary CTA in the same hero unless the layout clearly supports it.
- Don't use low-contrast gray text on the dark surface for key information.
- Don't replace the pill button shape with square corners on high-visibility actions.