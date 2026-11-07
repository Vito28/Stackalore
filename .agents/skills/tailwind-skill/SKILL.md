# FumaDocs Tailwind CSS Skill

## Purpose

This skill defines Tailwind CSS conventions and visual design rules for **FumaDocs**.

FumaDocs is an interactive computer science documentation platform covering:

* Data Structures & Algorithms
* Machine Learning
* Deep Learning
* Cryptography

The interface must feel:

* modern
* clean
* technical
* minimal
* premium
* highly readable
* interactive without becoming visually noisy

FumaDocs is primarily a **documentation and learning interface**, not a generic SaaS dashboard.

---

# Core Stack Assumptions

The project uses:

* Next.js
* TypeScript
* React
* Tailwind CSS v4
* Fumadocs
* MDX
* Motion
* React Flow
* Monaco Editor where required

Do not introduce additional styling libraries unless there is a clear technical requirement.

---

# 1. Core Design Philosophy

The default interface should remain neutral.

Use:

* white
* black
* zinc/neutral gray
* subtle borders
* typography hierarchy
* whitespace

Color is primarily reserved for:

* visualization state
* code execution state
* status
* focus
* badges
* interactive feedback
* documentation domain identification

Do not turn every section into a colored surface.

The visual hierarchy should generally be:

```text
Neutral UI
    ↓
Subtle interaction
    ↓
Semantic color
    ↓
Glow only for important active states
```

---

# 2. Fumadocs Base Colors

For normal UI surfaces, prefer existing Fumadocs semantic utilities.

Examples:

```tsx
bg-fd-background
text-fd-foreground

bg-fd-muted
text-fd-muted-foreground

border-fd-border

bg-fd-card
text-fd-card-foreground

bg-fd-accent
text-fd-accent-foreground
```

Do not repeatedly hardcode:

```tsx
bg-white dark:bg-zinc-950
```

when the element is supposed to follow the global Fumadocs theme.

Prefer:

```tsx
bg-fd-background
```

This keeps light/dark mode consistent.

---

# 3. Custom FumaDocs Semantic Colors

Add custom colors specifically for interactive learning experiences.

These colors have **meaning**.

Do not randomly interchange them.

## Visualization State Palette

| State            | Color   | Meaning                    |
| ---------------- | ------- | -------------------------- |
| Current / Active | Cyan    | Current algorithm position |
| Selected         | Blue    | User selection             |
| Compare          | Amber   | Comparing values           |
| Transform        | Violet  | Swap/change/transformation |
| Success / Found  | Emerald | Correct/found/completed    |
| Error / Invalid  | Rose    | Error/invalid state        |
| Muted            | Neutral | Inactive/unvisited         |

Recommended colors:

```text
Current
#22D3EE

Selected
#3B82F6

Compare
#F59E0B

Transform
#8B5CF6

Success
#10B981

Danger
#F43F5E
```

---

# 4. Domain Accent Colors

The four documentation domains can have subtle identities.

```text
Data Structures & Algorithms
Cyan
#06B6D4

Machine Learning
Emerald
#10B981

Deep Learning
Violet
#8B5CF6

Cryptography
Amber
#F59E0B
```

Use domain colors for:

* small icons
* badges
* tiny labels
* visualization accents
* active navigation indicator
* subtle hover states

Do NOT make entire documentation pages cyan, green, violet, or amber.

---

# 5. Add Theme Tokens

Add these after the Fumadocs imports inside the project's global CSS.

Example:

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";

@theme {
  /* Visualization states */

  --color-viz-current: #22d3ee;
  --color-viz-selected: #3b82f6;
  --color-viz-compare: #f59e0b;
  --color-viz-transform: #8b5cf6;
  --color-viz-success: #10b981;
  --color-viz-danger: #f43f5e;

  /* Documentation domains */

  --color-domain-dsa: #06b6d4;
  --color-domain-ml: #10b981;
  --color-domain-dl: #8b5cf6;
  --color-domain-crypto: #f59e0b;

  /* Glow */

  --shadow-glow-current:
    0 0 0 1px rgb(34 211 238 / 0.18),
    0 0 24px rgb(34 211 238 / 0.18);

  --shadow-glow-selected:
    0 0 0 1px rgb(59 130 246 / 0.18),
    0 0 24px rgb(59 130 246 / 0.18);

  --shadow-glow-compare:
    0 0 0 1px rgb(245 158 11 / 0.2),
    0 0 24px rgb(245 158 11 / 0.18);

  --shadow-glow-transform:
    0 0 0 1px rgb(139 92 246 / 0.2),
    0 0 28px rgb(139 92 246 / 0.2);

  --shadow-glow-success:
    0 0 0 1px rgb(16 185 129 / 0.18),
    0 0 24px rgb(16 185 129 / 0.18);

  --shadow-glow-danger:
    0 0 0 1px rgb(244 63 94 / 0.2),
    0 0 24px rgb(244 63 94 / 0.18);
}
```

This should allow semantic utilities such as:

```tsx
bg-viz-current
text-viz-current
border-viz-current
ring-viz-current

shadow-glow-current
```

---

# 6. Glow System

Glow is allowed, but it must remain controlled.

Glow represents:

* current execution
* focus
* transformation
* result
* important interactive state

Glow is NOT generic decoration.

---

## Good

```tsx
<div
  className="
    border border-viz-current/30
    bg-viz-current/5
    shadow-glow-current
  "
>
  Current Node
</div>
```

## Bad

```tsx
<div className="shadow-[0_0_80px_30px_#00ffff]">
  Documentation
</div>
```

Never use huge neon cyberpunk glows across normal documentation UI.

---

# 7. Glow Strength

Use three conceptual levels.

## Level 0 — None

Normal UI.

```tsx
border-fd-border
bg-fd-background
```

---

## Level 1 — Subtle

Hover or secondary active state.

```tsx
border-viz-current/20
bg-viz-current/5
```

---

## Level 2 — Active Glow

Current execution state.

```tsx
border-viz-current/40
bg-viz-current/10
shadow-glow-current
```

---

## Level 3 — Strong

Reserved for very short moments such as:

* algorithm found target
* successful final result
* node activation animation

Do not leave Level 3 glow permanently visible.

---

# 8. Algorithm State Examples

## Normal Array Element

```tsx
className="
  flex size-12 items-center justify-center
  rounded-lg
  border border-fd-border
  bg-fd-background
  font-mono text-sm
  text-fd-foreground
"
```

---

## Current Element

```tsx
className="
  flex size-12 items-center justify-center
  rounded-lg
  border border-viz-current/40
  bg-viz-current/10
  font-mono text-sm
  text-viz-current
  shadow-glow-current
"
```

---

## Comparing

```tsx
className="
  border-viz-compare/50
  bg-viz-compare/10
  text-viz-compare
  shadow-glow-compare
"
```

---

## Swapping / Transforming

```tsx
className="
  border-viz-transform/50
  bg-viz-transform/10
  text-viz-transform
  shadow-glow-transform
"
```

---

## Found

```tsx
className="
  border-viz-success/50
  bg-viz-success/10
  text-viz-success
  shadow-glow-success
"
```

---

## Error

```tsx
className="
  border-viz-danger/40
  bg-viz-danger/10
  text-viz-danger
"
```

---

# 9. Badge System

Badges should be:

* compact
* low contrast by default
* semantic
* readable
* never oversized
* not used everywhere

Standard badge shape:

```tsx
inline-flex
h-6
items-center
gap-1.5
rounded-full
border
px-2.5
text-xs
font-medium
```

Avoid:

```tsx
rounded-xl px-5 py-3
```

That is no longer a badge.

---

# 10. Neutral Badge

Use for metadata.

Examples:

* Beginner
* 8 min read
* Theory
* Notes

```tsx
<span
  className="
    inline-flex h-6 items-center rounded-full
    border border-fd-border
    bg-fd-muted/50
    px-2.5
    text-xs font-medium
    text-fd-muted-foreground
  "
>
  Beginner
</span>
```

---

# 11. Domain Badges

## Data Structures

```tsx
<span
  className="
    inline-flex h-6 items-center rounded-full
    border border-domain-dsa/20
    bg-domain-dsa/10
    px-2.5
    text-xs font-medium
    text-domain-dsa
  "
>
  Data Structures
</span>
```

---

## Machine Learning

```tsx
<span
  className="
    inline-flex h-6 items-center rounded-full
    border border-domain-ml/20
    bg-domain-ml/10
    px-2.5
    text-xs font-medium
    text-domain-ml
  "
>
  Machine Learning
</span>
```

---

## Deep Learning

```tsx
<span
  className="
    inline-flex h-6 items-center rounded-full
    border border-domain-dl/20
    bg-domain-dl/10
    px-2.5
    text-xs font-medium
    text-domain-dl
  "
>
  Deep Learning
</span>
```

---

## Cryptography

```tsx
<span
  className="
    inline-flex h-6 items-center rounded-full
    border border-domain-crypto/20
    bg-domain-crypto/10
    px-2.5
    text-xs font-medium
    text-domain-crypto
  "
>
  Cryptography
</span>
```

---

# 12. Status Badges

Semantic status badges use visualization colors.

## Running

```tsx
border-viz-current/20
bg-viz-current/10
text-viz-current
```

Label:

```text
Running
```

---

## Comparing

```tsx
border-viz-compare/20
bg-viz-compare/10
text-viz-compare
```

---

## Completed

```tsx
border-viz-success/20
bg-viz-success/10
text-viz-success
```

---

## Failed

```tsx
border-viz-danger/20
bg-viz-danger/10
text-viz-danger
```

---

# 13. Badge Glow Rule

Badges normally DO NOT glow.

Bad:

```tsx
<Badge className="shadow-glow-current">
  Machine Learning
</Badge>
```

Good:

```tsx
<Badge className="border-domain-ml/20 bg-domain-ml/10 text-domain-ml">
  Machine Learning
</Badge>
```

Glow may be used only for temporary live states such as:

```text
Running
Live
Executing
Current
```

Even then, prefer a glowing indicator dot instead of glowing the entire badge.

Example:

```tsx
<span className="
  inline-flex h-6 items-center gap-1.5
  rounded-full border border-viz-current/20
  bg-viz-current/5 px-2.5
  text-xs text-viz-current
">
  <span
    className="
      size-1.5 rounded-full
      bg-viz-current
      shadow-glow-current
    "
  />

  Running
</span>
```

---

# 14. Dot Indicators

Prefer dot indicators for small live states.

```tsx
<span className="size-1.5 rounded-full bg-viz-success" />
```

Examples:

```text
● Ready
● Running
● Completed
● Failed
```

Mappings:

```text
Ready       → neutral
Running     → cyan
Waiting     → amber
Completed   → emerald
Failed      → rose
```

---

# 15. Buttons

Buttons should remain simple.

Do not create glossy gradient buttons.

---

## Primary

```tsx
className="
  inline-flex h-9 items-center justify-center
  rounded-lg
  bg-fd-primary
  px-4
  text-sm font-medium
  text-fd-primary-foreground
  transition-colors
  hover:opacity-90
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-fd-ring
"
```

---

## Secondary

```tsx
className="
  inline-flex h-9 items-center justify-center
  rounded-lg
  border border-fd-border
  bg-fd-background
  px-4
  text-sm font-medium
  text-fd-foreground
  transition-colors
  hover:bg-fd-accent
"
```

---

## Execution Button

Run-code and simulation actions may use semantic accents.

```tsx
className="
  inline-flex h-9 items-center gap-2
  rounded-lg
  border border-viz-current/30
  bg-viz-current/10
  px-4
  text-sm font-medium
  text-viz-current
  transition-all
  hover:bg-viz-current/15
  hover:shadow-glow-current
"
```

Do not permanently apply strong glow.

---

# 16. Cards

Avoid defaulting to cards for everything.

Before creating a card, ask:

> Does this information genuinely require a bounded container?

Prefer:

```text
Typography
Whitespace
Divider
Columns
Rows
```

over:

```text
Card
Card
Card
Card
```

---

## Standard Panel

When a bounded surface is necessary:

```tsx
className="
  rounded-xl
  border border-fd-border
  bg-fd-card
"
```

Use little or no shadow.

---

## Interactive Panel

```tsx
className="
  rounded-xl
  border border-fd-border
  bg-fd-card
  transition-colors
  hover:border-fd-foreground/15
"
```

Do not automatically add:

```tsx
shadow-xl
```

to every panel.

---

# 17. Border Radius

Keep radius controlled.

Recommended:

```text
small controls       rounded-md
buttons              rounded-lg
inputs               rounded-lg
algorithm nodes      rounded-lg
panels                rounded-xl
large feature panel  rounded-2xl maximum
badges                rounded-full
```

Avoid excessive:

```text
rounded-3xl
rounded-[40px]
```

unless intentionally designing one unique hero visual.

---

# 18. Borders

Default:

```tsx
border border-fd-border
```

Interactive:

```tsx
hover:border-fd-foreground/15
```

Active state:

```tsx
border-viz-current/40
```

Borders should usually be `1px`.

Avoid stacking:

```text
border
ring
shadow
inner shadow
glow
```

on every element.

---

# 19. Typography

Use typography to create hierarchy before introducing surfaces.

Recommended general scale:

```text
Hero
text-5xl → text-7xl

Page heading
text-3xl → text-5xl

Section heading
text-2xl → text-4xl

Subsection
text-xl → text-2xl

Body
text-sm / text-base

Metadata
text-xs / text-sm
```

---

## Heading Style

Prefer:

```tsx
font-semibold
tracking-tight
text-fd-foreground
```

Avoid using:

```tsx
font-black
uppercase
tracking-widest
```

for large bodies of content.

---

# 20. Monospace

Use `font-mono` for:

* algorithms
* indexes
* code
* hashes
* binary data
* addresses
* matrices
* vectors
* execution values
* cryptographic output

Example:

```tsx
<span className="font-mono text-sm">
  SHA256
</span>
```

Do not use monospace for all interface text.

---

# 21. Spacing System

Prefer Tailwind's standard spacing scale.

Common component spacing:

```text
gap-1
gap-1.5
gap-2
gap-3
gap-4
gap-6
gap-8

p-2
p-3
p-4
p-6
p-8
```

Page section spacing:

```tsx
py-16
md:py-24
lg:py-32
```

Do not randomly introduce:

```tsx
mt-[37px]
px-[23px]
gap-[19px]
```

unless there is a genuine one-off layout requirement.

---

# 22. Arbitrary Values

Arbitrary values are permitted for exceptional cases.

Good:

```tsx
max-w-[72rem]
grid-cols-[280px_1fr]
```

Avoid using arbitrary values as the normal design system.

Bad:

```tsx
text-[17px]
mt-[13px]
rounded-[11px]
px-[17px]
gap-[14px]
```

Prefer standard tokens first.

---

# 23. Never Build Dynamic Tailwind Classes

Do NOT do:

```tsx
const color = "cyan";

<div className={`bg-${color}-500`} />
```

Instead map complete class names:

```tsx
const variants = {
  current:
    "border-viz-current/40 bg-viz-current/10 text-viz-current",

  compare:
    "border-viz-compare/40 bg-viz-compare/10 text-viz-compare",

  success:
    "border-viz-success/40 bg-viz-success/10 text-viz-success",
};
```

Then:

```tsx
<div className={variants[state]} />
```

---

# 24. Reusable Variant Patterns

When a component has many states, keep its visual variants in one place.

Example:

```tsx
const stateStyles = {
  idle:
    "border-fd-border bg-fd-background text-fd-foreground",

  current:
    "border-viz-current/40 bg-viz-current/10 text-viz-current shadow-glow-current",

  compare:
    "border-viz-compare/40 bg-viz-compare/10 text-viz-compare shadow-glow-compare",

  transform:
    "border-viz-transform/40 bg-viz-transform/10 text-viz-transform shadow-glow-transform",

  success:
    "border-viz-success/40 bg-viz-success/10 text-viz-success shadow-glow-success",

  error:
    "border-viz-danger/40 bg-viz-danger/10 text-viz-danger",
} as const;
```

This is preferred over repeating long conditional class strings throughout JSX.

---

# 25. `cn()` Usage

When the project already includes a `cn()` helper, use it for conditional classes.

Example:

```tsx
<div
  className={cn(
    "rounded-lg border transition-all",
    stateStyles[state],
    className,
  )}
/>
```

Do not introduce unnecessary class manipulation libraries when the existing project utility is sufficient.

---

# 26. Dark Mode

All new components must be tested in:

```text
Light
Dark
System
```

Prefer semantic Fumadocs tokens for base surfaces so that manual `dark:` declarations are minimized.

Use explicit `dark:` when the visual state genuinely requires different opacity or treatment.

Example:

```tsx
bg-viz-current/5
dark:bg-viz-current/10
```

---

# 27. Interactive Visualization Background

Visualization areas should usually use a subtle neutral surface.

Example:

```tsx
className="
  relative overflow-hidden
  rounded-xl
  border border-fd-border
  bg-fd-background
"
```

Optional technical grid:

```tsx
className="
  bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)]
  bg-[size:32px_32px]
"
```

Grid must remain extremely subtle.

Do not make it compete with the actual visualization.

---

# 28. Visualization Hierarchy

A visualization generally contains:

```text
Canvas / stage
↓
Inactive data
↓
Relevant data
↓
Current data
↓
Temporary glow
```

Example:

```text
inactive
opacity-40

normal
opacity-100

selected
blue

current
cyan + subtle glow

compare
amber

swap
violet

found
emerald + temporary glow
```

---

# 29. Data Structures State Language

For algorithms use these meanings consistently.

```text
Cyan
CURRENT

Blue
SELECTED

Amber
COMPARING

Violet
MOVING / SWAPPING / TRANSFORMING

Emerald
FOUND / COMPLETE

Rose
INVALID / ERROR

Neutral
UNVISITED / IDLE
```

Do not redefine these colors separately in every visualization.

---

# 30. Machine Learning Visualization

Machine Learning domain identity:

```text
Emerald
```

However internal state semantics still override domain identity.

Example:

Normal ML dataset:

```tsx
text-domain-ml
```

Currently selected point:

```tsx
text-viz-selected
```

Incorrect prediction:

```tsx
text-viz-danger
```

Domain colors indicate **subject**.

Visualization state colors indicate **behavior**.

Do not confuse them.

---

# 31. Deep Learning Visualization

Deep Learning domain:

```text
Violet
```

Neuron default:

```tsx
border-fd-border
bg-fd-background
```

Activated neuron:

```tsx
border-domain-dl/40
bg-domain-dl/10
shadow-glow-transform
```

However success/error states must still use semantic success/error colors.

---

# 32. Cryptography Visualization

Cryptography domain:

```text
Amber
```

Use monospace heavily for:

```text
keys
hash
ciphertext
binary
hex
```

Example:

```tsx
<div className="
  font-mono
  text-sm
  tracking-wide
  text-domain-crypto
">
  8F A2 91 0D FF 32
</div>
```

Avoid making cryptography UI resemble a green hacker terminal unless the feature explicitly requires a terminal.

---

# 33. Focus States

Every interactive control must have a visible keyboard focus state.

Recommended:

```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-fd-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-fd-background
```

Do not remove focus outlines without replacing them.

---

# 34. Hover States

Hover should generally change one or two properties.

Good:

```tsx
transition-colors
hover:bg-fd-accent
```

or:

```tsx
transition-all
hover:border-viz-current/30
hover:bg-viz-current/5
```

Avoid changing simultaneously:

* scale
* rotation
* translate
* shadow
* glow
* border
* background

unless designing a specific visualization.

---

# 35. Motion

Tailwind handles simple transitions.

Use Motion for:

* element movement
* algorithm swapping
* graph transitions
* layout transitions
* entering/leaving visualization states
* number transitions

Do not use Motion simply to animate every button.

For ordinary controls:

```tsx
transition-colors
duration-150
```

is enough.

---

# 36. Transition Durations

Recommended:

```text
100–150ms
button feedback

150–250ms
hover / focus

250–400ms
panel transitions

400–700ms
visualization movement

algorithm playback
controlled by simulation speed
```

Avoid slow 1-second hover transitions.

---

# 37. Reduced Motion

Respect users who request reduced motion.

For Tailwind transitions, consider:

```tsx
motion-reduce:transition-none
motion-reduce:transform-none
```

Interactive educational content must remain understandable even when movement is reduced.

---

# 38. Responsive Design

Build mobile-first.

Base classes represent mobile.

Then enhance:

```tsx
sm:
md:
lg:
xl:
```

Example:

```tsx
className="
  grid grid-cols-1
  gap-8
  lg:grid-cols-[1fr_420px]
"
```

Do not create desktop-only visualization interfaces.

---

# 39. Layout Width

Documentation text should remain readable.

Avoid making paragraphs span the entire desktop width.

Large visualizers may use larger containers.

Conceptually:

```text
Article text
narrow

Documentation layout
medium

Interactive visualization
wide
```

---

# 40. Code Blocks

Code is a primary FumaDocs element.

Use:

* monospace
* subtle borders
* neutral backgrounds
* semantic active-line highlighting

Example active line:

```tsx
bg-viz-current/10
border-l-2
border-viz-current
```

Do not use giant glow around an entire code editor.

If an algorithm is running, highlight only the active line or execution indicator.

---

# 41. Monaco Editor

Monaco should visually integrate with the surrounding interface.

The container can use:

```tsx
className="
  overflow-hidden
  rounded-xl
  border border-fd-border
  bg-fd-card
"
```

Avoid placing Monaco inside another heavily styled card.

---

# 42. Icon Rules

Icons should generally be:

```text
16px
18px
20px
```

Large icons only for actual illustrations.

Use icon color:

```tsx
text-fd-muted-foreground
```

and semantic colors only where meaningful.

Do not put every icon inside a colored rounded square.

---

# 43. Home Page Rule

Home should NOT become:

```text
4 giant colored cards
```

Prefer editorial sections:

```text
01
Data Structures & Algorithms
────────────────────────────

02
Machine Learning
────────────────────────────

03
Deep Learning
────────────────────────────

04
Cryptography
────────────────────────────
```

Color may appear in:

* index marker
* tiny badge
* interactive demo
* hover underline
* visualization

The content itself remains neutral.

---

# 44. Gradients

Gradients are allowed only when subtle and meaningful.

Acceptable:

```tsx
bg-gradient-to-b
from-viz-current/10
to-transparent
```

or a very subtle glow mask.

Avoid:

```text
purple → pink → blue giant SaaS gradient
```

Do not use gradients as the primary FumaDocs brand identity.

---

# 45. Background Glow

Large blurred background glow is permitted only as a very subtle atmospheric detail.

Example:

```tsx
<div
  className="
    pointer-events-none
    absolute
    size-64
    rounded-full
    bg-domain-dl/10
    blur-3xl
  "
/>
```

Opacity should be low.

One glow is usually enough.

Do not place multiple colorful blobs across every section.

---

# 46. Semantic Color Priority

When choosing a color, follow this priority:

```text
1. Does it represent a state?
   → use visualization semantic color.

2. Does it identify a documentation domain?
   → use domain color.

3. Is it normal interface decoration?
   → use Fumadocs neutral tokens.
```

Example:

An ML node currently producing an error:

Correct:

```text
Rose
```

Not:

```text
Emerald because Machine Learning is green
```

State semantics have priority.

---

# 47. Badge Priority

Badges should be reserved for useful metadata.

Good:

```text
Machine Learning
Beginner
Interactive
8 min
Running
Completed
```

Bad:

```text
Modern
Cool
New
Awesome
Fast
Smart
Beautiful
```

Avoid badge clutter.

Generally do not show more than 2–3 badges together unless presenting structured metadata.

---

# 48. Do Not Overuse Pills

Do not convert every navigation item, link, filter, text and action into:

```text
[ rounded-full pill ]
```

Use pills primarily for:

* badge
* compact filter
* small segmented state

Buttons should generally use:

```tsx
rounded-lg
```

not always:

```tsx
rounded-full
```

---

# 49. Accessibility and Color

Never communicate meaning using color alone.

Bad:

```text
green element = completed
red element = failed
```

Good:

```text
✓ Completed
! Failed
```

Use:

* text
* icon
* label
* shape
* animation state

alongside color.

---

# 50. Component Generation Rules

When generating a new FumaDocs component, follow this process:

```text
1. Identify component purpose.
2. Use Fumadocs semantic colors for normal UI.
3. Determine whether semantic visualization color is required.
4. Determine whether domain accent is required.
5. Use standard Tailwind spacing.
6. Use standard radius.
7. Add responsive behavior.
8. Add hover/focus states.
9. Add dark mode support.
10. Add reduced-motion handling if animated.
11. Only add glow if it communicates active state.
12. Avoid unnecessary cards.
```

---

# 51. Class Ordering Convention

Keep Tailwind classes reasonably grouped.

Recommended conceptual order:

```text
layout
position
size
spacing
typography
background
border
effects
state
responsive
```

Example:

```tsx
className="
  flex items-center justify-between
  h-10
  gap-3 px-4
  text-sm font-medium
  bg-fd-background
  border border-fd-border
  rounded-lg
  transition-colors
  hover:bg-fd-accent
"
```

Exact automatic formatting may be handled by project tooling.

Readability is the goal.

---

# 52. Avoid Massive JSX Class Duplication

If the same group of classes appears three or more times, consider extracting:

* component
* variant map
* helper
* shared primitive

Do not prematurely abstract one-off layout classes.

---

# 53. Do Not Create CSS When Tailwind Already Handles It

Prefer:

```tsx
flex
grid
gap-4
rounded-lg
border
transition-colors
```

instead of creating:

```css
.custom-box {}
```

Custom CSS is appropriate for:

* complex visualization
* generated geometry
* advanced mask
* unusual animation
* global theme tokens
* properties that Tailwind cannot express cleanly

---

# 54. Design Token First

When the same custom value is needed repeatedly, promote it to a semantic token.

Bad:

```tsx
shadow-[0_0_24px_rgba(34,211,238,.18)]
```

repeated twenty times.

Good:

```tsx
shadow-glow-current
```

The class now communicates intent.

---

# 55. No Magic Colors in Components

Avoid:

```tsx
text-[#22d3ee]
bg-[#8b5cf6]
border-[#10b981]
```

for established semantic states.

Use:

```tsx
text-viz-current
bg-viz-transform
border-viz-success
```

Hex values should be centralized in theme tokens.

---

# 56. Example Visualizer Component

```tsx
const stateStyles = {
  idle:
    "border-fd-border bg-fd-background text-fd-foreground",

  current:
    "border-viz-current/40 bg-viz-current/10 text-viz-current shadow-glow-current",

  compare:
    "border-viz-compare/40 bg-viz-compare/10 text-viz-compare shadow-glow-compare",

  transform:
    "border-viz-transform/40 bg-viz-transform/10 text-viz-transform shadow-glow-transform",

  success:
    "border-viz-success/40 bg-viz-success/10 text-viz-success shadow-glow-success",
} as const;

type NodeState = keyof typeof stateStyles;

interface ArrayNodeProps {
  value: number;
  state?: NodeState;
}

export function ArrayNode({
  value,
  state = "idle",
}: ArrayNodeProps) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center",
        "rounded-lg border",
        "font-mono text-sm font-medium",
        "transition-all duration-300",
        "motion-reduce:transition-none",
        stateStyles[state],
      )}
    >
      {value}
    </div>
  );
}
```

---

# 57. Example Documentation Domain Configuration

Prefer centralized configuration.

```ts
export const documentationDomains = {
  dsa: {
    label: "Data Structures & Algorithms",
    badge:
      "border-domain-dsa/20 bg-domain-dsa/10 text-domain-dsa",
    accent: "text-domain-dsa",
  },

  ml: {
    label: "Machine Learning",
    badge:
      "border-domain-ml/20 bg-domain-ml/10 text-domain-ml",
    accent: "text-domain-ml",
  },

  dl: {
    label: "Deep Learning",
    badge:
      "border-domain-dl/20 bg-domain-dl/10 text-domain-dl",
    accent: "text-domain-dl",
  },

  crypto: {
    label: "Cryptography",
    badge:
      "border-domain-crypto/20 bg-domain-crypto/10 text-domain-crypto",
    accent: "text-domain-crypto",
  },
} as const;
```

Do not duplicate these mappings manually throughout the project.

---

# 58. Preferred Visual Language

Use:

```text
thin border
+
neutral surface
+
small semantic accent
+
high quality typography
+
meaningful motion
```

Instead of:

```text
large shadow
+
large radius
+
bright gradient
+
many colorful icons
+
decorative animations
```

---

# 59. FumaDocs Visual Identity Summary

Base interface:

```text
White / Black / Neutral
```

Interactive current state:

```text
Cyan glow
```

Selection:

```text
Blue
```

Comparison:

```text
Amber
```

Transformation:

```text
Violet
```

Success:

```text
Emerald
```

Error:

```text
Rose
```

Domains:

```text
DSA       → Cyan
ML        → Emerald
DL        → Violet
Crypto    → Amber
```

The UI should look calm when nothing is happening.

The interface becomes colorful only when information, interaction or simulation requires it.

---

# 60. Final Review Checklist

Before completing any UI component, verify:

* [ ] Uses semantic Fumadocs colors for general UI
* [ ] Works in light mode
* [ ] Works in dark mode
* [ ] Responsive on mobile
* [ ] Uses standard spacing scale
* [ ] Uses sensible border radius
* [ ] Does not unnecessarily use cards
* [ ] Does not use excessive shadows
* [ ] Does not use decorative glow without meaning
* [ ] Uses semantic visualization colors correctly
* [ ] Domain colors are used only as accents
* [ ] Badge usage is limited and meaningful
* [ ] Focus states are visible
* [ ] Information does not rely only on color
* [ ] Animation supports reduced motion
* [ ] Repeated arbitrary values have been converted into tokens
* [ ] Dynamic Tailwind class construction is avoided
* [ ] Component remains readable and maintainable

---

# Primary Rule

When uncertain, choose:

**less decoration, clearer hierarchy, stronger interaction.**

FumaDocs should feel impressive because users can **see concepts work**, not because every component glows.
