# Section Template

This document outlines the structure and implementation details of a section template in the HotWax Commerce Website project.

## Objective
The objective of using section templates is to provide a consistent and reusable way to define and render sections in the HotWax Commerce Website product, solution and landing pages which use the CSS Grid layout system custom developed to override the default HubSpot theme layout system which uses Bootstrap grid system.

## Product and Solution page usage

The most common use case that we want to simlify is a section that has a title followed by a sequence of cards. The cards are usually in the following layouts:

1. 1 column
   1. a single card spanns the entire width of the page
2. 2 columns
   1. two cards divide the horizontal space 50%
   2. two cards divide the horizontal space 25% and 75%
3. 3 columns
   1. three cards divide the horizontal space 33.33%

### Usage

The default section template will have a section title and a 2 column card layout with the space divided 50% and 50%. Because this template will be created using dnd tags, content editors will be able to add as many additional card combinations into this template when they use it.

Therefore the steps to use this template are as follows:

1. Create a new section using the section template
2. Add a title to the section
3. Populate or edit the 2 column card layout that comes with the section by default
4. Add as many additional card combinations as needed

### Implementation

Create a section template file in the following location:

/hotwax-theme/templates/section/default-section.html

Add the following annotations to the file:
<!--
 templateType: section
 label: Default Section
 description: "Default section template used on product and solution pages"
 isAvailableForNewContent: true
-->

Use the following components:

Section Title (located at /hotwax-theme/modules/section-title.module)
Graphic Frame (located at /HotWax_2021/Custom Modules/GraphicFrame.module)
Device Frame (located at /HotWax_2021/Custom Modules/DeviceFrame.module)