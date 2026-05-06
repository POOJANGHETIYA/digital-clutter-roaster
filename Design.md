# Design System - Complete Reference & Implementation Guide

A production-ready design system with modern aesthetics, full accessibility, and a focus on clarity and elegance. Built with Paper & Ink principles, OKLCH color space, and Tailwind CSS v4.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Sizing](#spacing--sizing)
6. [Shadows & Elevation](#shadows--elevation)
7. [Component Patterns](#component-patterns)
8. [Theme System](#theme-system)
9. [Responsive Design](#responsive-design)
10. [Implementation Guide](#implementation-guide)
11. [Complete Code Examples](#complete-code-examples)
12. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)
13. [Accessibility](#accessibility)
14. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Install Dependencies
```bash
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
npm install lucide-react react react-dom react-router zustand
```

### Create styles.css
```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-ember: var(--ember);
  --color-ember-foreground: var(--ember-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --shadow-soft: 0 1px 2px oklch(0 0 0 / 0.04), 0 4px 16px oklch(0 0 0 / 0.04);
  --shadow-card: 0 1px 0 oklch(0 0 0 / 0.04), 0 8px 28px -8px oklch(0 0 0 / 0.08);
  --shadow-ember: 0 10px 40px -12px oklch(0.62 0.18 35 / 0.35);
}

:root {
  --radius: 0.875rem;
  --background: oklch(0.972 0.006 80);
  --foreground: oklch(0.22 0.012 60);
  --surface: oklch(0.985 0.004 80);
  --surface-2: oklch(0.93 0.008 80);
  --card: oklch(0.99 0.003 80);
  --card-foreground: oklch(0.22 0.012 60);
  --primary: oklch(0.22 0.012 60);
  --primary-foreground: oklch(0.972 0.006 80);
  --ember: oklch(0.66 0.18 35);
  --ember-foreground: oklch(0.99 0.003 80);
  --secondary: oklch(0.93 0.008 80);
  --secondary-foreground: oklch(0.22 0.012 60);
  --muted: oklch(0.93 0.008 80);
  --muted-foreground: oklch(0.45 0.012 60);
  --accent: oklch(0.93 0.008 80);
  --accent-foreground: oklch(0.22 0.012 60);
  --destructive: oklch(0.58 0.22 27);
  --destructive-foreground: oklch(0.99 0.003 80);
  --success: oklch(0.62 0.13 155);
  --warning: oklch(0.75 0.15 75);
  --border: oklch(0.88 0.01 70);
  --input: oklch(0.88 0.01 70);
  --ring: oklch(0.66 0.18 35);
  --chart-1: oklch(0.66 0.18 35);
  --chart-2: oklch(0.45 0.04 60);
  --chart-3: oklch(0.75 0.12 75);
  --chart-4: oklch(0.55 0.08 200);
  --chart-5: oklch(0.6 0.13 155);
}

.dark {
  --background: oklch(0.17 0.008 60);
  --foreground: oklch(0.96 0.005 80);
  --surface: oklch(0.21 0.008 60);
  --surface-2: oklch(0.26 0.008 60);
  --card: oklch(0.21 0.008 60);
  --card-foreground: oklch(0.96 0.005 80);
  --primary: oklch(0.96 0.005 80);
  --primary-foreground: oklch(0.17 0.008 60);
  --ember: oklch(0.7 0.19 35);
  --ember-foreground: oklch(0.17 0.008 60);
  --secondary: oklch(0.26 0.008 60);
  --secondary-foreground: oklch(0.96 0.005 80);
  --muted: oklch(0.26 0.008 60);
  --muted-foreground: oklch(0.72 0.01 70);
  --accent: oklch(0.26 0.008 60);
  --accent-foreground: oklch(0.96 0.005 80);
  --destructive: oklch(0.7 0.2 27);
  --destructive-foreground: oklch(0.96 0.005 80);
  --success: oklch(0.72 0.14 155);
  --warning: oklch(0.8 0.16 75);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(0.7 0.19 35);
  --chart-1: oklch(0.7 0.19 35);
  --chart-2: oklch(0.78 0.02 80);
  --chart-3: oklch(0.8 0.14 75);
  --chart-4: oklch(0.65 0.1 200);
  --chart-5: oklch(0.72 0.14 155);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html, body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }
}

@layer components {
  .panel {
    @apply rounded-lg border border-border bg-card p-5 shadow-card;
  }

  .stamp {
    @apply text-xs font-semibold uppercase tracking-widest text-muted-foreground;
  }

  .stamp.text-ember {
    @apply text-ember;
  }

  .button-primary {
    @apply inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 
           text-sm font-medium text-ember-foreground shadow-ember 
           transition-transform hover:-translate-y-0.5 
           active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .button-secondary {
    @apply inline-flex items-center gap-2 rounded-lg border border-border 
           bg-surface px-5 py-3 text-sm font-medium text-foreground 
           transition-colors hover:bg-surface-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .button-ghost {
    @apply inline-flex items-center gap-2 rounded-md text-sm font-medium 
           text-foreground transition-colors hover:bg-accent
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .input-base {
    @apply w-full rounded-md border border-input bg-background px-3 py-2 
           text-sm placeholder:text-muted-foreground 
           focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .badge {
    @apply inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 
           text-xs font-medium text-foreground;
  }

  .badge-outline {
    @apply inline-flex items-center gap-1 rounded-full border border-border 
           bg-transparent px-3 py-1 text-xs font-medium text-muted-foreground;
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(
      90deg,
      var(--background) 0%,
      var(--surface) 50%,
      var(--background) 100%
    );
    background-size: 1000px 100%;
  }
}
```

### Add Fonts to HTML
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<script>
  const stored = localStorage.getItem('app-theme');
  const prefers = stored === 'dark' || 
    (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (prefers) {
    document.documentElement.classList.add('dark');
  }
</script>
```

---

## 🎨 Design Philosophy

### **Paper & Ink Foundation**
Clean, minimal aesthetic inspired by print design. Warm paper backgrounds with rich ink text.
- **Light**: Warm paper (#f5f3ee) with ink text (#1a1a1a)
- **Dark**: Deep charcoal backgrounds with crisp white text
- Creates approachable, professional look with high contrast

### **Functional Color Hierarchy**
Colors serve a purpose, never arbitrary.
- **Primary**: Ink (text, primary actions)
- **Accent/Ember**: Vibrant rust/orange (#e85d3a) for emphasis
- **Semantic**: Success (green), Warning (yellow), Destructive (red)

### **Clarity Over Decoration**
- Minimal borders (only where necessary)
- Generous whitespace
- Typography hierarchy for distinction
- Subtle shadows for depth

### **Accessibility First**
- OKLCH color space for consistent perceptual lightness
- WCAG AA+ contrast ratios
- Clear focus states
- Semantic HTML & ARIA labels

### **Mac-First Sensibility**
- Inspired by Apple design language
- Spacious, purposeful layout
- Smooth animations
- Backdrop blur for layered UIs

---

## 🎯 Color System

### **Light Mode**
```css
--background: #f5f3ee      (warm paper)
--foreground: #1a1a1a      (ink black)
--surface: #fdfbf7         (lighter paper)
--surface-2: #e8e4dd       (sand)
--ember: #e85d3a           (rust/orange accent)
--success: #4a9d6f         (green)
--warning: #c4a938         (yellow)
--destructive: #c1272d     (red)
--border: #e0ddd6          (subtle gray)
```

### **Dark Mode**
```css
--background: #2b2825      (deep charcoal)
--foreground: #f5f3f0      (near white)
--surface: #363029         (dark)
--surface-2: #423a32       (darker)
--ember: #e85d3a           (same accent)
--success: #6bb987         (lighter green)
--warning: #d4b74e         (lighter yellow)
--destructive: #e65a60     (lighter red)
--border: #ffffff / 10%    (opacity border)
```

### **Color Usage**
| Token | Usage |
|-------|-------|
| `--color-foreground` | Primary text |
| `--color-muted-foreground` | Secondary text, hints |
| `--color-surface` | Cards, panels, backgrounds |
| `--color-ember` | CTAs, accents, highlights |
| `--color-success` | Positive feedback |
| `--color-warning` | Caution, alerts |
| `--color-destructive` | Dangerous actions, errors |
| `--color-border` | Dividers, separators |

---

## 🔤 Typography

### **Font Stack**
```css
Display (headings): Space Grotesk
Body text:         DM Sans
Code/Mono:         JetBrains Mono
```

### **Heading Sizes**
```
h1  →  text-5xl sm:text-6xl md:text-7xl    (56-112px)
h2  →  text-3xl sm:text-4xl md:text-5xl    (30-56px)
h3  →  text-2xl sm:text-3xl                (24-36px)
h4  →  text-xl sm:text-2xl                 (20-28px)
h5  →  text-lg sm:text-xl                  (18-20px)
h6  →  text-base sm:text-lg                (16-18px)
```

All headings use:
- `font-display` (Space Grotesk)
- `font-semibold` or higher
- `letter-spacing: -0.02em` (tight)

### **Body Text**
```
Large:   text-lg (18px)
Default: text-base (16px)
Small:   text-sm (14px)
Tiny:    text-xs (12px)
```

All use `font-sans` with `line-height: 1.6`

### **Special Styles**
```
Muted text:  text-muted-foreground
Code:        font-mono text-sm
Labels:      text-xs font-medium uppercase tracking-widest
```

---

## 📏 Spacing & Sizing

### **Border Radius**
```
rounded-sm   →  10px
rounded      →   6px
rounded-md   →  12px
rounded-lg   →  14px  (default for cards)
rounded-xl   →  18px
rounded-2xl  →  22px
rounded-3xl  →  26px
rounded-full →  9999px
```

### **Spacing Scale**
```
gap-1  →  4px    (between small items)
gap-2  →  8px    (compact spacing)
gap-3  →  12px   (standard spacing)
gap-4  →  16px   (comfortable spacing)
gap-6  →  24px   (generous spacing)

p-4  →  16px     (standard padding)
p-5  →  20px     (card padding)
p-6  →  24px     (large padding)
```

### **Component Sizing**
```
Buttons:     h-9 (36px) default
Icons:       h-4 w-4 (16px) default
Inputs:      h-9, h-10
Headers:     h-14 (56px)
```

### **Container Widths**
```
max-w-2xl  →  672px    (narrow content)
max-w-4xl  →  896px    (normal content)
max-w-6xl  →  1280px   (wide content)
max-w-7xl  →  1440px   (extra wide)
```

---

## 🌟 Shadows & Elevation

### **Shadow System**
```css
/* Subtle - background elements */
--shadow-soft: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);

/* Standard - cards, panels */
--shadow-card: 0 1px 0 rgba(0,0,0,0.04), 0 8px 28px -8px rgba(0,0,0,0.08);

/* Emphasis - accent buttons */
--shadow-ember: 0 10px 40px -12px rgba(232, 93, 58, 0.35);
```

### **Usage**
```
No shadow    → Flat, default
shadow-soft  → Subtle separation
shadow-card  → Standard cards, modals
shadow-ember → Prominent CTAs
```

---

## 🧩 Component Patterns

### **Primary Button**
```tsx
<button className="button-primary">
  Primary Action
</button>
```
- Ember background with shadow
- Hover: lifts up (-translate-y-0.5)
- Use for main CTAs

### **Secondary Button**
```tsx
<button className="button-secondary">
  Secondary Action
</button>
```
- Surface background with border
- Use for non-primary actions

### **Ghost Button**
```tsx
<button className="button-ghost">
  Minimal Action
</button>
```
- Text only
- Use for tertiary actions

### **Card/Panel**
```tsx
<div className="panel">
  <h3 className="font-display text-lg font-semibold">Title</h3>
  <p className="mt-2 text-sm text-muted-foreground">Description</p>
</div>
```
- Includes: rounded, border, background, padding, shadow
- Use for grouping content

### **Badge**
```tsx
<span className="badge">Label</span>
<span className="badge-outline">Label</span>
```
- Small, pill-shaped labels
- Filled or outline variants

### **Stamp/Kicker**
```tsx
<p className="stamp text-ember">Category</p>
```
- Uppercase, small text
- Used before section titles
- Can add `text-ember` for color

### **Form Input**
```tsx
<input className="input-base" placeholder="Text..." />
<textarea className="input-base" />
```
- Consistent styling for inputs/textareas
- Focus ring included

---

## 🌓 Theme System

### **Theme Toggle**
```tsx
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app-theme');
    const prefers = stored === 'dark';
    setDark(prefers);
    document.documentElement.classList.toggle('dark', prefers);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('app-theme', next ? 'dark' : 'light');
  }

  return (
    <button onClick={toggle} className="h-9 w-9 inline-flex items-center 
      justify-center rounded-md hover:bg-accent transition-colors">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
```

### **Customizing Colors**
Override CSS variables in `:root` or `.dark`:
```css
:root {
  --ember: oklch(0.6 0.2 260); /* Change to blue */
  --radius: 0.5rem; /* More rounded */
}
```

---

## 📱 Responsive Design

### **Breakpoints**
```
Mobile first (no prefix)
sm  →  640px   (small devices)
md  →  768px   (tablets)
lg  →  1024px  (desktops)
xl  →  1280px  (large screens)
2xl →  1536px  (extra large)
```

### **Common Patterns**
```tsx
/* Hide on mobile */
<div className="hidden md:block">Desktop only</div>

/* Responsive text */
<h1 className="text-3xl md:text-5xl lg:text-6xl">Heading</h1>

/* Responsive grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {items}
</div>

/* Responsive spacing */
<div className="px-4 sm:px-6 md:px-8 lg:px-12">Content</div>

/* Stack on mobile, side-by-side on desktop */
<div className="flex flex-col md:flex-row gap-4">
  {content}
</div>
```

---

## 🛠️ Implementation Guide

### **vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), react(), tsconfigPaths()],
});
```

### **index.html**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f5f3ee" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <title>App Name</title>
    <script>
      const stored = localStorage.getItem('app-theme');
      const prefers = stored === 'dark' || 
        (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (prefers) {
        document.documentElement.classList.add('dark');
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 💻 Complete Code Examples

### **Header Component**
```tsx
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const;

export function Header() {
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background font-display font-semibold">
            A
          </span>
          <span className="hidden sm:inline font-display text-[15px] font-semibold tracking-tight">
            App Name
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                loc.pathname === n.to
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="button-primary hidden sm:inline-flex text-xs px-3 py-1.5">
            Sign Up
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface/50 backdrop-blur-sm">
          <nav className="flex flex-col gap-1 px-5 py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
```

### **Form Components**
```tsx
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

interface TextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  type = 'text',
}: TextInputProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
      />
    </FormField>
  );
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  rows = 4,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <FormField label={label} error={error} required={required}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="input-base"
      />
    </FormField>
  );
}
```

### **Button Component**
```tsx
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-ember text-ember-foreground shadow-ember hover:-translate-y-0.5',
    secondary: 'border border-border bg-surface text-foreground hover:bg-surface-2',
    ghost: 'text-foreground hover:bg-accent',
    destructive: 'bg-destructive text-destructive-foreground shadow-ember hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
```

### **Hero Section**
```tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="stamp text-ember">Your Category</p>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-display font-semibold leading-[1.02]">
            Your compelling <span className="italic text-ember">headline</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground">
            Supporting description explaining your value proposition goes here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/start" className="button-primary">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="button-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### **Feature Grid**
```tsx
import { ReactNode } from 'react';

interface FeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureGrid({ features }: { features: FeatureProps[] }) {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="stamp text-ember">Features</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-semibold">
          Everything you need
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="panel">
              <div className="text-ember">{f.icon}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### **Modal**
```tsx
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex gap-3 justify-end">{footer}</div>}
      </div>
    </>
  );
}
```

---

## 📖 Quick Reference Cheat Sheet

### Button Patterns
```tsx
/* Primary - Main CTA */
<button className="button-primary">Action</button>

/* Secondary - Non-primary */
<button className="button-secondary">Action</button>

/* Ghost - Minimal */
<button className="button-ghost">Action</button>

/* With Icon */
<button className="button-primary">
  <Icon className="h-4 w-4" />
  Text
</button>
```

### Card Patterns
```tsx
/* Basic Card */
<div className="panel">Content</div>

/* Interactive Card */
<article className="panel transition-transform hover:-translate-y-0.5">
  Clickable content
</article>

/* Card with Header */
<div className="panel">
  <div className="flex items-start justify-between">
    <h3 className="font-display text-lg font-semibold">Title</h3>
    <span className="stamp">Badge</span>
  </div>
  <p className="mt-2 text-sm text-muted-foreground">Content</p>
</div>
```

### Grid Patterns
```tsx
/* Two Column */
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

/* Three Column */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

/* Four Column */
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

### Container Patterns
```tsx
/* Centered Content */
<div className="mx-auto max-w-6xl px-5">

/* Full Width */
<div className="w-full">

/* Two Column Layout */
<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
  <aside className="md:col-span-1">Sidebar</aside>
  <main className="md:col-span-3 lg:col-span-4">Content</main>
</div>
```

### Section Patterns
```tsx
/* With Kicker */
<section>
  <p className="stamp text-ember">Category</p>
  <h2 className="mt-2 text-4xl font-display font-semibold">Title</h2>
  {/* Content */}
</section>

/* With Background */
<section className="border-b border-border bg-surface py-20">
  {/* Content */}
</section>

/* Full Width */
<section className="border-b border-border py-20">
  <div className="mx-auto max-w-6xl px-5">
    {/* Content */}
  </div>
</section>
```

### Responsive Patterns
```tsx
/* Hide on Mobile */
<div className="hidden md:block">Desktop only</div>

/* Show on Mobile */
<div className="md:hidden">Mobile only</div>

/* Responsive Spacing */
<div className="px-4 sm:px-6 md:px-8 lg:px-12">

/* Responsive Text */
<h1 className="text-3xl md:text-5xl lg:text-6xl">

/* Flex Direction */
<div className="flex flex-col md:flex-row gap-4">

/* Justify Between */
<div className="flex items-end justify-between gap-6">
```

### Color Usage
```tsx
/* Text */
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>

/* Background */
<div className="bg-surface">Light background</div>
<div className="bg-surface-2">Darker background</div>

/* Accent */
<button className="bg-ember text-ember-foreground">

/* Status */
<span className="text-success">Success</span>
<span className="text-warning">Warning</span>
<span className="text-destructive">Error</span>
```

---

## ♿ Accessibility

### **Essential Features**

**Semantic HTML**
```tsx
<nav>Navigation</nav>
<main>Main content</main>
<footer>Footer</footer>
<article>Article content</article>
<button>Button</button>
<a href="">Link</a>
```

**Form Accessibility**
```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />

<label htmlFor="message">Message</label>
<textarea id="message"></textarea>
```

**Icon Button Labels**
```tsx
<button aria-label="Close menu">
  <X className="h-4 w-4" />
</button>

<button aria-label="Toggle theme">
  {dark ? <Sun /> : <Moon />}
</button>
```

**Keyboard Focus**
```css
focus:outline-none focus:ring-2 focus:ring-ring/20
```

**ARIA Attributes**
```tsx
aria-label="Description"
aria-busy={loading}
aria-disabled={disabled}
aria-expanded={open}
aria-hidden="true"
```

**Color Contrast**
- All text meets WCAG AA standards
- Don't rely on color alone for information
- Use icons + text, not just color

### **Accessibility Checklist**

- [ ] All interactive elements keyboard accessible
- [ ] Focus states clearly visible
- [ ] Color contrast meets WCAG AA
- [ ] Semantic HTML elements used
- [ ] ARIA labels for icon buttons
- [ ] Form labels properly associated
- [ ] Alt text for meaningful images
- [ ] Logical page structure
- [ ] No automatic media playback
- [ ] Text resizable without loss

---

## ✨ Best Practices

### **DO**
✅ Use CSS variables for all colors
✅ Include transitions on interactive elements
✅ Use `gap` for spacing (not margins on children)
✅ Use semantic HTML
✅ Test dark mode during development
✅ Keep components flat and composable
✅ Use consistent padding: `p-4`, `p-5`, `px-4 py-3`
✅ Mobile-first approach: base styles → `md:` → `lg:`
✅ Include focus states and hover states
✅ Leverage existing component patterns

### **DON'T**
❌ Use multiple shades of colors (use surfaces/surface-2)
❌ Forget transition states (hover, focus, active)
❌ Add borders everywhere (use background colors instead)
❌ Mix margin and gap for spacing
❌ Use color hex values directly (use CSS variables)
❌ Create custom colors (reuse existing tokens)
❌ Forget accessibility attributes
❌ Over-engineer components
❌ Create one-off styles (reuse patterns)
❌ Hardcode responsive breakpoints

---

## 📊 Token Reference

### All CSS Variables
```
Colors:
  --color-background
  --color-foreground
  --color-surface
  --color-surface-2
  --color-card
  --color-card-foreground
  --color-primary
  --color-primary-foreground
  --color-ember
  --color-ember-foreground
  --color-secondary
  --color-secondary-foreground
  --color-muted
  --color-muted-foreground
  --color-accent
  --color-accent-foreground
  --color-destructive
  --color-destructive-foreground
  --color-success
  --color-warning
  --color-border
  --color-input
  --color-ring
  --color-chart-1 through 5

Typography:
  --font-sans
  --font-display
  --font-mono

Spacing:
  --radius
  --radius-sm
  --radius-md
  --radius-lg
  --radius-xl
  --radius-2xl
  --radius-3xl

Shadows:
  --shadow-soft
  --shadow-card
  --shadow-ember
```

### Utility Classes
```css
.panel              /* Card with border, shadow, padding */
.stamp              /* Uppercase label */
.button-primary     /* Primary CTA button */
.button-secondary   /* Secondary button */
.button-ghost       /* Minimal button */
.input-base         /* Form input styling */
.badge              /* Filled badge */
.badge-outline      /* Outline badge */
.animate-shimmer    /* Loading shimmer animation */
```

---

## 🎓 Development Tips

1. **Start mobile-first** - Add base styles first, then `md:`, `lg:`
2. **Use CSS variables** - Never hardcode colors or values
3. **Leverage gap** - For spacing between items (not margins)
4. **Include transitions** - All interactive elements should animate
5. **Test dark mode** - Enable during development
6. **Keep it semantic** - Use correct HTML elements
7. **Reuse patterns** - Use the patterns in this guide
8. **Consistent spacing** - Follow the spacing scale
9. **Focus visibility** - Always show keyboard focus
10. **Component isolation** - Keep components self-contained

---

## 📚 Resources

- **Tailwind CSS v4**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **OKLCH Colors**: https://oklch.com
- **Web Accessibility**: https://www.w3.org/WAI/
- **React Router**: https://reactrouter.com
- **Zustand**: https://zustand.dev

---

## 🚀 Getting Started in 5 Minutes

1. **Copy this file** to your new project
2. **Copy the CSS** from Quick Start section above
3. **Install dependencies**: `npm install tailwindcss react lucide-react`
4. **Add fonts** from HTML section
5. **Start building** using the component examples

That's it! You now have a complete, professional design system ready to go. 🎨

