# Stacklore — Learning Path Page

## Goal

Create a modern and interactive **Learning Path** page for Stacklore.

The purpose of this page is to guide a complete beginner from:

```text
"What is programming?"
```

until they understand:

```text
Programming Fundamentals
        ↓
How Data is Stored
        ↓
How Programs Make Decisions
        ↓
Data Structures
        ↓
Algorithms
        ↓
Problem Solving
        ↓
Advanced DSA
```

The page should not feel like a long syllabus or documentation index.

It should feel like a **visual learning journey** where users understand:

* where they start
* what they are learning
* why they need to learn it
* what concept becomes available next
* how previous concepts connect to future concepts

---

# Page Route

```text
/docs/learning-path
```

Suggested MDX file:

```text
content/docs/learning-path.mdx
```

---

# Sidebar Requirement

`Welcome` and `Learning Path` must both live under **Overview**.

Do NOT create separate major sidebar categories for them.

Correct:

```text
Overview
├── Welcome
└── Learning Path
```

Example sidebar:

```text
Overview
├── Welcome
└── Learning Path

Programming Fundamentals
├── What is Programming?
├── Variables & Data Types
├── Operators
├── Selection
├── Looping
├── Functions
└── Arrays & Strings

C++ Foundations
├── References
├── Pointers
├── Memory
├── Stack vs Heap
└── STL Basics

DSA Foundations
├── Introduction to DSA
├── Complexity
└── Recursion

Data Structures
├── Array
├── Linked List
├── Stack
├── Queue
├── Hash Table
├── Tree
├── Heap
└── Graph

Algorithms
├── Searching
├── Sorting
└── Traversal

Problem Solving
├── Two Pointers
├── Sliding Window
├── Prefix Sum
├── Greedy
├── Backtracking
└── Dynamic Programming
```

The Learning Path page itself should visually explain the relationship between all these sections.

---

# Core Learning Philosophy

Do not teach topics as isolated concepts.

Always establish:

```text
Previous knowledge
        ↓
New concept
        ↓
Why it exists
        ↓
Simple visualization
        ↓
Where it will be used later
```

For example:

```text
Variables
   ↓
Arrays
   ↓
Looping through Arrays
   ↓
Searching
   ↓
Binary Search
```

Another example:

```text
Functions
   ↓
Recursion
   ↓
Trees
   ↓
DFS
   ↓
Backtracking
```

Another example:

```text
Memory
   ↓
Pointers
   ↓
Nodes
   ↓
Linked List
```

The Learning Path should make these relationships visually obvious.

---

# 01 — Learning Path Hero

Start with a simple introduction.

Do not use a huge marketing hero.

Example:

```text
LEARNING PATH

From your first line of code
to understanding complex algorithms.

Start from zero.
Build each concept on top of the previous one.
```

Primary CTA:

```text
[ Start From The Beginning ]
```

Secondary:

```text
[ Continue Learning → ]
```

If progress is not implemented yet, only show:

```text
Start From The Beginning
```

---

# 02 — The Big Picture

Before showing individual lessons, explain the entire journey.

Use a visual flow:

```text
Programming
     ↓
Data
     ↓
Logic
     ↓
Collections
     ↓
Memory
     ↓
Data Structures
     ↓
Algorithms
     ↓
Problem Solving
```

Give each one a very short description.

Example:

### Programming

Tell a computer what to do.

### Data

Store information inside a program.

### Logic

Make programs decide what should happen.

### Collections

Work with many values instead of one value.

### Memory

Understand where information actually lives.

### Data Structures

Organize information for different problems.

### Algorithms

Create steps for processing that information.

### Problem Solving

Combine everything to solve real problems.

---

# 03 — Main Learning Flowchart

One of the central elements on this page should be an interactive **learning dependency flowchart**.

Do not make it overly complex.

The first high-level version:

```text
                        START
                          │
                          ▼
                ┌─────────────────┐
                │   Programming   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Variables & Data│
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Operators       │
                └────────┬────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │ Selection & Looping    │
            └───────────┬────────────┘
                        │
                        ▼
                ┌─────────────────┐
                │   Functions     │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Arrays & Strings│
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Memory & Pointer│
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ DSA Foundations │
                └────────┬────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
      Data Structures             Algorithms
            │                         │
            └────────────┬────────────┘
                         ▼
                 Problem Solving
                         │
                         ▼
                   Advanced DSA
```

This visual should make users understand:

> Every advanced topic depends on simpler ideas learned before it.

---

# 04 — Stage 1: Understand Programming

This is the real starting point.

Title:

```text
01
Understand Programming
```

Description:

> Before learning algorithms, understand what a program actually is.

Topics:

```text
What is Programming?
Programming Languages
Source Code
Input → Process → Output
Basic Program Execution
```

Simple visual:

```text
INPUT
  │
  ▼
PROGRAM
  │
  ▼
OUTPUT
```

Example:

```text
Input

5 + 3

   ↓

Program

Add the numbers

   ↓

Output

8
```

---

## What is a Programming Language?

Explain simply:

> Computers need instructions. A programming language gives us a structured way to write those instructions.

Examples:

```text
C++
Python
Java
JavaScript
Go
Rust
...
```

Explain that Stacklore may show examples in multiple languages.

Programming language syntax may differ:

```text
C++
Python
Java
```

but core programming ideas remain similar:

```text
Variable
Condition
Loop
Function
Array
```

---

# 05 — Stage 2: Variables & Data

Title:

```text
02
Store Information
```

Start with a problem:

> Programs need to remember information.

Introduce:

```text
Variable
Data Type
Value
```

Visualization:

```text
age

┌───────────────┐
│      20       │
└───────────────┘
```

Then:

```text
name

┌───────────────┐
│   "Stacklore" │
└───────────────┘
```

Explain common data types conceptually:

```text
Integer     → 20
Decimal     → 19.5
Character   → 'A'
Boolean     → true
String      → "Hello"
```

---

# 06 — Stage 3: Operators

Now the user has data.

The next question:

> How can a program do something with that data?

Introduce:

```text
Arithmetic
Comparison
Logical Operations
```

Example:

```text
age = 20

age >= 18

     ↓

   true
```

This naturally prepares the user for conditions.

Flowchart:

```text
Variable
   ↓
Operator
   ↓
Result
```

---

# 07 — Stage 4: Selection

Introduce the idea:

> Programs can make decisions.

Topics:

```text
if
else
else if
switch
```

Visualization:

```text
             age >= 18?
                  │
          ┌───────┴───────┐
          │               │
         YES              NO
          │               │
          ▼               ▼
        Adult            Minor
```

This should teach the mental model before showing syntax.

Explain where this becomes useful later:

```text
Binary Search
Tree Traversal
Sorting
Graph Algorithms
Problem Solving
```

Algorithms constantly make decisions.

---

# 08 — Stage 5: Looping

Next problem:

> What if we need to perform the same operation many times?

Introduce:

```text
for
while
do-while
```

Visualization:

```text
i = 0
 ↓

[10][20][30][40]

 ↓

i = 1
     ↓

[10][20][30][40]

 ↓

i = 2
         ↓

[10][20][30][40]
```

Explain that loops eventually allow users to:

```text
Traverse an Array
Search for Data
Sort Data
Traverse Trees
Traverse Graphs
```

---

# 09 — Stage 6: Functions

Explain the problem first:

> Programs become difficult to understand if everything is written in one place.

Then introduce:

```text
Function
Parameters
Return Values
Scope
```

Mental model:

```text
Input
  │
  ▼
┌────────────┐
│  Function  │
└─────┬──────┘
      │
      ▼
    Output
```

Example concept:

```text
add(5, 3)
    │
    ▼
    8
```

Do not introduce recursion deeply yet.

Show a small note:

```text
Functions
   ↓
Recursion
   ↓
Trees / Backtracking / Dynamic Programming
```

This tells the user why functions matter later.

---

# 10 — Stage 7: Arrays & Strings

Start with:

> What if we need to store many values?

Instead of:

```text
score1
score2
score3
score4
```

we can have:

```text
scores

[72][85][91][68]
 0   1   2   3
```

Teach:

```text
Index
Access
Update
Traversal
Basic insertion
Basic deletion
```

This is an important transition because Arrays are both:

* a programming concept
* a fundamental data structure

Show this transition visually:

```text
PROGRAMMING FUNDAMENTALS

Variables
Loops
Functions
    │
    ▼
Arrays
    │
    │
    ▼
DATA STRUCTURES & ALGORITHMS
```

---

# 11 — Stage 8: Memory & Pointers

This section is primarily important for the **C++ learning track**.

Do not introduce it as complicated low-level theory.

Start from something they already understand:

```text
int age = 20;
```

Then visualize:

```text
MEMORY

Address        Value

0x1000      ┌────────┐
            │   20   │
            └────────┘
                age
```

Then introduce:

```text
Memory Address
Reference
Pointer
Stack
Heap
```

Simple pointer visualization:

```text
ptr
 │
 │ stores address
 ▼

0x1000 ───────→ age
                ┌────┐
                │ 20 │
                └────┘
```

Then explicitly explain why this lesson exists:

```text
Pointers
    ↓
Nodes
    ↓
Linked List
    ↓
Trees
    ↓
Graphs
```

This connection should be visible.

---

# 12 — Stage 9: Enter DSA

Now formally introduce:

```text
Data Structures & Algorithms
```

Explain the difference:

## Data Structure

> A way to organize and store data.

## Algorithm

> A sequence of steps used to solve a problem.

Visual:

```text
DATA

10
20
30
40

      ↓ organize

DATA STRUCTURE

[10][20][30][40]


      ↓ process

ALGORITHM

Search
Sort
Traverse
```

Very important takeaway:

```text
Data Structure
=
How data is organized

Algorithm
=
How data is processed
```

---

# 13 — Stage 10: Complexity

Now ask:

> If two algorithms solve the same problem, which one should we use?

Introduce:

```text
Time Complexity
Space Complexity
Big-O
```

Start visually.

Do not begin with mathematical proofs.

Example:

## Linear Search

```text
Target = 9

[2][4][5][7][9]

 ↓
    ↓
       ↓
          ↓
             ✓
```

Potentially check every item:

```text
O(n)
```

Then Binary Search:

```text
[2][4][5][7][9][12][20]

          ↓

discard half

                 ↓

O(log n)
```

---

# 14 — Stage 11: Core Data Structures

Now introduce the major structures one by one.

Use this order:

```text
Array
  ↓
Linked List
  ↓
Stack
  ↓
Queue
  ↓
Hash Table
  ↓
Tree
  ↓
Heap
  ↓
Graph
```

---

## Array

Concept:

```text
[10][20][30][40]
```

Learn:

* indexed storage
* traversal
* searching
* insertion
* deletion

---

## Linked List

Explain it as:

> Instead of keeping elements next to each other, each element points to the next one.

Visualization:

```text
┌────────┐     ┌────────┐     ┌────────┐
│   10   │ ──→ │   20   │ ──→ │   30   │
│  next  │     │  next  │     │  null  │
└────────┘     └────────┘     └────────┘
```

Connect it back:

```text
Pointer
   ↓
Node
   ↓
Linked List
```

---

## Stack

Explain:

> The last item added is the first item removed.

```text
      TOP
       ↓

    ┌──────┐
    │  30  │
    ├──────┤
    │  20  │
    ├──────┤
    │  10  │
    └──────┘
```

Concept:

```text
LIFO
Last In, First Out
```

Operations:

```text
push
pop
top
```

---

## Queue

Explain:

> The first item added is the first item removed.

```text
        QUEUE

IN → [10][20][30] → OUT
```

Concept:

```text
FIFO
First In, First Out
```

Operations:

```text
enqueue
dequeue
front
```

---

## Hash Table

Explain:

> Turn a key into a location where its value can be found quickly.

```text
"username"
     │
     ▼
   HASH
     │
     ▼
┌───────────┐
│ Bucket 4  │ ──→ "Stacklore"
└───────────┘
```

---

## Tree

Introduce hierarchy.

```text
              10
            /    \
           5      20
         /  \    /  \
        2    7  15  25
```

Teach:

```text
Root
Parent
Child
Leaf
Depth
Height
```

Then later:

```text
Binary Tree
Binary Search Tree
```

---

## Heap

After Tree.

Explain:

> A tree designed to quickly access the highest or lowest priority value.

Example:

```text
          100
         /   \
       80     70
      /  \
    50    20
```

Connect:

```text
Heap
 ↓
Priority Queue
```

---

## Graph

Graph comes after Tree because it is more general.

```text
A ───── B
│       │
│       │
C ───── D
 \     /
   \ /
    E
```

Teach:

```text
Vertex
Edge
Directed
Undirected
Weighted
```

---

# 15 — Data Structure Relationship Flowchart

Add a second flowchart specifically for Data Structures.

```text
                     DATA STRUCTURES
                           │
            ┌──────────────┴──────────────┐
            │                             │
          Linear                      Non-Linear
            │                             │
      ┌─────┼─────┐                  ┌────┴────┐
      │     │     │                  │         │
    Array  List  Queue              Tree      Graph
            │
            ├── Linked List
            │
            └── Stack
```

A slightly more complete visualization can show:

```text
Data Structures
│
├── Linear
│   ├── Array
│   ├── Linked List
│   ├── Stack
│   └── Queue
│
├── Hash-Based
│   └── Hash Table
│
└── Non-Linear
    ├── Tree
    │   ├── Binary Tree
    │   ├── BST
    │   └── Heap
    │
    └── Graph
```

This should help users understand that topics are related rather than random.

---

# 16 — Stage 12: Core Algorithms

Once users understand the structures, introduce algorithms.

High-level categories:

```text
Algorithms
│
├── Searching
├── Sorting
└── Traversal
```

---

## Searching

Start with:

```text
Linear Search
```

Then:

```text
Binary Search
```

Dependency:

```text
Array
  ↓
Sorted Array
  ↓
Binary Search
```

---

## Sorting

Suggested beginner progression:

```text
Bubble Sort
   ↓
Selection Sort
   ↓
Insertion Sort
   ↓
Merge Sort
   ↓
Quick Sort
```

The first algorithms should prioritize understanding.

Later algorithms can introduce efficiency.

---

## Traversal

Introduce:

```text
BFS
DFS
```

But connect them to structures:

```text
Tree
  ├── BFS
  └── DFS

Graph
  ├── BFS
  └── DFS
```

---

# 17 — Interactive Algorithm Visualization

The Learning Path should include a miniature example showing how Stacklore teaches algorithms.

Use Binary Search or Sorting.

Example layout:

```text
SOURCE CODE                     VISUALIZATION

1  int left = 0;               [2][5][8][12][19]
2  int right = n - 1;           ↑           ↑
3                               left       right
4  while (...) {
5    int mid = ...
```

When line `5` becomes active:

```text
5    int mid = ...
     █████████████
```

The visualization updates:

```text
[2][5][8][12][19]
       ↑
      mid
```

Then the next line becomes active.

The animation system should follow:

```text
Highlight source code line
          ↓
Update variables
          ↓
Animate visualization
          ↓
Show short explanation
          ↓
Continue
```

Use the same reusable visualization architecture from the Welcome page.

Do NOT duplicate separate animation logic.

---

# 18 — Stage 13: Problem Solving Patterns

Once basic DSA is understood, introduce reusable strategies.

```text
Problem Solving Patterns

├── Two Pointers
├── Sliding Window
├── Prefix Sum
├── Fast & Slow Pointer
├── Binary Search Pattern
├── Divide & Conquer
├── Greedy
└── Backtracking
```

Explain the transition:

```text
Before

"What is Binary Search?"

            ↓

Now

"When should I use Binary Search?"
```

This is the point where the user moves from learning algorithms to **recognizing patterns**.

---

# 19 — Stage 14: Dynamic Programming

Dynamic Programming must appear later.

Show prerequisites:

```text
Arrays
     │
Functions
     │
Recursion
     │
Complexity
     │
Problem Solving
     │
     ▼
Dynamic Programming
```

Initial concepts:

```text
Repeated subproblems
        ↓
Memoization
        ↓
Tabulation
        ↓
Dynamic Programming
```

Then later:

```text
1D DP
2D DP
Knapsack
LIS
LCS
Grid DP
Tree DP
```

---

# 20 — Advanced DSA

The final stage should communicate that the user now has enough foundation for advanced topics.

Examples:

```text
Advanced Trees
├── AVL Tree
├── Trie
├── Segment Tree
└── Fenwick Tree

Advanced Graphs
├── Dijkstra
├── Bellman-Ford
├── Floyd-Warshall
├── Kruskal
├── Prim
├── DSU
└── SCC

String Algorithms
├── KMP
├── Rabin-Karp
└── Z Algorithm

Advanced Problem Solving
├── Monotonic Stack
├── Monotonic Queue
├── Bit Manipulation
├── Bitmask DP
└── Tree DP
```

Do not overwhelm beginners with these details near the top of the page.

They should appear near the bottom of the Learning Path.

---

# Full Learning Dependency Flowchart

Include an expandable / interactive flowchart similar to:

```text
START
  │
  ▼
What is Programming?
  │
  ▼
Variables & Data Types
  │
  ▼
Operators
  │
  ▼
Selection
  │
  ▼
Looping
  │
  ▼
Functions
  │
  ├──────────────────┐
  │                  │
  ▼                  ▼
Arrays             Recursion
  │                  │
  ▼                  │
Memory               │
  │                  │
  ▼                  │
Pointers              │
  │                  │
  ▼                  │
Linked List           │
  │                  │
  ├── Stack           │
  └── Queue           │
                      │
Arrays ───────────────┤
  │                   │
  ▼                   ▼
Searching            Trees
  │                   │
  ▼                   ├── DFS
Binary Search         └── BFS
                      │
                      ▼
                    Graphs
                      │
              ┌───────┴────────┐
              ▼                ▼
             BFS              DFS
              │                │
              └───────┬────────┘
                      ▼
             Graph Algorithms


Functions
   │
   ▼
Recursion
   │
   ▼
Backtracking
   │
   ▼
Dynamic Programming
```

This flowchart should be used to show **dependencies**, not as the primary navigation.

---

# Interactive Flowchart Behavior

On hover or click on:

```text
Linked List
```

highlight its prerequisites:

```text
Variables
    ↓
Memory
    ↓
Pointers
    ↓
Linked List
```

On clicking:

```text
Dynamic Programming
```

highlight:

```text
Functions
   ↓
Recursion
   ↓
Arrays
   ↓
Problem Solving
   ↓
Dynamic Programming
```

Provide:

```text
[ Start Topic → ]
```

inside the active node information.

Do not turn the flowchart into a complex graph-editor UI.

---

# 21 — Why These Topics Come Next

Between major stages, add small dependency explanations.

Example:

```text
WHY POINTERS BEFORE LINKED LIST?

A Linked List connects nodes using memory references.

Understanding pointers first makes the structure
easier to understand instead of memorizing code.
```

Another:

```text
WHY TREE BEFORE DFS?

DFS is easier to understand once you already
understand nodes, children, and tree traversal.
```

Another:

```text
WHY RECURSION BEFORE BACKTRACKING?

Backtracking builds on recursive function calls
and explores multiple possible choices.
```

These should be short notes, not full lessons.

---

# 22 — Learning Roadmap UI

Use a vertical journey for the primary layout.

Example:

```text
START
  │
  │
  ● 01
  │ Understand Programming
  │
  │ 5 lessons
  │ Beginner
  │
  │ [ Start → ]
  │
  ● 02
  │ Work With Data
  │
  │ Variables
  │ Data Types
  │ Operators
  │
  ● 03
  │ Control Program Flow
  │
  │ Selection
  │ Looping
  │ Functions
  │
  ● 04
  │ Collections & Memory
  │
  │ Array
  │ String
  │ Pointer
  │
  ● 05
  │ DSA Foundations
  │
  │ Complexity
  │ Recursion
  │
  ● 06
  │ Core Data Structures
  │
  │ Array → Linked List → Stack → Queue
  │ Hash → Tree → Heap → Graph
  │
  ● 07
  │ Algorithms
  │
  │ Search
  │ Sort
  │ Traverse
  │
  ● 08
  │ Problem Solving
  │
  │ Patterns
  │ Greedy
  │ Backtracking
  │
  ● 09
  │ Advanced Algorithms
  │
  │ Dynamic Programming
  │ Graph Algorithms
  │ Advanced Trees
  │
  ★
  Strong DSA Foundation
```

Do not place every stage inside a large independent card.

Use:

* connector lines
* numbered milestones
* subtle active state
* progress indicators
* spacious typography

---

# Progress State

Support progress eventually.

Possible states:

```text
Completed
Current
Available
Locked
```

Example:

```text
✓ Programming Fundamentals

✓ Variables & Data

● Arrays & Strings
  CURRENT

○ Memory & Pointers

○ DSA Foundations
```

Avoid hard locking every lesson if Stacklore allows users to freely explore.

A better concept is:

```text
Recommended next
```

instead of:

```text
You cannot access this.
```

---

# Current Learning Indicator

At the top:

```text
Your Progress

12 / 64 lessons

████████░░░░░░░░░░░░ 19%

Current
Arrays & Strings

Next
Pointers & Memory

[ Continue Learning → ]
```

This can initially use local state or placeholder data.

It should later support user progress from a database.

---

# Programming Languages

Stacklore's concepts should remain primarily language-independent.

Near the relevant programming stage, explain:

```text
Concept
   ↓
Implementation

C++
Python
Java
```

Users should understand:

> The concept remains the same even when syntax changes.

Example:

```text
LOOP

C++
for (...)

Python
for ... in ...

Java
for (...)
```

Do not create three separate Learning Paths.

Use:

```text
ONE LEARNING PATH
        │
        ├── C++
        ├── Python
        └── Java
```

where applicable.

---

# Why C++ Is Often Preferred

Provide a small note around the transition from Programming Fundamentals to DSA.

Example:

> ### Why does Stacklore often prefer C++ for DSA examples?
>
> C++ makes several important computer science concepts more visible, including memory, references, pointers, and manual data-structure implementation.
>
> It also provides the Standard Template Library, which contains common structures and algorithms such as `vector`, `stack`, `queue`, `map`, and `priority_queue`.
>
> Python and Java can still be used to learn the same underlying algorithms.

Do not imply that C++ is mandatory.

---

# Visual Design

The Learning Path should feel like:

```text
Roadmap
+
Flowchart
+
Progress
+
Small visual explanations
```

Not:

```text
Documentation table of contents
```

Use:

* subtle grid background
* connector lines
* small glow only for active/current nodes
* clean typography
* monospace labels where appropriate
* generous spacing
* minimal cards
* thin borders
* lightweight animated transitions

Avoid:

* huge cards for every topic
* excessive gradients
* neon everywhere
* gamification overload
* cartoon map aesthetics
* giant icons
* excessive text

---

# Animation

Animations should reinforce relationships.

Examples:

### Roadmap entry

When scrolling:

```text
○
│
○
│
○
```

progressively becomes:

```text
●
│
●
│
●
```

as sections enter view.

Keep the animation subtle.

---

### Dependency connection

When selecting:

```text
Linked List
```

animate the path:

```text
Memory
   ↓
Pointers
   ↓
Linked List
```

Do not animate every connection continuously.

---

### Algorithm Demo

Use synchronized code execution:

```text
Active Source Line
        ↓
Algorithm State
        ↓
Visualization Animation
```

This should reuse the same visualization system used throughout Stacklore.

---

# Reusable Components

Do not put all logic into the MDX.

Suggested structure:

```text
components/
└── learning/
    └── learning-path/
        ├── LearningPathHero.tsx
        ├── BigPicture.tsx
        ├── LearningRoadmap.tsx
        ├── RoadmapStage.tsx
        ├── DependencyFlowchart.tsx
        ├── DataStructureFlowchart.tsx
        ├── DependencyNote.tsx
        ├── ProgressOverview.tsx
        ├── LanguageNote.tsx
        ├── WhyCpp.tsx
        └── LearningPathCTA.tsx
```

Shared:

```text
components/
└── learning/
    ├── code-visualizer/
    └── visualizations/
```

---

# Suggested MDX

Keep `learning-path.mdx` simple.

```mdx
---
title: Learning Path
description: Follow a structured journey from programming fundamentals to advanced data structures and algorithms.
---

<LearningPathHero />

<BigPicture />

<LearningRoadmap />

<DependencyFlowchart />

<DataStructureFlowchart />

<AlgorithmLearningDemo />

<LanguageNote />

<WhyCpp />

<LearningPathCTA />
```

The detailed roadmap data should preferably be stored in TypeScript rather than manually duplicated inside MDX.

---

# Learning Path Data

Suggested data structure:

```ts
type LearningStage = {
  id: string
  number: number
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  topics: LearningTopic[]
  prerequisites?: string[]
}

type LearningTopic = {
  id: string
  title: string
  href: string
  prerequisites?: string[]
}
```

Example:

```ts
{
  id: "linked-list",
  title: "Linked List",
  href: "/docs/data-structures/linked-list",
  prerequisites: [
    "arrays",
    "pointers",
    "memory"
  ]
}
```

The same dependency data can later power:

* Learning Path
* prerequisite indicators
* recommended lessons
* progress calculation
* flowcharts
* next lesson recommendation

Avoid defining relationships separately in many files.

---

# Responsive Design

## Desktop

Recommended:

```text
Sidebar | Learning Content | On This Page
```

Roadmap:

```text
Timeline       Explanation
    │
    ●────────────── Stage
    │
    ●────────────── Stage
```

---

## Tablet

Use a single main timeline.

Flowcharts may become horizontally scrollable if necessary.

---

## Mobile

Simplify:

```text
● 01 Programming
│
● 02 Data
│
● 03 Logic
│
● 04 Collections
```

Do not attempt to display a large dependency graph at full desktop scale.

Instead, when selecting a topic show:

```text
Prerequisites

Memory
 ↓
Pointers
 ↓
Linked List
```

---

# Final Page Flow

The final Learning Path page should follow:

```text
Learning Path Hero
        ↓
Big Picture
        ↓
Main Roadmap
        ↓
Programming Fundamentals
        ↓
Arrays & Memory
        ↓
Enter DSA
        ↓
Core Data Structures
        ↓
Data Structure Flowchart
        ↓
Core Algorithms
        ↓
Interactive Algorithm Demo
        ↓
Problem Solving
        ↓
Dynamic Programming
        ↓
Advanced DSA
        ↓
Full Dependency Flowchart
        ↓
Languages / Why C++
        ↓
Continue Learning CTA
```

---

# Important UX Principle

Users should never feel like topics are random.

Stacklore should continuously communicate relationships such as:

```text
Loop
 ↓
Array Traversal
 ↓
Linear Search
```

```text
Sorted Array
 ↓
Binary Search
```

```text
Pointer
 ↓
Linked List
```

```text
Queue
 ↓
BFS
```

```text
Stack / Recursion
 ↓
DFS
```

```text
Tree
 ↓
Tree Traversal
 ↓
DFS / BFS
```

```text
Graph
 ↓
BFS / DFS
 ↓
Shortest Path
 ↓
Dijkstra
```

```text
Recursion
 ↓
Backtracking
 ↓
Dynamic Programming
```

The user should understand **why they are learning something before they learn it**.

---

# Final Objective

After opening `/docs/learning-path`, a complete beginner should be able to answer:

```text
Where do I start?
↓
Programming Fundamentals

Why do I need Variables?
↓
Programs need to store information.

Why do I need Loops?
↓
Algorithms repeatedly process data.

Why learn Arrays?
↓
They introduce collections of data.

Why learn Pointers?
↓
They help explain nodes and linked structures.

What is a Data Structure?
↓
A way to organize data.

What is an Algorithm?
↓
A sequence of steps for solving a problem.

Why learn Complexity?
↓
To compare how efficient solutions are.

Why Linked List, Stack, Queue, Tree and Graph?
↓
Different problems require different ways of organizing data.

Why learn algorithms afterward?
↓
Algorithms operate on those structures.

What comes after basic algorithms?
↓
Problem-solving patterns and advanced DSA.
```

The Learning Path should therefore feel like a **connected story from zero programming knowledge to strong algorithmic thinking**, not merely a list of documentation pages.
