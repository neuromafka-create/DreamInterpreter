---
version: alpha
name: intel.com
description: Dark-mode Intel web design system for product-led marketing pages, hero storytelling, and compact content cards. Based on Intel’s homepage patterns, with high-contrast white text, blue primary actions, rounded buttons, and minimal depth.
colors:
  primary: "#0953de"
  secondary: "#121212"
  tertiary: "#374151"
  neutral: "#ffffff"
  surface: "#121212"
  on-surface: "#ffffff"
  error: "#d92d20"
typography:
  fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
  headline-display:
    fontFamily: "intel-one-display-medium, Helvetica, Arial, sans-serif"
    fontSize: "26px"
    lineHeight: 38px
    letterSpacing: "-0.32px"
    fontWeight: 500
  headline-lg:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "32px"
    lineHeight: 38px
    letterSpacing: "0px"
    fontWeight: 700
  headline-md:
    fontFamily: "intel-one-display-medium, Helvetica, Arial, sans-serif"
    fontSize: "21px"
    lineHeight: 22px
    letterSpacing: "-0.2px"
    fontWeight: 500
  body-lg:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "17px"
    lineHeight: 20px
    letterSpacing: "0px"
    fontWeight: 500
  body-md:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 21px
    letterSpacing: "0px"
    fontWeight: 400
  body-sm:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 21px
    letterSpacing: "0px"
    fontWeight: 400
  label-lg:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 21px
    letterSpacing: "0px"
    fontWeight: 500
  label-md:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 21px
    letterSpacing: "0px"
    fontWeight: 500
  label-sm:
    fontFamily: "intel-one-body-text, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 21px
    letterSpacing: "0px"
    fontWeight: 400
rounded:
  none: "0px"
  sm: "8px"
  md: "100px"
  lg: "100px"
  xl: "100px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "18px"
  md: "32px"
  lg: "50px"
  xl: "80px"
components:
  button:
    primary:
      backgroundColor: "{colors.primary}"
      color: "{colors.neutral}"
      border: "0px none {colors.neutral}"
      borderRadius: "{rounded.full}"
      padding: "12px 20px 14px"
      minWidth: "191px"
      minHeight: "51px"
      fontFamily: "{typography.fontFamily}"
      fontSize: "14px"
      fontWeight: 500
      textDecoration: "none"
      boxShadow: "none"
    secondary:
      backgroundColor: "transparent"
      color: "{colors.neutral}"
      border: "1px solid {colors.neutral}"
      borderRadius: "{rounded.full}"
      padding: "12px 20px 14px"
      minWidth: "191px"
      minHeight: "51px"
      fontFamily: "{typography.fontFamily}"
      fontSize: "14px"
      fontWeight: 500
      textDecoration: "none"
      boxShadow: "none"
    link:
      backgroundColor: "transparent"
      color: "{colors.neutral}"
      border: "0px none transparent"
      borderRadius: "{rounded.none}"
      padding: "0px"
      minWidth: "0px"
      minHeight: "0px"
      fontFamily: "{typography.fontFamily}"
      fontSize: "14px"
      fontWeight: 400
      textDecoration: "underline"
      boxShadow: "none"
  card:
    backgroundColor: "{colors.surface}"
    color: "{colors.neutral}"
    border: "1px solid {colors.tertiary}"
    borderRadius: "{rounded.sm}"
    padding: "16px"
    boxShadow: "none"
---

# Overview

intel.com is a dark, high-contrast marketing system built for dense navigation, large hero panels, and product storytelling. The screenshot and homepage excerpt show a strong preference for deep navy surfaces, bright white text, Intel blue primary actions, and restrained visual effects.

Use this system for:
- homepage hero modules
- product feature promos
- editorial/news cards
- compact utility navigation
- inline text links in dark contexts

The tone is confident, technical, and product-forward. Composition should feel spacious, polished, and premium, with minimal decoration beyond subtle glow and gradient treatment.

# Colors

Primary color usage is Intel blue: `#0953de`. It is reserved for the strongest CTA and accent emphasis.

Core tokens:
- Background / surface: `#121212`
- On-surface text: `#ffffff`
- Secondary border and muted structure: `#374151`
- Primary action: `#0953de`

Guidance:
- Keep most backgrounds dark.
- Use white for key text and iconography.
- Use blue sparingly to guide action and hierarchy.
- If additional neutrals are needed, derive them conservatively from the dark base; do not introduce bright grays unless necessary.

# Typography

Typography is primarily Intel One Body Text, with Intel One Display Medium for prominent marketing headings.

Token usage:
- `headline-lg` for hero and major section titles
- `headline-display` for display-style mid-weight marketing headings
- `headline-md` for card headlines and smaller promo titles
- `body-lg` for short supporting copy under headlines
- `body-md` and `body-sm` for standard paragraphs and utility text
- `label-*` for buttons, nav items, and small UI labels

Observed hierarchy:
- Hero headline: 32px/38px, bold, body-text family
- Section/card headlines: 26px/38px or 21px/22px, display-medium family
- Supporting copy: 14px/21px regular
- Small utility text: 17px/20px or 14px/21px depending on emphasis

Keep tracking tight on display headlines, especially in short promotional sentences.

# Layout

The layout is centered and highly padded, with a strong hero block framed by large negative space.

Patterns to preserve:
- Wide desktop canvas with a centered featured panel
- Top navigation aligned horizontally with compact spacing
- Large hero cards or panels with generous internal padding
- Vertical pagination dots or section indicators used sparingly along the left edge
- Content blocks stacked with clear headline, description, and CTA order

Spacing tokens:
- `xs` 8px for tight icon/text grouping
- `sm` 18px for small gaps between related content
- `md` 32px for standard section spacing
- `lg` 50px for major block separation
- `xl` 80px for page-level breathing room

Prefer centered compositions for hero sections and left-aligned text within cards. Avoid dense multi-column layouts on marketing entry points unless the content is clearly segmented.

# Elevation & Depth

Depth is intentionally minimal. Most surfaces are flat, with visual separation created by color contrast and occasional border.

Use:
- `boxShadow: none` for buttons and cards
- subtle contrast between surface and background instead of raised shadows
- large glowing gradients or soft ambient color halos only as decorative hero treatment, not as a general component rule

The screenshot shows a luminous blue-purple backdrop around the central hero panel. Treat this as an ambient background effect rather than elevation.

# Shapes

Shapes are simple and rounded.

Token guidance:
- `none` for sharp utility edges when required
- `sm` `8px` for cards and content containers
- `full` for pill buttons
- `md`, `lg`, and `xl` may be treated as full-pillar radii for CTA-style controls where the source design uses highly rounded pills

Use:
- fully rounded buttons
- slightly rounded cards
- minimal corner radius on structural containers

# Components

## Button

Primary button:
- Filled Intel blue background
- White label
- Fully rounded pill shape
- Comfortable vertical padding and a minimum touch target around 191x51px

Secondary button:
- Transparent background
- White border
- White label
- Same pill geometry as primary
- Used for alternate actions in dark sections

Link button:
- Transparent, underlined text
- No border or shadow
- Use for tertiary actions, utility links, and inline editorial navigation

Rules:
- Keep button text short and action-oriented.
- Do not mix button styles within the same action group unless hierarchy is explicit.
- Use the primary button only once per hero or card cluster when possible.

## Card

Cards are dark containers with:
- `#121212` fill
- `#374151` border
- `8px` radius
- `16px` padding
- no shadow

Use cards for:
- editorial stories
- product feature summaries
- news highlights
- support or download entry points

Inside cards:
- headline first
- concise supporting copy second
- link or CTA last

# Do's and Don'ts

## Do
- Do use white text on dark surfaces for primary reading.
- Do use Intel blue only for the main CTA or key emphasis.
- Do keep hero sections spacious and centered on desktop.
- Do use `headline-lg` for the main marketing claim and keep it short.
- Do pair headlines with one supporting sentence and one CTA.
- Do keep cards flat, bordered, and minimally decorated.
- Do use fully rounded buttons and preserve the pill silhouette.
- Do favor underlined text links for tertiary navigation in dark panels.

## Don't
- Don't introduce heavy shadows, glassmorphism, or raised UI effects.
- Don't use multiple bright accent colors in the same section.
- Don't crowd the top navigation or stack it aggressively on wide screens.
- Don't use small, low-contrast text on the dark background.
- Don't make cards visually compete with the hero panel.
- Don't use square CTAs when the source design uses pills.
- Don't place more than one primary CTA in a single hero unless the page requires a choice.