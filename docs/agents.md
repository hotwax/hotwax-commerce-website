# HotWax Commerce Website Guidelines for Agencies

## Project Overview
The website codebase for HotWax Commerce has gone through multiple iterations, handled by different agencies. This has led to inconsistent coding practices. The goal is to streamline and clean up the code, focusing on reusability and branding consistency. All styling should adhere to the HotWax Commerce branding and utilize common classes from the main stylesheet.

## Folder Structure

### HotWax_2021 Folder
All custom components are stored here. This folder should be the primary location for any module-specific adjustments or additions.

### Main Stylesheet
The primary stylesheet for the website is `Hotwax_Stylesheet_2021.css`. It handles the branding and global styles for the website. All CSS for modules should be minimized and use common styles defined in this stylesheet.

## CSS Guidelines

### General Approach
- **Minimize Module-Specific CSS**: Aim to minimize CSS that is specific to individual modules. Use global classes and variables from the main stylesheet to maintain consistency.
- **Re-use Style Variables**: Always use style variables from the `Hotwax_Stylesheet_2021.css` for colors, fonts, and other style-related properties.
- **Avoid Redundant CSS**: Clean up redundant or outdated CSS in the modules. If there are custom styles in any module, ensure they align with the branding guidelines and only use them if absolutely necessary.

### Best Practices for Styling
- **Buttons**: To style a button, apply the following classes to the anchor tag:
  - `Hs-button`
  - `Primary`

- **Cards**: Always use the predefined card classes in the main stylesheet when defining a card layout. This ensures consistency in card design across the website.

### Device-Specific Styles
- The `device.css` stylesheet is used for managing device-specific sizing variables. This should only be used within the custom device modules to ensure responsiveness and proper layout scaling.

## HubSpot Modules

- HubSpot modules are stored in folders with each module containing three files:
  1. HTML file
  2. CSS file
  3. JS file

- **CSS in HTML files**: Any CSS found in the HTML file of a module must be edited cautiously. Since it may be linked to dynamic functionality, significant testing is required before making any changes to these styles.

### Custom Grid for Product Pages
- Use the custom grid system when creating layouts for product pages. This allows for flexible and responsive layouts that align with the brand design.

## Conclusion
The main focus is to keep the website clean, maintainable, and consistent with the HotWax Commerce branding. Prioritize reusing existing classes and style variables, and ensure that any custom code or changes are tested thoroughly.
