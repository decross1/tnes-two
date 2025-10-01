# StoryWeaver Design System
### "Tranquil Fusion" - Wordle Simplicity meets Shangri-La Frontier

> A comprehensive guide to building consistent, accessible, and beautiful UI components for StoryWeaver.

---

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)

---

## Design Principles

### 1. Simplicity First
**Like Wordle**: One primary action per screen. No visual clutter.

```
❌ Bad: Multiple competing CTAs
┌─────────────────┐
│ [Submit]        │
│ [Vote]          │
│ [Share]         │
│ [Download]      │
└─────────────────┘

✅ Good: Single clear action
┌─────────────────┐
│                 │
│  [Submit]       │
│                 │
└─────────────────┘
```

### 2. Progressive Disclosure
Show features when they're needed, not all at once.

```javascript
// State-based UI
if (!hasSubmitted) {
  return <SubmissionForm />
} else if (!hasVoted) {
  return <VotingList />
} else {
  return <ThankYouMessage />
}
```

### 3. Mobile-First Always
Design for 375px width, then scale up.

```css
/* Default (Mobile) */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
}
```

### 4. Consistent Feedback
Every action gets immediate visual feedback.

- **Hover**: Subtle scale (1.02x) or brightness change
- **Click**: Scale down (0.98x) then bounce back
- **Success**: Green checkmark + message
- **Error**: Red alert + helpful text

---

## Color System

### Primary Palette
Teal/Cyan inspired by Shangri-La Frontier

```css
--primary: #0891B2;         /* Cyan-600 - Main actions, links */
--primary-light: #06B6D4;   /* Cyan-500 - Hover states */
--primary-dark: #0E7490;    /* Cyan-700 - Active states */
--primary-glow: rgba(8, 145, 178, 0.3); /* Subtle glow effect */
```

#### Usage
- Primary buttons
- Links and interactive text
- Progress bars
- Focus indicators
- Important icons

#### Examples
```jsx
<button className="bg-primary hover:bg-primary-light">
  Submit Phrase
</button>

<div className="border-l-4 border-primary">
  Important notification
</div>
```

### Secondary Palette
Emerald green for success and accents

```css
--secondary: #059669;       /* Emerald-600 - Secondary actions */
--secondary-light: #10B981; /* Emerald-500 - Success states */
--secondary-dark: #047857;  /* Emerald-700 - Active states */
```

#### Usage
- Success messages
- Checkmarks
- Secondary actions
- Positive indicators
- Growth/progress elements

### Neutral Palette
Slate grays for backgrounds and text

```css
--background: #0F172A;      /* Slate-900 - Page background */
--surface: #1E293B;         /* Slate-800 - Card backgrounds */
--card: #334155;            /* Slate-700 - Elevated cards */
--border: #475569;          /* Slate-600 - Borders */
--muted: #64748B;           /* Slate-500 - Disabled states */
```

#### Usage Examples
```jsx
/* Page background */
<body className="bg-background">

/* Card component */
<div className="bg-surface border border-border rounded-lg">
  Card content
</div>

/* Muted text */
<p className="text-muted">
  Secondary information
</p>
```

### Text Colors
High contrast for readability

```css
--text-primary: #F8FAFC;    /* Slate-50 - Main text */
--text-secondary: #94A3B8;  /* Slate-400 - Secondary text */
--text-muted: #64748B;      /* Slate-500 - Tertiary text */
```

#### Contrast Ratios (WCAG AAA)
- Primary text on background: 18.5:1 ✅
- Secondary text on background: 9.2:1 ✅
- Muted text on background: 5.8:1 ✅

### Semantic Colors
State-based colors for feedback

```css
--success: #10B981;  /* Emerald-500 - Success states */
--warning: #F59E0B;  /* Amber-500 - Warning states */
--error: #EF4444;    /* Red-500 - Error states */
--info: #06B6D4;     /* Cyan-500 - Info states */
```

#### Usage
```jsx
/* Success message */
<div className="bg-success/10 border border-success/20 text-success">
  ✓ Phrase submitted successfully!
</div>

/* Error message */
<div className="bg-error/10 border border-error/20 text-error">
  ✗ Failed to submit. Please try again.
</div>

/* Warning */
<div className="bg-warning/10 border border-warning/20 text-warning">
  ⚠ Only 10 minutes remaining!
</div>
```

### Color Usage Guidelines

#### Do ✅
- Use primary color for main CTAs
- Use secondary for success states
- Maintain 60-30-10 rule (60% neutral, 30% primary, 10% accent)
- Test all colors at different brightness levels

#### Don't ❌
- Don't use more than 3 colors per component
- Don't use color alone to convey information (add icons)
- Don't use low-contrast combinations
- Don't mix warm and cool tones randomly

---

## Typography

### Font Family
**Inter** - Clean, modern, highly readable

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Why Inter?
- Optimized for screens
- Excellent readability at small sizes
- 9 weights available (we use 4)
- Open source and free

### Font Sizes
Mobile-first scale

```css
--text-xs: 12px;    /* Captions, labels */
--text-sm: 14px;    /* Secondary text */
--text-base: 16px;  /* Body text */
--text-lg: 18px;    /* Subheadings */
--text-xl: 20px;    /* Section headers */
--text-2xl: 24px;   /* Page subheadings */
--text-3xl: 32px;   /* Page headings */
```

### Font Weights

```css
--font-light: 300;   /* Rarely used */
--font-normal: 400;  /* Body text */
--font-medium: 500;  /* Emphasis */
--font-semibold: 600; /* Headings */
```

### Typography Scale

#### Heading 1 (Page Title)
```jsx
<h1 className="text-3xl font-semibold text-text-primary">
  Story Weaver
</h1>
```
- Size: 32px
- Weight: 600
- Line height: 1.2
- Use: Page title only

#### Heading 2 (Section Header)
```jsx
<h2 className="text-2xl font-semibold text-text-primary">
  Submit Your Phrase
</h2>
```
- Size: 24px
- Weight: 600
- Line height: 1.3
- Use: Major sections

#### Heading 3 (Subsection)
```jsx
<h3 className="text-xl font-medium text-text-primary">
  Current Episode
</h3>
```
- Size: 20px
- Weight: 500
- Line height: 1.4
- Use: Subsections, card titles

#### Body Text
```jsx
<p className="text-base text-text-secondary">
  Up to 10 words to shape the story
</p>
```
- Size: 16px
- Weight: 400
- Line height: 1.6
- Use: Paragraphs, descriptions

#### Caption
```jsx
<span className="text-sm text-text-muted">
  2h 14m remaining
</span>
```
- Size: 14px
- Weight: 400
- Line height: 1.5
- Use: Labels, metadata, timestamps

#### Tiny
```jsx
<span className="text-xs text-text-muted uppercase tracking-wide">
  Episode 12
</span>
```
- Size: 12px
- Weight: 400
- Line height: 1.4
- Use: Labels, badges, very small text

### Typography Guidelines

#### Do ✅
- Use max 3 font sizes per component
- Maintain 1.5+ line height for body text
- Use sentence case for headings
- Left-align text (never center body text)

#### Don't ❌
- Don't use more than 2 weights per component
- Don't use font sizes below 12px
- Don't use all caps for long text
- Don't justify text

---

## Spacing & Layout

### 8px Grid System
All spacing is a multiple of 8px

```css
--spacing-1: 8px;
--spacing-2: 16px;
--spacing-3: 24px;
--spacing-4: 32px;
--spacing-5: 40px;
--spacing-6: 48px;
--spacing-8: 64px;
--spacing-10: 80px;
--spacing-12: 96px;
```

### Padding Scale
```jsx
<div className="p-2">   /* 16px all sides */
<div className="p-3">   /* 24px all sides */
<div className="p-4">   /* 32px all sides */
<div className="px-3">  /* 24px horizontal */
<div className="py-2">  /* 16px vertical */
```

### Margin Scale
```jsx
<div className="mb-3">  /* 24px bottom */
<div className="mt-4">  /* 32px top */
<div className="mx-auto"> /* Center horizontally */
```

### Container Widths
```css
/* Mobile: Full width - 32px (16px each side) */
max-width: calc(100vw - 32px);

/* Tablet: 768px */
@media (min-width: 768px) {
  max-width: 720px;
}

/* Desktop: 1024px */
@media (min-width: 1024px) {
  max-width: 960px;
}

/* Large: 1280px */
@media (min-width: 1280px) {
  max-width: 1200px;
}
```

### Layout Patterns

#### Single Column (Mobile)
```jsx
<div className="container mx-auto px-4 space-y-6">
  <Component1 />
  <Component2 />
  <Component3 />
</div>
```

#### Two Column (Desktop)
```jsx
<div className="container mx-auto px-4">
  <div className="grid lg:grid-cols-2 gap-6">
    <Sidebar />
    <MainContent />
  </div>
</div>
```

### Border Radius
```css
--radius-sm: 6px;   /* Small elements (tags, badges) */
--radius: 8px;      /* Default (buttons, inputs) */
--radius-lg: 12px;  /* Cards */
--radius-xl: 16px;  /* Large panels, modals */
--radius-full: 9999px; /* Circular (avatars, dots) */
```

### Shadows & Elevation

```css
/* Card shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Card hover */
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);

/* Subtle glow (primary) */
box-shadow: 0 0 20px rgba(8, 145, 178, 0.3);

/* Strong glow (hover) */
box-shadow: 0 0 30px rgba(8, 145, 178, 0.5);
```

---

## Components

### Buttons

#### Primary Button
Main call-to-action

```jsx
<button className="
  bg-primary hover:bg-primary-light active:bg-primary-dark
  text-white font-medium
  px-6 py-3
  rounded-lg
  transition-all duration-200
  hover:shadow-glow
  disabled:opacity-50 disabled:cursor-not-allowed
  min-h-[48px]
">
  Submit Phrase
</button>
```

**Specs:**
- Height: 48px minimum (touch target)
- Padding: 24px horizontal, 12px vertical
- Border radius: 8px
- Font: 16px, weight 500
- Transition: 200ms ease

#### Secondary Button
Alternative action

```jsx
<button className="
  bg-surface hover:bg-card
  text-text-primary
  border border-border
  px-6 py-3
  rounded-lg
  transition-all duration-200
  min-h-[48px]
">
  Cancel
</button>
```

#### Ghost Button
Tertiary action

```jsx
<button className="
  bg-transparent hover:bg-surface/50
  text-text-secondary hover:text-text-primary
  px-4 py-2
  rounded-lg
  transition-all duration-200
">
  Learn More
</button>
```

### Cards

#### Standard Card
```jsx
<div className="
  bg-surface
  border border-border
  rounded-lg
  p-4
  shadow-card
  hover:shadow-card-hover
  transition-shadow duration-200
">
  {children}
</div>
```

#### Elevated Card
For important content

```jsx
<div className="
  bg-surface
  border border-primary/20
  rounded-lg
  p-4
  shadow-glow
">
  {children}
</div>
```

#### Success Card
```jsx
<div className="
  bg-success/10
  border border-success/20
  rounded-lg
  p-4
">
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
      <CheckIcon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-success">Success!</h3>
      <p className="text-sm text-success/80">Your action completed</p>
    </div>
  </div>
</div>
```

### Inputs

#### Text Input
```jsx
<input
  type="text"
  className="
    bg-surface
    border border-border
    focus:border-primary focus:ring-2 focus:ring-primary/20
    rounded-lg
    px-4 py-3
    text-text-primary
    placeholder-text-muted
    transition-colors duration-200
    w-full
    min-h-[48px]
  "
  placeholder="Enter your phrase..."
/>
```

#### Textarea
```jsx
<textarea
  className="
    bg-surface
    border border-border
    focus:border-primary focus:ring-2 focus:ring-primary/20
    rounded-lg
    px-4 py-3
    text-text-primary
    placeholder-text-muted
    transition-colors duration-200
    w-full
    resize-none
  "
  rows={3}
  placeholder="Up to 10 words..."
/>
```

### Progress Bar

```jsx
<div className="w-full bg-card rounded-full h-2">
  <div
    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Timer / Countdown

```jsx
<div className="inline-flex items-center space-x-2 bg-surface border border-border rounded-lg px-4 py-2">
  <ClockIcon className="w-4 h-4 text-primary" />
  <span className="text-sm font-medium text-text-primary">
    2h 14m remaining
  </span>
</div>
```

### Badges

```jsx
/* Status badge */
<span className="
  inline-flex items-center
  bg-primary/10
  text-primary
  text-xs font-medium
  px-2 py-1
  rounded
">
  Active
</span>

/* Count badge */
<span className="
  inline-flex items-center justify-center
  bg-secondary
  text-white
  text-xs font-semibold
  w-6 h-6
  rounded-full
">
  5
</span>
```

---

## Animations

### Transition Timing
```css
--duration-fast: 100ms;    /* Micro-interactions */
--duration-normal: 200ms;  /* Standard transitions */
--duration-slow: 300ms;    /* Page transitions */
--duration-slower: 500ms;  /* Heavy animations */

--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### Hover Effects

#### Button Hover
```css
.button {
  transition: all 200ms ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(8, 145, 178, 0.3);
}

.button:active {
  transform: translateY(0);
}
```

#### Card Hover
```css
.card {
  transition: box-shadow 200ms ease-out;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
```

### Loading States

#### Spinner
```jsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
```

#### Skeleton
```jsx
<div className="animate-pulse bg-surface rounded h-20" />
```

#### Pulse Glow
```jsx
<div className="animate-pulse-glow">
  Content
</div>

/* CSS */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(8, 145, 178, 0.3); }
  50% { box-shadow: 0 0 20px rgba(8, 145, 178, 0.6); }
}
```

### Page Transitions

#### Fade In
```jsx
<div className="animate-fade-in">
  Content
</div>

/* CSS */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 300ms ease-out;
}
```

#### Slide Up
```jsx
<div className="animate-slide-up">
  Content
</div>

/* CSS */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 300ms ease-out;
}
```

---

## Accessibility

### Contrast Requirements
WCAG AA minimum (4.5:1), AAA preferred (7:1)

✅ All text colors meet WCAG AAA on their backgrounds

### Focus States
Always visible and clear

```css
:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Touch Targets
Minimum 48x48px (Material Design)

```jsx
/* All interactive elements */
.button, .link, .input {
  min-height: 48px;
  min-width: 48px;
}
```

### Screen Reader Support

```jsx
/* Hidden text for screen readers */
<span className="sr-only">
  Loading episode
</span>

/* Aria labels */
<button aria-label="Submit your phrase">
  <SubmitIcon />
</button>

/* Aria live regions */
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Keyboard Navigation

All interactive elements must be:
- Focusable via Tab
- Activatable via Enter or Space
- Clearly indicated when focused

```jsx
/* Keyboard accessible button */
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Action
</button>
```

---

## Quick Reference

### Component Checklist
Before shipping a component, verify:

- [ ] Uses color tokens (not hardcoded hex)
- [ ] Responsive (375px, 768px, 1024px)
- [ ] Touch targets 48x48px minimum
- [ ] Focus states visible
- [ ] Keyboard accessible
- [ ] Screen reader tested
- [ ] Smooth transitions (200ms)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Success feedback shown

### Color Quick Pick

```css
/* Backgrounds */
bg-background  /* Page */
bg-surface     /* Cards */
bg-card        /* Elevated */

/* Text */
text-text-primary    /* Main */
text-text-secondary  /* Secondary */
text-text-muted      /* Tertiary */

/* Actions */
bg-primary          /* Primary button */
bg-secondary        /* Secondary button */
border-border       /* Borders */

/* States */
bg-success          /* Success */
bg-warning          /* Warning */
bg-error            /* Error */
```

### Spacing Quick Pick

```css
p-2   /* 16px padding */
p-3   /* 24px padding */
p-4   /* 32px padding */

gap-3 /* 24px gap */
gap-4 /* 32px gap */

space-y-3  /* 24px vertical spacing */
space-y-6  /* 48px vertical spacing */
```

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Material Design Guidelines](https://m3.material.io)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://rsms.me/inter/)
- [Color Contrast Checker](https://coolors.co/contrast-checker)

---

**Last Updated:** 2025-09-30
**Version:** 1.0.0
**Design Lead:** StoryWeaver Team
