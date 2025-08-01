# HotWax Commerce Website Code Structure - Gemini File

## Project Overview
The HotWax Commerce website code is structured to keep everything modular and maintainable. However, there are many legacy and outdated custom modules that need to be synced with the main theme to reduce redundancy and ensure consistency across the site. The following guidelines outline how to work with and style the components of the site.

## Key Folders & Files

### HotWax_2021 Folder
- This is where all custom components are stored. Any new or modified components should be added here.

### Main Stylesheet: `Hotwax_Stylesheet_2021.css`
- This is the main stylesheet for the website and should be used for all global styling.
- **Goal**: Reduce the amount of module-specific CSS and use global classes from this file.
  
### Device Stylesheet
- This is used to manage device-specific sizing variables. Any device custom module should reference this stylesheet for responsive design adjustments.

### Custom Grid
- **Purpose**: The custom grid is used to create layouts on product pages.
- When creating new layouts for product pages, always use the custom grid system to ensure consistency and responsiveness.

## Styling Guidelines

### Button Styling
- To create a button, use the following classes on the anchor (`<a>`) tag:
  - `Hs-button`
  - `Primary`

### Card Styling
- Always use the predefined card classes in `Hotwax_Stylesheet_2021.css` to define cards. These are globally styled and ensure consistency in the card design.

### Using the Main Stylesheet
- **Best Practice**: Always prefer using classes and variables from `Hotwax_Stylesheet_2021.css` over writing custom styles. This will ensure that all styles align with the overall branding and design consistency.

## HubSpot Module Structure

- **Folder Layout**: Each HubSpot module has its own folder, containing three files:
  - `HTML` file
  - `CSS` file
  - `JS` file

- **Editing CSS in HTML Files**: Be very cautious when editing CSS in the HTML file of a HubSpot module. This CSS is often tied to dynamic functionality and any changes require thorough testing to avoid breaking features.

## Code Cleanup & Optimization
- **Minimize Redundant Code**: As you work through modules, eliminate unnecessary or redundant CSS and JS. Reorganize the code so that it follows a consistent and streamlined pattern, making it easier to maintain.
- **Consistency Across Modules**: Ensure that all modules adhere to the same design and functionality patterns, using shared classes and variables from `Hotwax_Stylesheet_2021.css`.

## Conclusion
The key to maintaining the HotWax Commerce website is consistency. Ensure that all custom modules are aligned with the global branding styles, use reusable components, and minimize redundant or outdated CSS. Always test thoroughly, especially when making changes to modules that contain dynamic functionality.