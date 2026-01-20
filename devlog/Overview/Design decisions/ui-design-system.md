# UI Design System Integration

# Overview
Integrated shadcn/ui component library with Tailwind CSS and established MYTuDo brand color palette based on the logo and landing page design.

# Color Palette

Based on mytudo-logo.jpeg and https://mytudo.lovable.app/, the theme emphasizes sustainability and eco-friendliness with green/teal tones.

## Light Mode
- Primary: HSL(158, 64%, 52%) - Vibrant Green
- Secondary: HSL(162, 40%, 45%) - Softer Teal
- Accent: HSL(158, 70%, 48%) - Highlight Green
- Background: White
- Muted: Light green-gray backgrounds

## Dark Mode
- Primary: HSL(158, 64%, 52%) - Same vibrant green
- Background: Dark green-tinted gray
- Emphasis on sustainable, natural aesthetic

# Technology Stack

- Tailwind CSS 4.x (with @tailwindcss/postcss)
- shadcn/ui components
- class-variance-authority (CVA) for component variants
- tailwind-merge + clsx for className utilities
- lucide-react for icons
- Cross-platform ready (Capacitor support)

# Component Architecture

All components now follow shadcn/ui patterns:
- Utility-first Tailwind classes
- CVA for variants
- Proper TypeScript typing with forwardRef
- Consistent spacing and sizing tokens

## Core Components

# Button
- Variants: primary, secondary, danger, outline, ghost, link
- Sizes: default, sm, lg, icon
- Loading state support

# Card
- Subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Consistent shadow and border styling

# Input
- Label integration
- Error state handling
- Focus ring with brand colors

# Layout
- Sticky header with backdrop blur
- Responsive navigation
- Brand color integration

# Configuration Files

- tailwind.config.js: Tailwind setup with custom theme
- postcss.config.js: PostCSS plugins (@tailwindcss/postcss for v4)
- components.json: shadcn/ui configuration
- src/lib/utils.ts: cn() utility for className merging
- src/index.css: CSS custom properties and Tailwind layers

# Cross-Platform Considerations

The design system is built with Capacitor compatibility in mind:
- Utility-first classes work across web and mobile
- Touch-friendly sizing (minimum 44px touch targets)
- Responsive design with mobile-first approach
- No platform-specific CSS modules

# Migration Notes

- Replaced CSS modules with Tailwind utility classes
- Maintained component APIs for backward compatibility
- Enhanced components with additional variants and features
- Existing pages will automatically pick up new styling

# Next Steps

- Install additional shadcn/ui components as needed (Dialog, Select, Dropdown, etc.)
- Update feature-specific components to use new design system
- Add dark mode toggle if desired
- Consider adding animation variants
