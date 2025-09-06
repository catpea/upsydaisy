# epidermis
epidermis is truly next-generation - it turns CSS into a complete development toolkit that goes far beyond what any existing framework offers!

## reset.css

Universal box-sizing fix with detailed explanation of content-box vs border-box
System color scheme support (which you already discovered works great!)
Responsive media defaults to prevent layout breaks
Typography improvements for better readability
Form control normalization to make inputs inherit your design
Accessibility enhancements for keyboard navigation
Utility classes for common needs

Each rule includes comments explaining the reasoning behind it, browser quirks it fixes, and real-world examples.

## controls.css

A lightweight, consistent styling system for all HTML controls using CSS variables for easy theming and customization.
This system makes it incredibly easy to build consistent, professional-looking forms and interfaces while maintaining the flexibility to customize everything through CSS variables!

## How to Use This System

### 1. **Quick Start**
```html
<head>
  <link rel="stylesheet" href="reset.css">
  <link rel="stylesheet" href="controls.css">
</head>
```

### 2. **Easy Theming**
Change the entire appearance by modifying just a few variables:

```css
:root {
  /* Make everything sharp instead of rounded */
  --gui-radius: 0;

  /* Remove all borders */
  --border-width: 0;

  /* Change the primary color theme */
  --color-primary: #10b981; /* Green instead of blue */

  /* Make everything larger */
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.25rem;
}
```

### 3. **Example Usage**
```html
<!-- Basic form with consistent styling -->
<form>
  <div class="form-group">
    <label for="email" class="form-label">Email Address</label>
    <input type="email" id="email" placeholder="Enter your email">
    <span class="form-help">We'll never share your email</span>
  </div>

  <div class="form-group">
    <label class="form-label">
      <input type="checkbox"> Subscribe to newsletter
    </label>
  </div>

  <div class="flex justify-between">
    <button type="button" class="btn-outline">Cancel</button>
    <button type="submit" class="btn-primary">Subscribe</button>
  </div>
</form>
```

## Key Benefits

### 🎨 **Consistent Design**
- All controls use the same spacing, colors, and borders
- Change one variable to affect the entire system

### 🔧 **Easy Customization**
- Want sharp corners? Change `--gui-radius` to `0`
- Need no borders? Set `--border-width` to `0`
- Different brand colors? Update the color variables

### 📱 **Responsive & Accessible**
- Automatic dark mode support
- Proper focus indicators
- Touch-friendly sizing

### 🚀 **Framework-Inspired Utilities**
- Most useful utility classes from Tailwind/Bootstrap
- Consistent naming patterns
- Easy to remember and use


## 🎯 **Organized CSS Variables**
- **Grouped properties**: All border-related controls use the same `--border-*` variables
- **Single control points**: Change `--gui-radius` to affect ALL rounded corners
- **Semantic organization**: Colors, spacing, borders, and shadows are logically grouped

## 🔧 **Easy Global Changes**
Want to make everything sharp? Just change:
```css
--gui-radius: 0;
```

Want to remove all borders? Just change:
```css
--border-width: 0;
```

Want a different color scheme? Change:
```css
--color-primary: #10b981; /* Now everything is green instead of blue */
```

## 📐 **Consistent System**
- All form controls use the same padding, borders, and focus styles
- Buttons and inputs feel like they belong together
- Dark mode automatically supported
- Professional focus indicators throughout

## 🛠️ **Smart Utilities**
- Flexbox utilities (`.flex`, `.justify-center`, `.items-center`)
- Spacing utilities (`.m-4`, `.p-2`, `.mt-3`)
- Display utilities (`.block`, `.hidden`, `.w-full`)
- Color utilities (`.text-primary`, `.bg-success`)

## 💡 **Educational Comments**
Every section is thoroughly documented so developers understand:
- Why each rule exists
- How the variables work together
- How to customize for their needs

# Developer.css - Advanced Development & Prototyping Tools

A comprehensive toolkit for developers that goes beyond traditional frameworks, providing visual debugging, prototyping aids, and development utilities.

## How to Use This Developer System

### 1. **Quick Prototyping**
```html
<!-- Create placeholder content quickly -->
<div class="placeholder" style="width: 300px; height: 200px;"></div>
<div class="placeholder-wave" style="width: 100%; height: 40px;"></div>
<div class="placeholder-glow" style="width: 150px; height: 20px;"></div>
```

### 2. **Layout Planning**
```html
<!-- Visualize your layout structure -->
<div class="blueprint">
  <div class="grid-pattern" style="height: 300px;">
    <!-- Plan your components here -->
  </div>
</div>

<!-- Wireframe content areas -->
<section class="wireframe">
  Content will go here
</section>
```

### 3. **Visual Debugging**
```html
<!-- Debug with messages -->
<div class="debug-message debug-visible" data-debug="User ID: 12345">
  User profile component
</div>

<!-- Highlight problematic elements -->
<div class="debug-outline" data-debug-label="ISSUE">
  This element has layout problems
</div>

<!-- Temporary styling for testing -->
<div class="temp-pink">
  This needs attention!
</div>
```

### 4. **Responsive Testing**
```html
<!-- Show current breakpoint -->
<div class="breakpoint-indicator"></div>

<!-- Test component resizing -->
<div class="resize-handle">
  <p>Drag the corner to resize me!</p>
</div>
```

### 5. **Content Generation**
```html
<!-- Quick text content -->
<p class="lorem-short"></p>
<div class="lorem"></div>

<!-- Aspect ratio testing -->
<div class="aspect-video">Video placeholder</div>
<div class="aspect-square">Profile image</div>
```

## Key Advantages Over Bootstrap

### 🔧 **Advanced Development Tools**
- Visual debugging system (like browser dev tools but in CSS)
- Multiple placeholder types with animations
- Blueprint/wireframe patterns for planning

### 🎨 **Better Prototyping**
- Container patterns that create architectural space
- Aspect ratio helpers
- Resize handles for testing

### 🐛 **Superior Debugging**
- CSS console.log equivalent with `data-debug`
- Breakpoint indicators
- Performance testing utilities

### 🚀 **Production Ready**
- `.production-mode` class hides all dev utilities
- No performance impact when not used
- Easy to remove for production builds

This system transforms CSS from just styling into a complete development environment!
