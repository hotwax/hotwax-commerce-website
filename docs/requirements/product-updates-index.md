# Requirements: Product Updates and Release Notes Blog Index Template

## Overview
The goal is to create a specialized blog index (listing) template for "Product Updates" and "Release Notes". This template will provide a distinct layout compared to the standard blog listing, optimized for scanning version updates, feature announcements, and bug fixes.

## Functional Requirements
1.  **Content Filtering (Type)**: Distinctly filter between "Updates" and "Release Notes".
    *   **Release Notes**: Full list of technical changes and version-specific details.
    *   **Updates**: Detailed, marketing/user-focused posts about specific new features.
2.  **Time-based Navigation**: allow users to browse updates by month (e.g., "September 2024").
3.  **Topic Integration**: Use HubSpot topics to categorize posts as "Update" or "Release Note".
4.  **Chronological Timeline**: Display posts in descending order of publish date.

## Technical Requirements
1.  **Template Type**: HubSpot Blog Listing template.
2.  **Base Layout**: Extend `./layouts/base.html` to maintain consistency.
3.  **Styling**: Use existing `_blog.css` but potentially add specific styles for release note cards (e.g., version badges).
4.  **HubL Modules**: Incorporate custom modules for product-specific metadata if needed (e.g., Version Number field).

## UI/UX Goals
- **Scannability**: Users should quickly see what's new.
- **Categorization**: Clear labels for "New", "Improved", "Fixed".
- **Consistency**: Maintain the HotWax brand identity while providing a "Product-y" feel.

## Future Considerations
- Integration with an automated release note generator (Moqui/OFBiz).
- Email subscription specifically for product updates.
