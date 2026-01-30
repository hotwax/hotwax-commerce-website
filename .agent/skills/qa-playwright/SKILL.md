---
name: qa-playwright
description: Specialized instructions for QA automation and site reliability using Playwright.
---

# QA & Playwright Skill

This skill handles all aspects of automated testing and site reliability for the HotWax website.

## Core Responsibilities

1. **Test Suite Maintenance**:
   - Maintain and expand the tests in the `tests/` directory.
   - Use `sanity.spec.ts` as a template for dynamic sitemap-based testing.

2. **Error Debugging**:
   - When a test fails, leverage the `chrome-devtools` MCP to inspect the state.
   - Use `take_screenshot` and `performance_start_trace` to diagnose visual or performance regressions.

3. **Continuous Monitoring**:
   - Proactively check for new pages added to the sitemap and ensure they are covered by sanity tests.

## Tools & Integration

- **Playwright CLI**: Run tests via `npx playwright test`.
- **chrome-devtools MCP**:
  - `evaluate_script`: Use to check DOM state or trigger specific behaviors during debugging.
  - `take_screenshot`: Capture visual state of failures.

## Best Practices

- Ensure tests are resilient by using robust selectors (e.g., `getByRole`, `getByTestId`).
- Keep the sitemap sampling logic updated to ensure broad coverage without excessive runtimes.
