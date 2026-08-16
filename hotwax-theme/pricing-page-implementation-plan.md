# Pricing Page Module Implementation Plan

## Goal

Build the pricing page as a template-level layout made from reusable HubSpot modules. The template should not own pricing content, plan data, CTA labels, card copy, or inline rich text anchors. Editors should be able to change page content later through module fields.

The modules created for this work are generic page-building components, not pricing-page-only components, except for the single pricing card module.

## Figma References

- Hero/banner pattern: `3585:217`, `Hero / Text Title Hero + Native Button Group`
- Outline card pattern: `3585:246`, `Path Card / Store Inventory Management`
- Section header pattern: `3585:251`, `Text Content Title / Commerce OMS plans`
- Pricing card pattern: `3585:255`, `Pricing Card / Starter`
- Final CTA placement: `3585:565`, `Section / Final CTA`

## Module Count

Implement 4 reusable module types:

1. `general-banner.module`
2. `section-header.module`
3. `outline-card-list.module`
4. `pricing-card.module`

Use existing button classes where possible. The pricing template is responsible for laying modules out into rows, columns, and repeated sections.

## Template Layout

1. Hero banner
   - `general-banner.module`
   - Full width

2. Product path selector
   - `section-header.module`
   - `outline-card-list.module`

3. First pricing group
   - `section-header.module`
   - Three separate `pricing-card.module` instances in a 3-column DnD row

4. Second pricing group
   - `section-header.module`
   - Three separate `pricing-card.module` instances in a 3-column DnD row

5. Detail section
   - `section-header.module`
   - `outline-card-list.module`

6. Final CTA
   - `general-banner.module`
   - Same banner module as the page start, with subtitle optionally empty

## Template Rules

- Keep pricing data out of the template.
- Keep CTA labels and links out of the template.
- Keep card copy out of the template.
- Do not use rich text spans for anchors.
- Do not add pricing-specific layout logic inside generic modules.
- Do not edit existing CSS files for this implementation.
- New module CSS should be limited to layout, spacing, sizing, and responsive behavior.
