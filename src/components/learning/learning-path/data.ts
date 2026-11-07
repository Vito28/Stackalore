export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningStage {
  id: string;
  number: string;
  title: string;
  description: string;
  reason: string;
  level: LearningLevel;
  lessons: number;
  topics: string[];
  outcome: string;
  href: string;
}

export const learningStages: LearningStage[] = [
  {
    id: 'programming',
    number: '01',
    title: 'Understand Programming',
    description: 'Learn what a program is and how instructions become visible output.',
    reason: 'Algorithms are programs. First, you need a mental model of how a program executes.',
    level: 'Beginner',
    lessons: 5,
    topics: ['What is programming?', 'Programming languages', 'Source code', 'Input → Process → Output'],
    outcome: 'Explain how a simple program receives input, processes it, and produces output.',
    href: '/docs/data-structures/welcome',
  },
  {
    id: 'data',
    number: '02',
    title: 'Work With Data',
    description: 'Give information a name, a value, and a type the program can understand.',
    reason: 'A program needs to remember information before it can make decisions with it.',
    level: 'Beginner',
    lessons: 4,
    topics: ['Variables', 'Data types', 'Values', 'Operators'],
    outcome: 'Store information and transform it with arithmetic, comparison, and logical operations.',
    href: '/docs/data-structures/welcome#your-first-program',
  },
  {
    id: 'control-flow',
    number: '03',
    title: 'Control Program Flow',
    description: 'Make decisions, repeat operations, and separate work into reusable functions.',
    reason: 'Every algorithm repeatedly chooses what should happen next.',
    level: 'Beginner',
    lessons: 6,
    topics: ['Selection', 'Looping', 'Functions', 'Scope'],
    outcome: 'Trace conditions and loops without guessing what the program will do.',
    href: '/docs/data-structures/learning-path#your-roadmap',
  },
  {
    id: 'collections-memory',
    number: '04',
    title: 'Collections & Memory',
    description: 'Move from a single value to collections, addresses, references, and pointers.',
    reason: 'Nodes and linked structures make more sense when you know where data actually lives.',
    level: 'Beginner',
    lessons: 6,
    topics: ['Arrays', 'Strings', 'Memory', 'References', 'Pointers', 'Stack vs Heap'],
    outcome: 'Connect indexed data and memory references to later data-structure implementations.',
    href: '/docs/data-structures/arrays',
  },
  {
    id: 'dsa-foundations',
    number: '05',
    title: 'Enter DSA',
    description: 'Separate how data is organized from the steps used to process it.',
    reason: 'This distinction lets you compare solutions instead of memorizing isolated code.',
    level: 'Beginner',
    lessons: 4,
    topics: ['Introduction to DSA', 'Time complexity', 'Space complexity', 'Recursion'],
    outcome: 'Describe a solution using its structure, algorithm, and efficiency.',
    href: '/docs/data-structures/complexity',
  },
  {
    id: 'data-structures',
    number: '06',
    title: 'Core Data Structures',
    description: 'Choose a shape for data based on the operations a problem needs most.',
    reason: 'Different problems need different tradeoffs for access, insertion, ordering, and relationships.',
    level: 'Intermediate',
    lessons: 12,
    topics: ['Array', 'Linked List', 'Stack', 'Queue', 'Hash Table', 'Tree', 'Heap', 'Graph'],
    outcome: 'Select a suitable structure and explain the tradeoff behind that choice.',
    href: '/docs/data-structures/arrays',
  },
  {
    id: 'algorithms',
    number: '07',
    title: 'Core Algorithms',
    description: 'Search, sort, and traverse the structures you already understand.',
    reason: 'Algorithms are easier to reason about when their underlying data layout is familiar.',
    level: 'Intermediate',
    lessons: 10,
    topics: ['Linear Search', 'Binary Search', 'Elementary Sorts', 'Merge Sort', 'Quick Sort', 'BFS', 'DFS'],
    outcome: 'Trace an algorithm step by step and compare its time and memory cost.',
    href: '/docs/data-structures/searching',
  },
  {
    id: 'problem-solving',
    number: '08',
    title: 'Problem-Solving Patterns',
    description: 'Recognize reusable strategies instead of starting every problem from zero.',
    reason: 'The next skill is knowing when to use an algorithm, not only how it works.',
    level: 'Intermediate',
    lessons: 9,
    topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Divide & Conquer', 'Greedy', 'Backtracking'],
    outcome: 'Turn problem constraints into a shortlist of appropriate strategies.',
    href: '/docs/data-structures/learning-path#dependency-explorer',
  },
  {
    id: 'advanced',
    number: '09',
    title: 'Advanced DSA',
    description: 'Combine strong foundations into dynamic programming, advanced trees, and graph algorithms.',
    reason: 'Advanced techniques become manageable after their prerequisites are already intuitive.',
    level: 'Advanced',
    lessons: 12,
    topics: ['Dynamic Programming', 'Shortest Paths', 'Minimum Spanning Tree', 'Trie', 'Segment Tree', 'String Algorithms'],
    outcome: 'Break complex problems into known structures, states, and transitions.',
    href: '/docs/data-structures/learning-path#advanced-dsa',
  },
];

export const bigPictureSteps = [
  ['Programming', 'Tell a computer what to do.'],
  ['Data', 'Store information inside a program.'],
  ['Logic', 'Decide what should happen next.'],
  ['Collections', 'Work with many related values.'],
  ['Memory', 'Understand where information lives.'],
  ['Data Structures', 'Organize information for a problem.'],
  ['Algorithms', 'Process that information step by step.'],
  ['Problem Solving', 'Combine ideas into a complete solution.'],
] as const;

export const dependencyPaths = {
  'linked-list': {
    label: 'Linked List',
    description: 'A linked list is a chain of nodes connected by memory references.',
    nodes: ['Variables', 'Memory', 'Pointers', 'Nodes', 'Linked List'],
    href: '/docs/data-structures/linked-lists',
  },
  'binary-search': {
    label: 'Binary Search',
    description: 'Binary search repeatedly makes a decision on an ordered collection.',
    nodes: ['Variables', 'Arrays', 'Selection', 'Looping', 'Sorted Data', 'Binary Search'],
    href: '/docs/data-structures/searching',
  },
  'tree-dfs': {
    label: 'Tree DFS',
    description: 'Depth-first traversal builds directly on functions, recursion, and tree nodes.',
    nodes: ['Functions', 'Recursion', 'Nodes', 'Trees', 'DFS'],
    href: '/docs/data-structures/trees',
  },
  'dynamic-programming': {
    label: 'Dynamic Programming',
    description: 'Dynamic programming reuses results from repeated subproblems.',
    nodes: ['Arrays', 'Functions', 'Recursion', 'Complexity', 'Problem Solving', 'Dynamic Programming'],
    href: '/docs/data-structures/learning-path#advanced-dsa',
  },
} as const;

export type DependencyPathId = keyof typeof dependencyPaths;
