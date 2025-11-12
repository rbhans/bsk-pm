# BAS Development Style Guide

**Version:** 1.0.0
**Last Updated:** November 11, 2025
**Maintained by:** Ben Hansen

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Technology Stack](#technology-stack)
3. [Design System Foundation](#design-system-foundation)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Component Library](#component-library)
7. [Layout & Spacing](#layout--spacing)
8. [Icons & Imagery](#icons--imagery)
9. [Responsive Design](#responsive-design)
10. [Best Practices](#best-practices)
11. [Quick Reference](#quick-reference)

---

## Design Philosophy

### Developer-First Aesthetic

This design system embraces a **developer-focused, terminal-inspired aesthetic** that communicates technical proficiency and precision. The visual language speaks to engineers and technical professionals through:

- **Monospace typography** - JetBrains Mono throughout creates a coding environment feel
- **True black backgrounds** - Deep, pure black (#0a0a0a) for maximum contrast and focus
- **Minimal color palette** - Neutral grays with a single vibrant green accent
- **Clean geometry** - Consistent 0.5rem border radius, subtle borders, generous whitespace
- **Technical precision** - Everything feels intentional, measured, and purposeful

### Core Principles

1. **Clarity Over Decoration** - Every visual element serves a functional purpose
2. **Consistency Builds Trust** - Predictable patterns make products feel professional
3. **Accessibility First** - High contrast, readable typography, keyboard navigation
4. **Performance Matters** - Lean CSS, optimized assets, fast loading times
5. **Scale Gracefully** - From mobile to ultra-wide displays

---

## Technology Stack

### Foundation

- **CSS Framework**: Tailwind CSS 3.4+
- **Component System**: shadcn/ui (built on Radix UI primitives)
- **Styling Approach**: Utility-first with CSS custom properties (design tokens)
- **Component Composition**: class-variance-authority (CVA) for variants

### Why This Stack?

**Tailwind CSS** provides utility-first styling that promotes consistency while allowing rapid iteration. By constraining design choices to a predefined scale, it naturally creates visual harmony.

**shadcn/ui** offers production-ready, accessible components that are *copied into your project* rather than installed as a dependency. This means you own the code and can customize freely while maintaining consistency.

**CSS Custom Properties** (design tokens) create a single source of truth for colors, spacing, and other design decisions. Change one variable, update everywhere.

---

## Design System Foundation

### CSS Custom Properties Architecture

All design tokens are defined as HSL color values in CSS custom properties. This approach provides:

- **Single source of truth** - Change colors globally from one location
- **Automatic theme generation** - Tailwind's color utilities reference these tokens
- **Semantic naming** - `--primary`, `--card`, `--destructive` communicate intent
- **HSL color space** - Easy lightness/darkness adjustments for hover states

### Token Categories

1. **Surface Colors** - Background, card, popover surfaces
2. **Text Colors** - Foreground, muted-foreground for different text hierarchies
3. **Interactive Colors** - Primary, secondary, accent for buttons and links
4. **Feedback Colors** - Destructive for errors, ring for focus states
5. **Structure Colors** - Border, input for UI chrome and boundaries
6. **Geometric Tokens** - Radius for consistent border radius

---

## Color System

### Philosophy: True Black Dark Mode

This system uses **pure black** (`hsl(0, 0%, 4%)`) rather than dark gray or blue-tinted blacks. This creates:

- **Maximum contrast** - Text pops against the background
- **Energy efficiency** - True black pixels are off on OLED screens
- **Professional appearance** - Associated with premium, technical products
- **Focus on content** - The black recedes, letting interface elements shine

### Color Palette

#### Surface Colors

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--background` | `0 0% 4%` | `#0a0a0a` | Main app background, page base |
| `--card` | `0 0% 6%` | `#0f0f0f` | Card backgrounds, elevated surfaces |
| `--popover` | `0 0% 6%` | `#0f0f0f` | Dropdown menus, tooltips, popovers |

**Usage Guidelines:**
- Use `background` for the main canvas
- Use `card` to create visual hierarchy and grouping
- Cards should "float" 2% lighter than the background
- Never use pure white backgrounds in this theme

#### Text Colors

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--foreground` | `0 0% 98%` | `#fafafa` | Primary text, headings, body copy |
| `--muted-foreground` | `0 0% 64%` | `#a3a3a3` | Secondary text, descriptions, metadata |
| `--card-foreground` | `0 0% 98%` | `#fafafa` | Text on card surfaces |

**Usage Guidelines:**
- Use `foreground` for all important text (headings, primary content)
- Use `muted-foreground` for supporting text, timestamps, labels
- Maintain minimum 7:1 contrast ratio for accessibility (both colors exceed this)
- Never use pure white (#ffffff) - the 98% lightness is softer and more refined

#### Brand & Interactive Colors

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--primary` | `142.1 76.2% 36.3%` | `#16a34a` | Primary actions, brand color, CTA buttons |
| `--primary-foreground` | `144.9 80.4% 10%` | `#052e16` | Text on primary color backgrounds |
| `--accent` | `142.1 76.2% 36.3%` | `#16a34a` | Hover states, highlighted UI elements |
| `--ring` | `142.1 76.2% 36.3%` | `#16a34a` | Focus ring color (keyboard navigation) |

**The Green:** A vibrant, saturated green (#16a34a) serves as the sole accent color. This choice:
- Communicates "go", success, and technical proficiency
- Provides high contrast against black backgrounds
- Is associated with terminals and developer tools
- Creates a distinctive brand identity

**Usage Guidelines:**
- Use `primary` sparingly to draw attention to key actions
- Never use multiple accent colors - the single green is intentional
- Hover states should reduce opacity to 90% (e.g., `hover:bg-primary/90`)
- Focus rings must always use `--ring` for consistency

#### Structure Colors

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--border` | `0 0% 14%` | `#242424` | Borders, dividers, card outlines |
| `--input` | `0 0% 14%` | `#242424` | Form input backgrounds |
| `--secondary` | `0 0% 14%` | `#242424` | Secondary buttons, muted backgrounds |
| `--muted` | `0 0% 14%` | `#242424` | Disabled states, subtle backgrounds |

**Usage Guidelines:**
- Borders should be subtle - 14% lightness creates definition without distraction
- All borders must be exactly 1px wide (not 2px or 3px)
- Input backgrounds match border color to create cohesive form design
- Secondary actions use the same gray to visually de-emphasize

#### Feedback Colors

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--destructive` | `0 62.8% 30.6%` | `#9c1c1c` | Delete buttons, error states, warnings |
| `--destructive-foreground` | `0 0% 98%` | `#fafafa` | Text on destructive backgrounds |

**Usage Guidelines:**
- Use `destructive` for actions that cannot be undone (delete, remove)
- Always require confirmation before destructive actions
- Error messages should use destructive color with clear iconography
- Never use red for non-destructive purposes

### Semantic Color Usage

#### Status Colors

For status badges (running, stopped, error, warning), use Tailwind's color utilities:

- **Success/Running**: `bg-green-500/10 text-green-500 border-green-500/20`
- **Stopped/Inactive**: `bg-gray-500/10 text-gray-400 border-gray-500/20`
- **Warning/Pending**: `bg-yellow-500/10 text-yellow-500 border-yellow-500/20`
- **Error/Failed**: `bg-red-500/10 text-red-500 border-red-500/20`

**Pattern:** Use 10% opacity backgrounds, full-opacity text, and 20% opacity borders. This creates colored badges that don't overwhelm the interface.

#### Protocol/Category Colors

For differentiating protocols or categories:

- **BACnet/Blue category**: `bg-blue-500/10 text-blue-400 border-blue-500/20`
- **Modbus/Purple category**: `bg-purple-500/10 text-purple-400 border-purple-500/20`
- **Additional categories**: Teal, orange, pink using the same pattern

---

## Typography

### Philosophy: Monospace Everything

This system uses **JetBrains Mono** for *all text* - not just code. This unconventional choice creates a distinctive, technical aesthetic that:

- **Establishes identity** - Immediately recognizable and memorable
- **Improves scannability** - Fixed-width characters create visual rhythm
- **Communicates expertise** - Associated with coding and technical precision
- **Maintains readability** - Modern monospace fonts are optimized for UI use

### Font Family

```css
font-family: 'JetBrains Mono', monospace;
```

**JetBrains Mono** is a modern, open-source monospace font designed specifically for developers. Features include:
- Increased character height for better readability
- Distinctive letterforms (reduced confusion between 0/O, 1/l/I)
- Ligatures for common programming operators (optional)
- 8 weights (Thin to ExtraBold) though we primarily use Regular, Medium, and SemiBold

**Font Loading:** Ensure JetBrains Mono is loaded via Google Fonts or self-hosted before displaying text to prevent layout shift.

### Type Scale

The system uses Tailwind's default type scale with semantic sizing:

| Tailwind Class | Size | Line Height | Usage |
|----------------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Badge text, tiny labels, metadata |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body text, descriptions, form labels |
| `text-base` | 1rem (16px) | 1.5rem | Default body text, paragraphs |
| `text-lg` | 1.125rem (18px) | 1.75rem | Card titles, section subheadings |
| `text-xl` | 1.25rem (20px) | 1.75rem | Emphasized card titles |
| `text-2xl` | 1.5rem (24px) | 2rem | Card headers, stats, dashboard metrics |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page titles, section headers |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Large page titles |
| `text-5xl` | 3rem (48px) | 1 | Hero headlines |
| `text-6xl` | 3.75rem (60px) | 1 | Marketing hero text |
| `text-7xl` | 4.5rem (72px) | 1 | Large hero displays |

### Font Weights

| Tailwind Class | Weight | Usage |
|----------------|--------|-------|
| `font-normal` | 400 | Default body text |
| `font-medium` | 500 | Emphasized text, subtle headings |
| `font-semibold` | 600 | Card titles, section headers, button text |
| `font-bold` | 700 | Page titles, large statistics, key metrics |

**Guidelines:**
- Use `font-normal` for all body text and descriptions
- Use `font-semibold` for most headings and titles
- Reserve `font-bold` for emphasis and large display text
- Avoid using thin weights - they lack sufficient contrast on dark backgrounds

### Typography Patterns

#### Page Title
```
text-3xl md:text-4xl font-bold
```
Large, bold, responsive scaling for main page headers.

#### Section Header
```
text-2xl font-semibold
```
Introduces major sections within a page.

#### Card Title
```
text-lg font-semibold
```
Titles within card components.

#### Body Text
```
text-sm text-muted-foreground
```
Descriptions, paragraphs, supporting information.

#### Label Text
```
text-sm font-medium
```
Form labels, table headers, metadata labels.

#### Stat/Metric Display
```
text-2xl md:text-3xl font-bold
```
Large numbers in dashboard statistics.

---

## Component Library

### shadcn/ui Foundation

The design system is built on **shadcn/ui**, a collection of reusable components built with Radix UI primitives and styled with Tailwind CSS. Key characteristics:

- **Copy, don't install** - Components live in your codebase (`/components/ui/`)
- **Fully customizable** - You own the code, modify as needed
- **Accessible by default** - Built on Radix UI with ARIA compliance
- **Composable** - Components work together to build complex interfaces
- **Variant-driven** - Uses class-variance-authority for consistent variants

### Core Components

#### Button

The most critical interactive element. Six variants communicate different levels of importance:

**1. Default (Primary)**
- **Visual**: Green background (`bg-primary`), white text
- **Usage**: Primary call-to-action, main action in a context
- **Example**: "Save Changes", "Create New", "Start Server"
- **Code**: `<Button>Label</Button>`

**2. Destructive**
- **Visual**: Dark red background (`bg-destructive`), white text
- **Usage**: Delete, remove, actions that cannot be undone
- **Example**: "Delete Device", "Remove User", "Clear All"
- **Code**: `<Button variant="destructive">Label</Button>`

**3. Outline**
- **Visual**: Transparent with border, gray text, subtle hover
- **Usage**: Secondary actions, cancel buttons, alternative choices
- **Example**: "Cancel", "Go Back", "View Details"
- **Code**: `<Button variant="outline">Label</Button>`

**4. Secondary**
- **Visual**: Gray background (`bg-secondary`), white text
- **Usage**: Less important actions, multiple equal options
- **Example**: "Download", "Export", "Duplicate"
- **Code**: `<Button variant="secondary">Label</Button>`

**5. Ghost**
- **Visual**: Transparent, only shows background on hover
- **Usage**: Tertiary actions, icon buttons, inline actions
- **Example**: Table row actions, menu items, icon-only buttons
- **Code**: `<Button variant="ghost">Label</Button>`

**6. Link**
- **Visual**: Styled as underlined text, green color
- **Usage**: Navigation that looks like text, inline actions
- **Example**: "Learn more", "View documentation", inline links
- **Code**: `<Button variant="link">Label</Button>`

**Button Sizes:**
- **Default**: `h-10 px-4 py-2` - Standard size for most buttons
- **Small**: `h-9 px-3` - Compact spaces, table actions
- **Large**: `h-11 px-8` - Hero CTAs, prominent actions
- **Icon**: `h-10 w-10` - Square buttons with only icons

**Button Patterns:**

*With Icon*
```jsx
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

*Icon Only*
```jsx
<Button size="icon" variant="ghost">
  <Icon className="h-4 w-4" />
</Button>
```

*Loading State*
```jsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

#### Card

Cards are the primary content container. They create visual hierarchy by elevating content above the background.

**Anatomy:**
```
Card (container)
├── CardHeader (padding, flex-col)
│   ├── CardTitle (text-2xl font-semibold)
│   └── CardDescription (text-sm text-muted-foreground)
├── CardContent (padding)
└── CardFooter (padding, flex items-center)
```

**Visual Properties:**
- Border: 1px solid, color `--border`
- Background: `--card` (6% lightness, 2% lighter than page)
- Border radius: `0.5rem` (8px)
- Shadow: Subtle shadow (`shadow-sm`)

**Usage Guidelines:**
- Use cards to group related information
- Most cards should have a title (CardHeader with CardTitle)
- Descriptions (CardDescription) are optional but recommended for clarity
- Use CardFooter for actions related to the entire card
- Maintain consistent padding (default `p-6`)

**Common Patterns:**

*Basic Card*
```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>
```

*Card with Action*
```jsx
<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </div>
      <Button size="icon" variant="ghost">
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

#### Badge

Badges are compact labels for status, categories, or metadata.

**Variants:**

**1. Default**
- **Visual**: Green background, white text
- **Usage**: Positive status, active states, primary tags
- **Code**: `<Badge>Label</Badge>`

**2. Secondary**
- **Visual**: Gray background, white text
- **Usage**: Neutral tags, categories, counts
- **Code**: `<Badge variant="secondary">Label</Badge>`

**3. Destructive**
- **Visual**: Red background, white text
- **Usage**: Error status, failed states, warnings
- **Code**: `<Badge variant="destructive">Label</Badge>`

**4. Outline**
- **Visual**: Transparent with border, foreground text
- **Usage**: Lightweight tags, removable filters, protocol types
- **Code**: `<Badge variant="outline">Label</Badge>`

**Status Badge Pattern:**

For colored status badges (see Color System → Semantic Colors), combine outline variant with custom colors:

```jsx
<Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
  Running
</Badge>
```

#### Input & Label

Form elements follow a consistent pattern for visual unity.

**Input Properties:**
- Height: `h-10` (40px)
- Padding: `px-3 py-2`
- Border: 1px solid `--input`
- Background: `--background`
- Border radius: `rounded-md` (6px)
- Focus state: 2px ring in `--ring` color (green)

**Usage Pattern:**
```jsx
<div className="space-y-2">
  <Label htmlFor="input-id">Label Text</Label>
  <Input
    id="input-id"
    type="text"
    placeholder="Placeholder text"
  />
</div>
```

**Guidelines:**
- Always pair Label with Input using matching `htmlFor`/`id`
- Use placeholder text to provide examples, not instructions
- Validate inputs and show error states clearly
- Keep vertical spacing consistent (`space-y-2` between label and input)

#### Accordion

Accordions reveal progressive disclosure of content.

**Usage:**
- FAQs and documentation
- Collapsible settings sections
- Long-form content organization

**Guidelines:**
- Use clear, descriptive trigger text
- Don't nest accordions (confusing navigation)
- Consider showing first item open by default
- Keep content within accordion scannable

---

## Layout & Spacing

### The 8px Grid System

All spacing values are multiples of 8px (0.5rem). This creates visual harmony and makes design decisions faster.

### Spacing Scale

| Tailwind Class | Size | Usage |
|----------------|------|-------|
| `gap-1` | 0.25rem (4px) | Tight grouping (icon + text) |
| `gap-2` | 0.5rem (8px) | Related items (badges, chips) |
| `gap-3` | 0.75rem (12px) | Card content spacing |
| `gap-4` | 1rem (16px) | Default component spacing |
| `gap-6` | 1.5rem (24px) | Section spacing within containers |
| `gap-8` | 2rem (32px) | Large section spacing |
| `gap-12` | 3rem (48px) | Major section breaks |
| `gap-16` | 4rem (64px) | Page-level section breaks |

### Layout Patterns

#### Container

Containers center content and provide consistent horizontal padding:

**Website**: Custom container with max-width 1400px, centered, 2rem padding
**Frontend**: Standard Tailwind container

**Usage:**
```jsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>
```

#### Grid Layouts

**Responsive Column Grid:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```
- Mobile: Single column
- Tablet: Two columns
- Desktop: Three columns
- Consistent 16px gap between items

**Dashboard Stats Grid:**
```
grid gap-4 md:grid-cols-3
```
Three equal columns on medium screens and up.

**Two-Column Content:**
```
grid md:grid-cols-2 gap-12
```
Side-by-side content with generous gap on medium screens and up.

#### Flex Layouts

**Horizontal Space Between:**
```
flex items-center justify-between
```
Common for card headers with title and action button.

**Vertical Stack:**
```
flex flex-col space-y-4
```
Vertically stacked elements with consistent spacing.

**Centered Content:**
```
flex items-center justify-center
```
Center both horizontally and vertically (loading states, empty states).

### Component Spacing

**Card Padding:**
- CardHeader: `p-6` (24px all sides)
- CardContent: `p-6 pt-0` (24px horizontal, 0px top)
- CardFooter: `p-6 pt-0` (24px horizontal, 0px top)

**Section Spacing:**
- Between major page sections: `py-12 md:py-16 lg:py-24`
- Between components: `space-y-6` or `space-y-8`
- Within components: `space-y-4`

### Responsive Spacing

Use responsive utilities to adjust spacing at different breakpoints:

```
py-12 md:py-16 lg:py-24
```

This scales vertical padding from 48px on mobile to 96px on large screens, maintaining proportional white space.

---

## Icons & Imagery

### Icon Library: lucide-react

All icons come from **lucide-react**, a comprehensive icon library with 1000+ icons in a consistent style.

**Why lucide-react:**
- Consistent stroke width (2px by default)
- Clean, minimal aesthetic
- Tree-shakeable (only import icons you use)
- Active maintenance and community
- Matches the overall design system aesthetic

### Icon Sizing Standards

| Size Class | Dimensions | Usage |
|------------|------------|-------|
| `h-4 w-4` | 16×16px | Inline with text, button icons |
| `h-5 w-5` | 20×20px | Navigation icons, larger buttons |
| `h-6 w-6` | 24×24px | Section headers, prominent actions |
| `h-8 w-8` | 32×32px | Feature cards, hero sections |
| `h-12 w-12` | 48×48px | Large empty states, onboarding |

**Consistency Rule:** Never use arbitrary sizes (h-[18px]). Stick to the scale above.

### Common Icons

#### Navigation & Structure
- `Package` - Products, packages, items
- `Cloud` - Cloud features, sync, remote
- `Code` - Development, technical features
- `Layout` - Dashboard, interface, UI
- `Server` - Backend, infrastructure, devices
- `Database` - Data storage, persistence

#### Actions
- `Play` - Start, begin, execute
- `Square` - Stop, pause
- `Trash2` - Delete, remove
- `Plus` - Add, create new
- `Edit` - Modify, update
- `Copy` - Duplicate, copy to clipboard
- `Download` - Export, save locally
- `RefreshCw` - Reload, refresh, sync

#### Status & Feedback
- `Activity` - Running, active, live
- `Info` - Information, help, tooltip
- `AlertCircle` - Warning, caution
- `CheckCircle` - Success, complete
- `XCircle` - Error, failed
- `Loader2` - Loading spinner (with `animate-spin`)

#### Navigation
- `ArrowRight` - Forward, next, navigate
- `ArrowLeft` - Back, previous
- `ChevronDown` - Expand, dropdown
- `ChevronUp` - Collapse, close
- `ExternalLink` - External link, new window

#### Social
- `Github` - GitHub profile/link
- `Linkedin` - LinkedIn profile
- `Mail` - Email contact

### Icon Usage Patterns

**Icon with Text (Button):**
```jsx
<Button>
  <ArrowRight className="mr-2 h-4 w-4" />
  Continue
</Button>
```
Icon on left, 8px margin right, 16×16px size.

**Icon Button:**
```jsx
<Button size="icon" variant="ghost">
  <Trash2 className="h-4 w-4" />
</Button>
```
Square button, ghost variant for subtlety, 16×16px icon.

**Loading Spinner:**
```jsx
<Loader2 className="h-4 w-4 animate-spin" />
```
Use `Loader2` with `animate-spin` for loading states.

**Icon in Card Header:**
```jsx
<div className="flex items-center gap-2">
  <Server className="h-5 w-5 text-muted-foreground" />
  <CardTitle>Server Status</CardTitle>
</div>
```
Icon at 20×20px, muted color, aligned with title.

### Imagery Guidelines

While this system is primarily UI-focused, when images are needed:

- **Dark mode optimized** - Ensure images work against dark backgrounds
- **SVG preferred** - Vector graphics scale perfectly
- **Subtle borders** - Add `border border-border` to create definition
- **Consistent border radius** - Use `rounded-lg` (0.5rem) for images
- **Lazy loading** - Implement for performance
- **Alt text always** - Accessibility requirement

---

## Responsive Design

### Breakpoint System

Tailwind's default breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `sm:` | 640px | Mobile landscape, small tablets |
| `md:` | 768px | Tablets, small laptops |
| `lg:` | 1024px | Laptops, small desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large displays |

### Mobile-First Approach

Styles are written for mobile first, then enhanced at larger breakpoints:

```
text-3xl md:text-4xl lg:text-5xl
```

This reads as:
- Mobile: 1.875rem (30px)
- Tablet: 2.25rem (36px)
- Desktop: 3rem (48px)

### Responsive Patterns

#### Grid Columns

**Single to Triple Column:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```
- Mobile: 1 column (stacked)
- Tablet: 2 columns
- Desktop: 3 columns

**Auto-fit Grid (Flexible):**
```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
```
Adapts to available space at each breakpoint.

#### Typography

**Responsive Headings:**
```
text-4xl sm:text-5xl md:text-6xl lg:text-7xl
```
Scale text size progressively for maximum impact on large screens.

**Responsive Body Text:**
Generally keep body text at `text-sm` or `text-base` across all breakpoints. Don't scale body text up too much - it reduces readability.

#### Spacing

**Responsive Padding:**
```
py-12 md:py-16 lg:py-24
```
Increase vertical padding on larger screens to maintain proportions.

**Responsive Gaps:**
```
gap-4 md:gap-6 lg:gap-8
```
Increase spacing between elements on larger screens.

#### Visibility

**Hide on Mobile:**
```
hidden md:flex
```
Element is hidden on mobile, shows as flex on tablet and up.

**Show Only on Mobile:**
```
md:hidden
```
Element shows on mobile, hidden on tablet and up.

### Touch Target Sizes

- **Minimum**: 44×44px for all interactive elements (WCAG guideline)
- Buttons naturally meet this (`h-10` = 40px, but padding makes target larger)
- Icon buttons (`size="icon"`) are 40×40px minimum
- Increase touch targets on mobile if needed using padding

### Testing

Always test responsive designs on:
- Mobile (320px - 480px)
- Tablet (768px - 1024px)
- Desktop (1280px - 1920px)
- Extra wide (2560px+)

Use browser DevTools responsive mode and test on real devices.

---

## Best Practices

### Component Composition

**Do:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">Content here</p>
  </CardContent>
</Card>
```

**Don't:**
```jsx
<div className="rounded-lg border border-border bg-card p-6">
  <h3 className="text-2xl font-semibold">Title</h3>
  <p className="text-sm text-muted-foreground mt-2">Description</p>
  <div className="mt-4">
    <p>Content here</p>
  </div>
</div>
```

**Why:** Use shadcn components instead of recreating them. Components include accessibility features, consistent styling, and are easier to maintain.

### Consistent Variant Usage

**Do:**
```jsx
<Button variant="outline">Cancel</Button>
<Button>Confirm</Button>
```

**Don't:**
```jsx
<Button className="bg-gray-800">Cancel</Button>
<Button className="bg-green-500">Confirm</Button>
```

**Why:** Variants maintain consistency and handle hover/focus/active states automatically.

### Semantic HTML

**Do:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </CardContent>
</Card>
```

**Don't:**
```jsx
<Card>
  <CardHeader>
    <div className="text-2xl font-semibold">Section Title</div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
  </CardContent>
</Card>
```

**Why:** CardTitle renders as `<h3>`, lists should use `<ul>`/`<ol>`. Semantic HTML improves accessibility and SEO.

### Accessibility

**Always:**
- Include `alt` text on images
- Use `Label` components with `htmlFor` matching Input `id`
- Ensure 4.5:1 contrast ratio minimum (our palette exceeds this)
- Support keyboard navigation (Tab, Enter, Escape)
- Include focus states (automatic with shadcn components)
- Use ARIA labels when text content isn't visible

**Button Accessibility:**
```jsx
<Button size="icon" variant="ghost" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>
```

When a button has no text, use `aria-label` to describe its function.

### Performance

**Do:**
- Use Tailwind's JIT mode (default in v3)
- Purge unused CSS in production
- Lazy load images and heavy components
- Use `loading="lazy"` on images
- Minimize custom CSS (use Tailwind utilities)

**Don't:**
- Create duplicate utility classes
- Use `@apply` excessively (defeats Tailwind's purpose)
- Import entire icon libraries (tree-shake with individual imports)

### Naming Conventions

**Components:**
- PascalCase: `DeviceCard`, `NavigationMenu`, `StatusBadge`
- Descriptive, not generic: `DeviceCard` not `Card1`

**CSS Classes:**
- Use Tailwind utilities, avoid custom classes when possible
- If custom classes needed, use kebab-case: `.custom-scrollbar`

**File Structure:**
```
/components
  /ui              # shadcn components
    button.tsx
    card.tsx
    badge.tsx
  DeviceCard.tsx   # Custom components
  Navigation.tsx
/lib
  utils.ts         # Helper functions
```

### Error States

Always handle and display errors clearly:

```jsx
{error && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  </div>
)}
```

Use destructive color, clear iconography, and actionable error messages.

### Loading States

Provide feedback during async operations:

```jsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

Use `Loader2` with `animate-spin`, disable interactive elements, show progress text.

---

## Quick Reference

### Most Common Tailwind Classes

#### Layout
```
flex items-center justify-between
grid grid-cols-1 md:grid-cols-2 gap-4
container mx-auto px-4
```

#### Spacing
```
p-6 (padding all sides)
py-12 md:py-16 lg:py-24 (responsive vertical padding)
space-y-4 (vertical spacing between children)
gap-4 (grid/flex gap)
```

#### Typography
```
text-sm text-muted-foreground (body text)
text-2xl font-semibold (card title)
text-3xl md:text-4xl font-bold (page title)
```

#### Colors
```
bg-background (page background)
bg-card (card background)
text-foreground (primary text)
text-muted-foreground (secondary text)
border-border (borders)
bg-primary hover:bg-primary/90 (button)
```

#### Borders & Radius
```
border border-border (standard border)
rounded-lg (standard border radius)
shadow-sm (subtle shadow)
```

### Component Cheat Sheet

#### Button Hierarchy
1. Default (green) - Primary action
2. Outline - Secondary action
3. Ghost - Tertiary action
4. Destructive - Dangerous action

#### Card Structure
```
Card > CardHeader > CardTitle + CardDescription
     > CardContent
     > CardFooter (optional)
```

#### Badge Variants
- Default: Green, active states
- Secondary: Gray, neutral tags
- Destructive: Red, errors
- Outline: Custom colored badges

### Color Variables Quick Copy

```css
--background: 0 0% 4%;
--foreground: 0 0% 98%;
--card: 0 0% 6%;
--primary: 142.1 76.2% 36.3%;
--border: 0 0% 14%;
--muted-foreground: 0 0% 64%;
--destructive: 0 62.8% 30.6%;
```

---

## Conclusion

This style guide represents a cohesive, developer-focused design system optimized for technical products. The key principles:

1. **Consistency** - Reuse components and patterns
2. **Simplicity** - Clear hierarchy, minimal color palette
3. **Accessibility** - High contrast, keyboard support, semantic HTML
4. **Performance** - Lean CSS, optimized assets
5. **Scalability** - Responsive, mobile-first approach

When in doubt:
- **Check existing components first** - Don't recreate what exists
- **Use the spacing scale** - Stick to multiples of 8px
- **Limit color usage** - Black, gray, and green are your palette
- **Test responsively** - Mobile, tablet, desktop
- **Prioritize accessibility** - Every user matters

---

**Questions or suggestions?** Open an issue or reach out to Ben Hansen.

**Version History:**
- 1.0.0 (November 11, 2025) - Initial comprehensive style guide
