# Stacklore — Welcome Page

## Goal

Create a modern, interactive **Welcome page** for Stacklore.

This page is **not a C++ introduction** and should not immediately teach programming syntax.

The purpose of this page is to introduce Stacklore as a learning platform focused on:

* Data Structures
* Algorithms
* Algorithm visualization
* Problem solving
* Programming fundamentals
* Learning by doing

The page should make new users understand:

> Stacklore does not only show code.
> It helps users understand what the code is doing.

The overall experience should feel educational, interactive, modern, clean, and intentionally designed.

Avoid making the page look like a generic documentation homepage.

---

# Page Route

```text
/docs/welcome
```

Suggested MDX file:

```text
content/docs/welcome.mdx
```

---

# Design Direction

Use the existing Stacklore / Fumadocs layout and design system.

The page should feel:

* clean
* minimal
* developer-focused
* slightly futuristic
* interactive
* educational
* spacious
* visually structured

Avoid:

* excessive cards
* giant gradients
* excessive glowing effects
* generic AI landing-page design
* too much marketing copy
* large walls of text
* unnecessary decorative illustrations

Use subtle accents such as:

* grid background
* thin borders
* subtle blue/cyan glow
* monospace labels
* small code-related icons
* timeline / connector lines
* animated code state

The documentation sidebar should remain visible.

---

# 01 — Hero

The hero should introduce **Stacklore**, not C++.

Example content direction:

```text
STACKLORE

Understand Data Structures.
See Algorithms in Motion.

Learn how data moves,
how algorithms make decisions,
and why they work.

[ Start Learning ]    [ Explore Learning Path ]
```

Do not use:

```text
Welcome to C++
```

or position Stacklore as a C++ learning website.

Stacklore is primarily about understanding:

```text
Data Structures
Algorithms
Problem Solving
```

Programming languages are tools used to demonstrate those concepts.

---

## Hero Supporting Visual

Add a subtle animated background or interactive visualization behind / beside the hero.

For example:

```text
[ 2 ] [ 5 ] [ 8 ] [ 12 ] [ 19 ]

               target = 12
```

A scanning indicator can slowly move between array elements.

Do not make this visualization too large.

It should hint at what users will experience later.

---

# 02 — Learn the Idea, Not Just the Syntax

Introduce the learning philosophy.

Suggested layout:

```text
LEARN DIFFERENTLY

Code tells you what to write.

Stacklore helps you understand
what happens when that code runs.
```

Then present the learning cycle.

Avoid four large cards.

Use a flowing horizontal or vertical sequence.

Example:

```text
Concept
   ↓
Code
   ↓
Visualize
   ↓
Experiment
   ↓
Solve
```

Each stage should have a short explanation.

### Concept

Understand what the structure or algorithm is supposed to solve.

### Code

Read a real implementation.

### Visualize

Watch each important operation happen visually.

### Experiment

Change input and run it yourself.

### Solve

Apply the concept to exercises and problems.

---

# 03 — Interactive Code Visualization

This is one of the most important sections on the Welcome page.

Show a small algorithm example using source code and visualization side-by-side.

Use something simple such as **Binary Search**.

Layout:

```text
┌────────────────────────────┐   ┌────────────────────────────┐
│ C++                        │   │ Visualization              │
│                            │   │                            │
│ 1  int left = 0;           │   │ [2][5][8][12][19][24]    │
│ 2  int right = n - 1;      │   │          ↑                 │
│ 3                          │   │         mid                │
│ 4  while (left <= right) { │   │                            │
│ 5    int mid = ...         │   │ target = 19                │
│ 6    if (...)              │   │                            │
│ 7  }                       │   │                            │
│                            │   │                            │
│ [ ▶ Run ]                  │   │ Step 2 / 4                 │
└────────────────────────────┘   └────────────────────────────┘
```

---

## Code Highlight Synchronization

The visualization must be synchronized with the source code.

When the algorithm moves to a new operation:

1. highlight the currently executing source-code line
2. animate the corresponding visualization
3. update algorithm variables
4. move to the next source-code line

Example:

```text
CODE

4  while (left <= right) {
5      int mid = left + (right-left)/2;
       ───────────────────────────────
               ACTIVE LINE
```

At the same moment:

```text
ARRAY

 left        mid             right
  ↓           ↓                ↓

[ 2 ][ 5 ][ 8 ][ 12 ][ 19 ][ 24 ]
```

Then the next line:

```cpp
if (arr[mid] < target)
```

becomes highlighted.

The visualization should show the comparison:

```text
12 < 19

TRUE
```

Then animate:

```text
left = mid + 1
```

and visually remove / dim the discarded search area.

Example:

```text
[ 2 ][ 5 ][ 8 ][ 12 ] [ 19 ][ 24 ]
 ───── discarded ─────    ↑
                         search
```

---

# Visualization Controls

Provide minimal controls:

```text
[ ▶ Play ]  [ Next ]  [ Reset ]

Speed
0.5×   1×   2×
```

Do not make it resemble a full IDE.

The purpose is to demonstrate Stacklore's learning experience.

---

# Visualization State Architecture

The visualization component should be state-driven.

Example concept:

```ts
type VisualizationStep = {
  line: number
  description: string
  state: {
    left?: number
    right?: number
    mid?: number
    target?: number
    activeIndexes?: number[]
    discardedIndexes?: number[]
  }
}
```

Example:

```ts
const steps = [
  {
    line: 1,
    description: "Initialize the left pointer",
    state: {
      left: 0,
    },
  },
  {
    line: 2,
    description: "Initialize the right pointer",
    state: {
      left: 0,
      right: 5,
    },
  },
  {
    line: 5,
    description: "Find the middle element",
    state: {
      left: 0,
      right: 5,
      mid: 2,
    },
  },
]
```

The animation should react to these states instead of manually controlling every DOM element.

---

# Reusable Components

Do not hard-code the visualization directly into `welcome.mdx`.

Create reusable components.

Suggested structure:

```text
components/
└── learning/
    ├── code-visualizer/
    │   ├── CodeVisualizer.tsx
    │   ├── CodePanel.tsx
    │   ├── VisualizationPanel.tsx
    │   ├── PlaybackControls.tsx
    │   └── types.ts
    │
    └── visualizations/
        └── BinarySearchVisualization.tsx
```

MDX should remain clean.

Example:

```mdx
<CodeVisualizer
  algorithm="binary-search"
  demo
/>
```

---

# Active Code Line Design

Active code lines should be obvious but elegant.

Example:

```text
 4 │ while (left <= right) {
>5 │   int mid = left + (right - left) / 2;
 6 │
```

Use:

* subtle accent background
* small active indicator
* optional animated left border

Avoid strong neon backgrounds.

Inactive code should remain readable.

---

# Animation Rules

Animations should help explain the algorithm, not decorate it.

Recommended animation behavior:

### Pointer movement

Animate:

```text
left
 ↓

[4]
```

moving smoothly between indexes.

### Comparison

Briefly highlight both compared values.

```text
target = 19

mid = 12
```

### Elimination

Discarded array elements should fade or reduce opacity.

### Found state

When the value is found:

```text
[ 19 ]
```

receive a subtle success state.

Do not use excessive particle effects or confetti.

---

# 04 — What You Will Learn

After the visualization, introduce the major learning areas.

Do not show dozens of topics.

Use a clean progression.

Example:

```text
WHAT YOU'LL LEARN


01
Programming Foundations

Understand the programming concepts
needed to implement algorithms.

Variables
Conditions
Loops
Functions
Arrays


        ↓


02
Data Structures

Learn how data can be organized
for different types of problems.

Array
Linked List
Stack
Queue
Hash Table
Tree
Graph


        ↓


03
Algorithms

Understand how algorithms process
and transform data efficiently.

Searching
Sorting
Traversal
Recursion


        ↓


04
Problem Solving

Learn reusable strategies for
solving more complex problems.

Two Pointers
Sliding Window
Greedy
Backtracking
Dynamic Programming
```

Prefer a vertical journey instead of unrelated cards.

---

# 05 — Explore a Data Structure

Include another small visual section focused on a data structure rather than an algorithm.

Example: **Linked List**

```text
LINKED LIST

┌──────────┐      ┌──────────┐      ┌──────────┐
│  value 7 │ ───→ │ value 12 │ ───→ │ value 21 │
│ next  •──┘      │ next  •──┘      │ next null│
└──────────┘      └──────────┘      └──────────┘
```

Possible subtle interaction:

Hovering a node can reveal:

```text
value
memory address
next pointer
```

Keep it lightweight.

The full lesson will contain a richer visualization later.

---

# 06 — Programming Languages

Only near the lower part of the page introduce programming languages.

The messaging should clarify:

> Algorithms are concepts.
> Programming languages are how we express them.

Example layout:

```text
USE THE LANGUAGE YOU KNOW

The algorithm stays the same.
The syntax changes.

[ C++ ]   [ Python ]   [ Java ]
```

Then show the same simple algorithm in different syntax.

For example:

### C++

```cpp
for (int i = 0; i < n; i++) {
    cout << numbers[i];
}
```

### Python

```python
for number in numbers:
    print(number)
```

### Java

```java
for (int number : numbers) {
    System.out.println(number);
}
```

Use tabs rather than showing all three code blocks simultaneously.

---

# Why Stacklore Prefers C++

After the language tabs, add a small informational note.

This should not claim that C++ is universally the best language.

Example:

> **Why do many Stacklore examples use C++?**
>
> C++ exposes important concepts such as memory, pointers, references, and data structures more directly. Its Standard Template Library is also widely used when studying algorithms and competitive programming.
>
> The underlying algorithmic concepts, however, are language-independent.

Keep this section visually subtle.

Suggested component:

```text
ⓘ Why C++?
```

Expandable if necessary.

---

# 07 — Your Learning Journey

Introduce the high-level progression.

Do not duplicate the complete Learning Path page.

Only show the overview.

```text
YOUR JOURNEY


Start
  │
  ● Programming Fundamentals
  │
  ● C++ / Language Fundamentals
  │
  ● DSA Foundations
  │
  ● Core Data Structures
  │
  ● Core Algorithms
  │
  ● Problem Solving Patterns
  │
  ● Advanced DSA
  │
  ★ Build strong algorithmic thinking
```

CTA:

```text
[ View Full Learning Path → ]
```

---

# 08 — Learning by Doing

The final educational section should reinforce Stacklore's core concept.

Suggested text:

```text
DON'T JUST READ IT.
RUN IT.

Change the input.
Run the algorithm.
Watch every step.
Understand why it works.
```

Show a compact playground preview:

```text
Input

[ 2, 4, 7, 9, 13 ]

Target

[ 9 ]

[ Run Algorithm → ]
```

Then visualize the result.

---

# 09 — Final CTA

Keep the final CTA simple.

```text
READY TO START?

Begin with the foundations
and build your way toward advanced algorithms.

[ Start Learning → ]

or

Explore the Learning Path
```

Primary action:

```text
Start Learning
```

should navigate to the first lesson.

Secondary action:

```text
Learning Path
```

should navigate to:

```text
/docs/learning-path
```

---

# Page Flow

The final page order should be:

```text
01 Hero
        ↓
02 Learning Philosophy
        ↓
03 Interactive Code Visualization
        ↓
04 What You'll Learn
        ↓
05 Data Structure Preview
        ↓
06 Programming Languages
        ↓
07 Why C++?
        ↓
08 Learning Journey
        ↓
09 Learning by Doing
        ↓
10 Final CTA
```

---

# MDX Structure

Keep `welcome.mdx` focused on content composition.

Example:

```mdx
---
title: Welcome
description: Learn data structures and algorithms by understanding, visualizing, and experimenting with them.
---

<WelcomeHero />

<LearningFlow />

<CodeVisualizer
  algorithm="binary-search"
  demo
/>

<LearningTopics />

<DataStructurePreview type="linked-list" />

<LanguageComparison />

<WhyCpp />

<JourneyPreview />

<LearningByDoing />

<WelcomeCTA />
```

Avoid putting hundreds of lines of React logic directly inside MDX.

---

# Component Structure

Suggested:

```text
components/
└── learning/
    └── welcome/
        ├── WelcomeHero.tsx
        ├── LearningFlow.tsx
        ├── LearningTopics.tsx
        ├── LanguageComparison.tsx
        ├── WhyCpp.tsx
        ├── JourneyPreview.tsx
        ├── LearningByDoing.tsx
        └── WelcomeCTA.tsx
```

Shared components:

```text
components/
└── learning/
    ├── CodeVisualizer.tsx
    ├── CodePanel.tsx
    ├── PlaybackControls.tsx
    └── visualizations/
```

---

# Responsive Behavior

## Desktop

Use:

```text
Sidebar | Main Content | On This Page
```

The interactive visualization can use a 50/50 layout:

```text
Code | Visualization
```

---

## Tablet

Change visualization layout to:

```text
Code
────
Visualization
```

---

## Mobile

Stack everything vertically.

For code visualization:

```text
Code

Visualization

Controls
```

The code panel must support horizontal scrolling.

Do not shrink code until it becomes unreadable.

---

# Accessibility

Animations must not be required to understand the material.

Provide:

```text
Step description
Current operation
Current variable values
```

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

* remove sliding animation
* directly transition between states
* retain code highlighting

Playback controls must be keyboard accessible.

---

# Performance

Interactive learning is important, but the page must remain lightweight.

Avoid:

* Three.js for simple algorithm visualization
* canvas when normal DOM/SVG is enough
* heavy animation libraries for basic movements
* continuous background animations

Prefer:

```text
React state
CSS transforms
SVG
Motion only where useful
```

Lazy-load complex visualization components when possible.

---

# Important Principle

Stacklore should consistently communicate:

```text
Concept
   ↓
Source Code
   ↓
Execution
   ↓
Visualization
   ↓
Understanding
```

The visualization must never feel disconnected from the code.

When a source-code line executes:

```text
Highlight Code Line
        ↓
Update Algorithm State
        ↓
Animate Visualization
        ↓
Explain What Happened
```

This behavior should eventually become the foundation for other lessons such as:

```text
Linear Search
Binary Search
Bubble Sort
Selection Sort
Insertion Sort
Stack
Queue
Linked List
Binary Tree
BFS
DFS
Dijkstra
Dynamic Programming
```

---

# Final Design Objective

A new user visiting `/docs/welcome` should immediately understand that Stacklore is not just another documentation website.

They should understand that Stacklore teaches algorithms by combining:

```text
Readable explanations
+
Real source code
+
Synchronized code highlighting
+
Interactive visualization
+
Hands-on experimentation
```

The page should encourage the user to continue into the Learning Path without overwhelming them with the complete curriculum.
