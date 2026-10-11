# Pricing Page Module Implementation Plan

## Goal

Build the pricing page as a template-level layout made from reusable HubSpot modules. The template should not own pricing content, plan data, CTA labels, card copy, or inline rich text anchors. Editors should be able to change page content later through module fields.

The modules created or updated for this work should be generic page-building components, not pricing-page-only components, except for the single pricing card module.

## Figma References

- Hero/banner pattern: `3585:217`, `Hero / Text Title Hero + Native Button Group`
- Outline card pattern: `3585:246`, `Path Card / Store Inventory Management`
- Section header pattern: `3585:251`, `Text Content Title / Commerce OMS plans`
- Pricing card pattern: `3585:255`, `Pricing Card / Starter`
- Final CTA placement: `3585:565`, `Section / Final CTA`

## Module Count

Implement or update 4 reusable module types:

1. General banner module
2. Generic section header module
3. Generic outline card list module
4. Pricing card module

Use existing button behavior/classes where possible. The pricing template is responsible for laying modules out into rows, columns, and repeated sections.

## Module 1: General Banner

Use the existing `page-banner.module` as the base instead of creating a new final CTA module.

### Purpose

A reusable page/banner section that can be used at the top of pages and again later as a CTA band.

### Figma Mapping

- `3585:217`, page-start hero
- `3585:565`, final CTA with subtitle intentionally empty

### Field Config

- `title`: text
- `subtitle`: text, optional
- `body`: rich text or text area, optional
- `buttons`: repeater, max 2
  - `label`
  - `link_type`: page URL, external URL, anchor, popup
  - `link`
  - `style`: primary or secondary
- `alignment`: left, center
- `anchor_id`: optional text

### Pricing Template Usage

Top hero:

- `title`: `HotWax Commerce pricing`
- `subtitle`: `Order management and store inventory plans for retail rollout stages`
- `body`: short intro copy
- `buttons`: `Talk to sales`, `Compare plans`

Final CTA:

- Same module
- `subtitle`: empty
- `body`: optional or empty
- `buttons`: `Talk to sales`, `Review tier details`

## Module 2: Generic Section Header

Update the existing `section-title.module` into a broader reusable section header.

### Purpose

A reusable content header for page sections. This should not be pricing-specific.

### Figma Mapping

- `3585:251`, `Text Content Title / Commerce OMS plans`

### Field Config

- `title`: text
- `subtitle`: text or rich text, optional
- `alignment`: left, center
- `anchor_id`: optional text

### Pricing Template Usage

Use before:

- Product path selector
- Omnichannel OMS plans
- Store Inventory Management plans
- Tier details / add-ons / support details

## Module 3: Generic Outline Card List

Create a reusable outline card list module. This should support one or many cards and should not be pricing-specific.

### Purpose

A simple editable list of outline cards for navigation, summaries, feature groups, tier details, or any other marketing page section.

### Figma Mapping

- `3585:246`, `Path Card / Store Inventory Management`

### Field Config

- `cards`: repeater
  - `title`: text
  - `body`: rich text or text area
  - `meta`: text, optional
  - `link`: optional
  - `link_behavior`: none, full card link, button link
- `columns_desktop`: 1, 2, 3
- `columns_tablet`: 1, 2
- `card_clickable`: boolean

### Pricing Template Usage

Product path selector:

- Section header module
- Outline card list module
- Two cards:
  - Omnichannel OMS
  - Store Inventory Management

Tier detail section:

- Section header module
- Outline card list module
- As many cards as needed for support, add-ons, implementation, billing notes, or plan details

## Module 4: Pricing Card

Create one reusable pricing card module. Do not create a pricing grid module.

### Purpose

A single structured plan card. The template controls the 3-column layout by placing three pricing card modules next to each other.

### Figma Mapping

- `3585:255`, `Pricing Card / Starter`

### Field Config

- `plan_name`: text
- `price_prefix`: text, default `$`
- `price`: text
- `price_suffix`: text, default `/ mo`
- `features`: repeater
  - `text`: text
- `button_label`: text
- `button_link_type`: page URL, external URL, anchor, popup
- `button_link`
- `button_style`: primary, secondary
- `badge`: text, optional

### Pricing Template Usage

For each pricing group, the template creates a 3-column row:

- Column 1: pricing card module, Starter
- Column 2: pricing card module, Growth
- Column 3: pricing card module, Scale

Repeat the same 3-column layout for the second product group.

## Pricing Template Layout

The pricing template should only compose modules.

1. Banner section
   - General banner module
   - Full width
   - Includes title, subtitle, body, and two buttons

2. Product path section
   - Generic section header module
   - Generic outline card list module
   - Two cards

3. Omnichannel OMS section
   - Generic section header module
   - 3-column DnD row
   - Three pricing card module instances

4. Store Inventory Management section
   - Generic section header module
   - 3-column DnD row
   - Three pricing card module instances

5. Tier details section
   - Generic section header module
   - Generic outline card list module
   - Repeater cards for editable detail blocks

6. Final CTA section
   - General banner module
   - Subtitle left empty
   - Two buttons

## Template Rules

- Keep pricing data out of the template.
- Keep CTA labels and links out of the template.
- Keep card copy out of the template.
- Do not use rich text spans for anchors.
- Do not add pricing-specific layout logic inside generic modules.
- Do not edit existing CSS files for this implementation.
- New module CSS, if needed, should be limited to layout, spacing, sizing, and responsive behavior. Do not change font or color properties.

