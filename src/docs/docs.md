# FumaDocs — Documentation Hub UI/UX

## Page

Route:

```text
/docs
```

This page is the main entry point into all FumaDocs documentation.

The page must help users understand the available learning areas and quickly choose what they want to study.

Current documentation domains:

1. Data Structures & Algorithms
2. Machine Learning
3. Deep Learning
4. Cryptography

This page is NOT a traditional documentation article.

Do not show the normal documentation sidebar on this page.

---

# Main Goal

The Documentation Hub should answer:

```text
What can I learn here?
Where should I start?
What topics exist?
Which section should I open?
```

The interface must feel like an organized learning map rather than a grid of generic cards.

---

# Page Structure

Use:

```text
Global Navbar
↓
Documentation Header
↓
Search
↓
Documentation Domains
↓
Learning Paths / Suggested Starting Points
↓
Recently / Popular Topics
↓
Footer
```

---

# Global Navigation

Keep the same global navbar used on the Home page.

Example:

```text
FumaDocs

Docs
Visualize
Playground

Search...          Theme
```

`Docs` should appear active.

Do not introduce a documentation sidebar yet.

---

# Documentation Header

Use a simple editorial hero.

Example:

```text
Documentation

Explore computer science
one concept at a time.

Choose a subject, read the theory,
run examples and visualize how it works.
```

Avoid a massive marketing-style hero.

This should feel closer to entering a learning workspace.

---

# Search

Search should be prominent.

Example:

```text
┌────────────────────────────────────────────┐
│ Search documentation...             ⌘ K   │
└────────────────────────────────────────────┘
```

Search results may contain topics from all domains.

Example:

```text
Array
Data Structures & Algorithms

Linear Regression
Machine Learning

Backpropagation
Deep Learning

SHA-256
Cryptography
```

Use Fumadocs search functionality.

---

# Domain Explorer

Do NOT use four generic rounded cards.

Use large horizontal documentation sections.

Example:

```text
01

Data Structures
& Algorithms

Learn how data is organized and
how algorithms process it efficiently.

Arrays
Linked Lists
Stacks & Queues
Trees
Graphs
Sorting
Searching

Explore →
```

Right side:

Show a subtle interactive data structure visualization.

Example:

```text
[12] [7] [19] [3] [25]

        ↓

[3] [7] [12] [19] [25]
```

Separate each domain using whitespace and a thin divider.

---

# Machine Learning

```text
02

Machine Learning

Learn how models discover
patterns from data.

Regression
Classification
Clustering
Decision Trees
Model Evaluation

Explore →
```

Interactive visual:

Small scatter plot with animated decision boundary.

Use Emerald as the subtle domain accent.

---

# Deep Learning

```text
03

Deep Learning

Explore how neural networks
learn representations from data.

Neural Networks
Backpropagation
CNN
RNN
Transformers

Explore →
```

Interactive visual:

Simple neural network graph.

Nodes softly activate from input to output.

Use Violet as domain accent.

---

# Cryptography

```text
04

Cryptography

Understand how information
is protected and verified.

Hashing
Symmetric Encryption
Public Key Cryptography
Digital Signatures

Explore →
```

Interactive visual:

```text
FUMADOCS

↓ encrypt

A9 F4 10 CC 72

↓ decrypt

FUMADOCS
```

Use Amber as domain accent.

---

# Domain Navigation Behaviour

Clicking:

```text
Explore Data Structures →
```

should navigate to:

```text
/docs/data-structures
```

Likewise:

```text
/docs/machine-learning
/docs/deep-learning
/docs/cryptography
```

---

# Suggested Learning Section

After domain exploration, add:

```text
Not sure where to start?
```

Provide a few starting routes.

Example:

```text
Start with programming fundamentals
→ Arrays
→ Searching
→ Sorting

Start with Machine Learning
→ What is Machine Learning?
→ Linear Regression
→ Classification

Start with Deep Learning
→ Neural Networks
→ Activation Functions
→ Backpropagation

Start with Cryptography
→ Encryption Basics
→ Hashing
→ Public Key Cryptography
```

Keep this section typography-driven.

Avoid another big card grid.

---

# Topic Links

Topic lists should feel lightweight.

Example:

```text
Data Structures & Algorithms

Arrays                    →
Linked Lists              →
Stack                     →
Queue                     →
Trees                     →
Graphs                    →
```

Hover behavior:

* text becomes slightly stronger
* arrow moves approximately 2–4px
* optional domain accent underline

No heavy animation.

---

# Domain Accent Rules

Use:

```text
Data Structures & Algorithms → Cyan
Machine Learning             → Emerald
Deep Learning                → Violet
Cryptography                 → Amber
```

Colors should appear only on:

* section number
* small label
* interactive visualization
* hover line
* tiny status indicator

Main typography remains neutral.

---

# Layout

Desktop domain section:

```text
01          Main content                  Visualization
```

Example:

```text
01

Data Structures         Arrays
& Algorithms            Stack
                        Queue
Description             Tree
                        Graph

Explore →               [ visualization ]
```

Mobile:

```text
01

Data Structures
& Algorithms

Description

Topics

[ visualization ]

Explore →
```

---

# Background

Use the same visual language as Home.

Light:

```text
#FFFFFF
```

Dark:

```text
#090909
```

Optional subtle technical grid in visualization areas only.

Do not cover the entire page with a visible grid.

---

# No Sidebar On /docs

Important:

The documentation sidebar should NOT appear on:

```text
/docs
```

This page is a high-level navigation hub.

Sidebar starts after a domain is selected.

Example:

```text
/docs/data-structures
```

---

# Domain Page Navigation

When opening:

```text
/docs/data-structures
```

switch into documentation layout:

```text
Navbar
─────────────────────────────────────────

Sidebar        Main Documentation       TOC

Overview       Data Structures          On this page
Complexity     & Algorithms
Arrays
Linked List    Introduction...
Stack
Queue
Trees
Graphs
Sorting
Searching
```

Sidebar belongs to one domain only.

Do not mix all four domains into one enormous sidebar.

---

# Domain Switcher

At the top of the documentation sidebar include a compact domain switcher.

Example:

```text
Data Structures & Algorithms  ▾
```

Dropdown:

```text
Data Structures & Algorithms
Machine Learning
Deep Learning
Cryptography
```

Selecting another domain navigates to its landing page.

Do not show all four full trees simultaneously.

---

# Documentation Sidebar

Example:

```text
Data Structures & Algorithms

Getting Started
  Introduction
  Complexity

Data Structures
  Array
  Linked List
  Stack
  Queue
  Tree
  Graph

Algorithms
  Searching
  Sorting
  Recursion
```

Use collapsible groups only when necessary.

Avoid excessive nesting.

Maximum recommended depth:

```text
Domain
  Section
    Topic
```

Avoid:

```text
Domain
  Section
    Group
      Subgroup
        Topic
```

---

# Right-side TOC

For desktop documentation pages include:

```text
On this page

Introduction
How it works
Operations
Complexity
Visualization
Example
```

The current section should update while scrolling.

Hide or simplify this on mobile.

---

# Documentation Breadcrumb

Above article title:

```text
Data Structures & Algorithms
/
Data Structures
/
Array
```

Keep subtle.

Example styling:

```text
text-xs
text-muted
```

---

# Article Header

Example:

```text
Array

A contiguous collection of elements
stored in sequential memory locations.

Data Structures    Beginner    Interactive
```

Badges should follow the FumaDocs badge design system.

Do not show too many badges.

Maximum around 2–3 useful metadata labels.

---

# Article Content Structure

Typical lesson:

```text
Title
↓
Short explanation
↓
Concept
↓
Visualization
↓
How it works
↓
Operations
↓
Code example
↓
Interactive simulation
↓
Complexity
↓
Practice / Playground
↓
Next topic
```

The documentation page should gradually move from:

```text
Read
→
Understand
→
Visualize
→
Experiment
```

---

# Interactive Section

Interactive visualizations should feel integrated into the article.

Example:

```text
Try it

[12] [7] [23] [8]

Insert value
[ 19 ]

Index
[ 2 ]

[ Run ]

Step 1 / 4
```

Do not open every visualization on a separate page.

Small visualizations can live directly inside MDX documentation.

---

# Dedicated Visualizer

For complex simulations provide:

```text
Open Full Visualizer →
```

which may navigate to:

```text
/visualize/bubble-sort
```

or:

```text
/visualize/binary-search
```

This keeps documentation readable while allowing advanced experimentation.

---

# Previous / Next Navigation

Bottom of article:

```text
← Previous
Stack

Next →
Queue
```

Keep simple.

Do not wrap each navigation item inside oversized cards.

---

# Final Information Architecture

```text
/
Home

/docs
Documentation Hub

/docs/data-structures
Data Structures Landing

/docs/data-structures/array
Article

/docs/machine-learning
Machine Learning Landing

/docs/machine-learning/linear-regression
Article

/docs/deep-learning
Deep Learning Landing

/docs/deep-learning/neural-networks
Article

/docs/cryptography
Cryptography Landing

/docs/cryptography/hashing
Article

/visualize
Visualization Explorer

/visualize/bubble-sort

/playground
Code Playground
```

---

# UX Principle

The navigation hierarchy should always make clear:

```text
Where am I?
What am I learning?
What comes next?
Where can I experiment?
```

The user should never feel that they are navigating one enormous documentation tree.

Keep each subject domain isolated but connected through the global FumaDocs navigation.
