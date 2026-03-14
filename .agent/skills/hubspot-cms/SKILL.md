---
name: hubspot-cms
description: Expert instructions for managing HubSpot CMS resources within the HotWax theme.
---

# HubSpot CMS Skill

This skill provides specialized knowledge for working with the HubSpot CMS within the `hotwax-theme` repository.

## Core Responsibilities

1. **Module Management**:
   - Create new modules using the `HubSpotDev` MCP `create-cms-module`.
   - Ensure modules follow the existing structure in `hotwax-theme/modules`.
   - Maintain `fields.json` and ensure consistency with `module.html`.

2. **Template Architecture**:
   - Manage templates in `hotwax-theme/templates`.
   - Use HubL best practices for reusable components and macros.

3. **Serverless Functions**:
   - Use `HubSpotDev` MCP `create-cms-function` to scaffold backend logic.

## Best Practices

- Always use `fetch-doc` from `HubSpotDev` MCP when unsure about HubL syntax or HubSpot API behavior.
- Use `search-docs` to find official HubSpot guides.
- Prefix custom modules with `hw-` if they are unique to HotWax and not part of the base theme.
- **Styling**: 
    - Always adhere to the `design-system` skill when implementing CSS.
    - **Dynamic CSS**: If a module requires CSS that depends on HubL variables (e.g., module fields), place the CSS in `module.html` within a `{% require_css %}` block.
    - **Scoping**: Wrap dynamic CSS in `{% scope_css %}` to ensure styles are unique to each module instance.
    - `module.css` should only contain static CSS that doesn't change based on module fields.

## MCP Tooling Integration

- `HubSpotDev`: Always prefer MCP tools for scaffolding and documentation over manual file creation when possible.
