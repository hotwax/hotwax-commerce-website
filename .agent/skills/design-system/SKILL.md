---
name: design-system
description: Guidelines for using global design tokens and styling best practices in the HotWax theme.
---

# Design System Skill

This skill ensures all styling and CSS implementation follow the HotWax theme's global design tokens and layout principles.

## Global Design Tokens

When writing CSS, always use the following CSS variables defined in [_variables.css](file:///Users/adityapatel/Documents/GitHub/hotwax-commerce-website/hotwax-theme/css/_variables.css) instead of hardcoded values.

### 📏 Spacing (Spacers)
Use these for margins, padding, and gaps:
- `--spacer-xs`: Extra small spacing
- `--spacer-sm`: Small spacing
- `--spacer-md`: Medium (Standard) spacing
- `--spacer-lg`: Large spacing
- `--spacer-xl`: Extra large spacing

### 🎨 Colors
- `--color-primary`: Main theme color
- `--color-secondary`: Secondary action color
- `--color-tertiary`: Accent color
- `--color-text-body`: Standard text color
- `--color-text-title`: Heading and title color

### 🔡 Typography
#### Font Families
- `--font-family-body`: Standard body text
- `--font-family-special`: For headings or special accents

#### Font Weights
- `--font-weight-light` (300)
- `--font-weight-regular` (400)
- `--font-weight-medium` (500)
- `--font-weight-semibold` (600)
- `--font-weight-bold` (700)

#### Font Sizes
- `--font-size-xs`
- `--font-size-sm`
- `--font-size-md`
- `--font-size-lg`
- `--font-size-xl`

### 🏗️ Layout
- `--page-max-width`: Use for container max-width to maintain consistency across the site.

## Best Practices

1. **Avoid Hardcoded Values**: Never use `px`, `rem`, or `hex` codes directly in component CSS if a corresponding design token exists.
2. **Consistency**: Use the same level of spacing (e.g., `--spacer-md`) for related elements to maintain a rhythmic layout.
3. **HubL Integration**: Remember that many of these tokens are dynamically populated from HubSpot theme settings ({{ theme.spacing... }}). Do not overwrite these variables in local CSS files; instead, use them as defined.
4. **Elevation**: Use `--m-shadow` for cards and modals to match the project's elevation style.

## Usage Example

```css
.my-custom-component {
  padding: var(--spacer-md);
  margin-bottom: var(--spacer-lg);
  color: var(--color-text-body);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--m-shadow);
}
```
