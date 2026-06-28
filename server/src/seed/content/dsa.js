// DSA content tree. Each topic has two tracks: "Deep Analysis" (concepts,
// theory, complexity) and "Data Research" (patterns, practice approach,
// where to read more). Sorting, Linked List, Trees and Graphs are written
// in full depth since they pair with the on-page visualizers; the rest
// have solid, real (non-stub) 2-3 chapter tracks.

const dsa = {
  subject: {
    name: 'DSA',
    description: 'Data Structures & Algorithms — visualized, explained, and benchmarked against real interview patterns.',
    icon: 'binary-tree',
    color: '#5EEAD4',
    order: 1,
  },
  topics: [
    {
      name: 'Arrays',
      description: 'Contiguous memory, indices, and the patterns that show up in almost every interview problem.',
      order: 1,
      difficulty: 'beginner',
      estimatedMinutes: 40,
      hasVisualizer: false,
      visualizerType: 'none',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `An array is a collection of elements stored at contiguous memory locations, each reachable in O(1) time through its index. That single property — constant-time random access — is the reason arrays are the default data structure for almost everything until you have a specific reason to reach for something else.

In memory, an array of n elements of size s bytes occupies a single block of n × s bytes. The address of element at index i is computed as base_address + i × s. There's no traversal involved, which is what separates arrays from linked structures: indexing is arithmetic, not search.

This contiguity is also the source of every array limitation you'll run into. Insertion or deletion in the middle requires shifting every element after the gap, which costs O(n) in the worst case. Resizing a full array (in languages where arrays are fixed-size, or under the hood in dynamic arrays like JavaScript's Array or Python's list) means allocating a new block and copying everything over.

Static vs dynamic arrays:
- A static array has a fixed size decided at creation. C arrays and Java arrays (int[] arr = new int[10]) are static.
- A dynamic array (ArrayList in Java, list in Python, Array in JS) grows automatically. Internally, when it runs out of space, it allocates a new block — typically double the size — and copies the old elements over. This doubling strategy is why amortized append is still O(1) even though any single resize operation is O(n).

Two-dimensional arrays are just arrays of arrays (or, in row-major layout, one flat array addressed with row × width + column). Understanding this layout matters for cache performance: iterating row-by-row in a row-major array is faster than column-by-column, because consecutive memory accesses hit the CPU cache, while jumping between rows causes cache misses.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Index access is O(1) regardless of array size',
                  code: `const arr = [10, 20, 30, 40, 50];
console.log(arr[3]); // 40 -- no traversal, direct address calculation`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Arrays earn their place as the default structure because most real workloads need fast random access and don't mutate length often. Here's where they specifically shine, and where they specifically don't.

Where arrays win:
- Lookups by position or index — anything where "give me the 5th element" needs to be instant.
- Iteration-heavy workloads, since contiguous memory means excellent CPU cache locality.
- Fixed or rarely-changing collections — buffers, matrices, lookup tables, image pixel data.
- As the backing store for other structures: hash tables use arrays internally, heaps are commonly implemented as arrays, and dynamic arrays power most language-level "lists".

Where arrays struggle:
- Frequent insertions/deletions at arbitrary positions — every shift costs O(n).
- Unknown or wildly fluctuating size with frequent shrink/grow cycles, where a dynamic array's resize overhead adds up.
- When you need O(1) insertion at both ends; that's what deques and linked lists are for.

A pattern worth internalizing early: the "two-pointer" technique. Many array problems (pair sum, removing duplicates from sorted input, reversing in place) are solved by walking two indices toward or away from each other instead of nesting loops. This converts an O(n²) brute force into O(n), and it only works because arrays give you O(1) access to any index from either pointer.

Prefix sums are the second pattern to know cold: precompute a running sum array where prefix[i] = arr[0] + arr[1] + ... + arr[i-1]. Once built (O(n)), any range sum query becomes O(1): sum(i, j) = prefix[j+1] - prefix[i]. This trades one O(n) preprocessing pass for O(1) queries afterward — the classic space-for-time tradeoff that recurs throughout DSA.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Two-pointer pattern: pair sum in a sorted array, O(n)',
                  code: `function pairWithSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}`,
                },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Common Problem Patterns',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `Most array interview questions fall into a handful of repeating shapes. Recognizing the shape is more valuable than memorizing any single solution, because the same shape reappears with different surface details across hundreds of problems.

Sliding window: used when a problem asks for "the longest/shortest/best subarray satisfying some condition." You maintain a window [left, right], expand right to grow it, and shrink from left when the condition breaks. This turns brute-force O(n²) or O(n³) subarray scans into O(n).

Kadane's algorithm (maximum subarray sum): track a running sum, resetting to zero whenever it goes negative, while keeping a separate running maximum. It's a specific, very efficient instance of dynamic programming hiding inside an array problem — O(n) time, O(1) space.

Sorting as preprocessing: a large fraction of "hard-looking" array problems become easy once the array is sorted, because sorted order exposes structure (you can binary search, use two pointers, or detect duplicates with a single pass). The cost is the O(n log n) sort itself, which is usually a fair trade.

In-place rearrangement: problems like "move zeroes to the end," "remove duplicates from a sorted array," or "Dutch national flag" (sort 0s, 1s, 2s) ask you to rearrange the array using O(1) extra space, usually with pointers tracking the next position to write.

For deeper, fully worked-through examples and curated problem sets on each pattern, GeeksforGeeks' Array Data Structure guide is one of the most exhaustive free references available, organized by difficulty and pattern.`,
              externalLinks: [
                { label: 'Array Data Structure Guide', url: 'https://www.geeksforgeeks.org/array-data-structure/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Sorting Algorithms',
      description: 'Bubble, merge, quick, and the tradeoffs between them — visualized step by step.',
      order: 2,
      difficulty: 'beginner',
      estimatedMinutes: 60,
      hasVisualizer: true,
      visualizerType: 'bubble-sort',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `Sorting is the process of arranging elements of a collection into a defined order, usually ascending or descending. It sounds like a solved problem — and computationally, for most practical purposes, it is — but sorting algorithms are taught extensively because they're the cleanest vehicle for teaching algorithmic tradeoffs: time complexity, space complexity, stability, and adaptivity all show up clearly when you compare even two or three sorting methods side by side.

A sorting algorithm is comparison-based if it decides order purely by comparing pairs of elements (a < b?). Comparison sorts have a hard lower bound of O(n log n) in the worst case — you cannot do better, ever, no matter how clever the algorithm, because there are n! possible orderings and each comparison gives you at most one bit of information to narrow that down (log2(n!) ≈ n log n). Bubble sort, insertion sort, merge sort, quicksort, and heap sort are all comparison sorts.

Non-comparison sorts (counting sort, radix sort, bucket sort) sidestep this bound by exploiting structure in the data itself — for example, knowing values are bounded integers — and can run in O(n) time. They trade generality for speed.

Stability matters more than it sounds. A sort is stable if elements with equal keys keep their original relative order. This is invisible when sorting plain numbers, but critical when sorting objects by one field while needing to preserve order on another (e.g., sorting students by grade, but wanting same-grade students to stay in their original enrollment order). Merge sort is stable; standard quicksort is not.

Adaptivity is whether an algorithm runs faster on data that's already partially sorted. Insertion sort is highly adaptive (near O(n) on nearly-sorted input); merge sort and quicksort generally aren't, regardless of input order.`,
            },
            {
              title: 'Bubble Sort',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Bubble sort repeatedly walks through the array, compares each adjacent pair, and swaps them if they're out of order. After one full pass, the largest unsorted element is guaranteed to have "bubbled" to its correct position at the end. Repeat for n-1 passes and the array is sorted.

Time complexity: O(n²) in the average and worst case, because for n elements you do roughly n passes of n comparisons each. Best case is O(n) if you add an early-exit optimization: if a full pass makes zero swaps, the array is already sorted and you can stop.

Space complexity: O(1) — it sorts in place, no auxiliary array needed.

Stability: stable, since it only swaps strictly out-of-order adjacent pairs, never reordering equal elements.

Bubble sort is almost never used in production because insertion sort does the same O(n²) job with fewer actual operations in practice. It's taught because the "compare adjacent, swap if needed, repeat" mental model is the simplest possible entry point into sorting, and the visualization of values "bubbling" into place builds intuition that transfers directly to understanding more complex sorts.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Bubble sort with early-exit optimization',
                  code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // already sorted, stop early
  }
  return arr;
}`,
                },
              ],
            },
            {
              title: 'Merge Sort',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `Merge sort is a divide-and-conquer algorithm: split the array in half recursively until each piece has one element (trivially sorted), then merge pairs of sorted pieces back together in order.

The merge step is where the work happens: given two sorted halves, walk through both with a pointer each, always taking the smaller of the two current elements into the output array. Because both halves are already sorted, this merge is a single O(n) linear pass.

Time complexity: O(n log n) in all cases — best, average, and worst — because the array is always split into log n levels, and each level does O(n) total work merging. This guaranteed performance regardless of input order is merge sort's biggest selling point over quicksort.

Space complexity: O(n), since merging requires auxiliary arrays to hold the halves before writing back. This is the real cost of merge sort's reliability — it's not in-place.

Stability: stable, as long as the merge step prefers the left half on ties.

Merge sort is the standard choice when you need guaranteed O(n log n) regardless of input, or when stability matters. It's also naturally suited to external sorting (sorting data too large to fit in memory) and parallelization, since the recursive halves are independent of each other.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Merge sort - divide and conquer',
                  code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
                },
              ],
            },
            {
              title: 'Quick Sort',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `Quicksort is also divide-and-conquer, but instead of splitting by position (like merge sort), it splits by value. Pick a "pivot" element, partition the array so everything smaller than the pivot ends up on its left and everything larger ends up on its right, then recursively sort each side. The pivot itself ends up in its final sorted position after partitioning.

Time complexity: O(n log n) on average, but O(n²) worst case — which happens when the pivot choice is consistently bad (e.g., always picking the first element on an already-sorted or reverse-sorted array, so every partition splits into a piece of size n-1 and a piece of size 0). Randomized pivot selection or "median of three" picking makes the worst case astronomically unlikely in practice.

Space complexity: O(log n) on average for the recursion stack, since it sorts in place and doesn't need auxiliary arrays the way merge sort does.

Stability: not stable in its standard form, since the partitioning step can reorder equal elements relative to each other.

Despite the worse theoretical worst case, quicksort is frequently faster than merge sort in practice for in-memory arrays, because it has better cache locality (it works on contiguous sub-ranges of the same array rather than allocating new ones) and lower constant-factor overhead. This is why most language standard libraries' default array sort (or a hybrid like introsort, which falls back to heap sort if quicksort's recursion gets too deep) is quicksort-based rather than merge-sort-based, even though merge sort's worst case is theoretically better.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Quicksort with Lomuto partition scheme',
                  code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
                },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Choosing the Right Sort',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `In an interview, "implement a sort" almost never means "write bubble sort from scratch" — it usually means demonstrating you know which sort fits which constraint. Here's the decision logic:

If you need guaranteed O(n log n) with no worst-case surprises, and don't mind O(n) extra space: merge sort.

If you need speed in the average case and memory is tight, and worst-case O(n²) is acceptable (or you randomize the pivot to make it vanishingly unlikely): quicksort.

If the data is mostly small or nearly sorted already: insertion sort, despite O(n²) worst case, often outperforms both because of low overhead and adaptivity — this is why many production sort implementations (Python's Timsort, Java's dual-pivot quicksort for primitives) fall back to insertion sort for small sub-arrays during recursion.

If the values are bounded integers in a known small range (like sorting exam scores 0-100, or single-digit counts): counting sort runs in O(n + k) where k is the range — faster than any comparison sort, because it isn't one.

If you need stability (preserving relative order of equal keys) for a multi-key sort: merge sort, or any stable sort.

For comparison tables, animated step-throughs, and additional sorting algorithms like heap sort and radix sort with full complexity breakdowns, GeeksforGeeks maintains one of the most complete sorting algorithm references available for free.`,
              externalLinks: [
                { label: 'Sorting Algorithms Guide', url: 'https://www.geeksforgeeks.org/sorting-algorithms/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Linked List',
      description: 'Nodes, pointers, and why "no random access" is a feature, not just a limitation.',
      order: 3,
      difficulty: 'beginner',
      estimatedMinutes: 45,
      hasVisualizer: true,
      visualizerType: 'linked-list',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `A linked list is a linear data structure where elements ("nodes") are not stored contiguously in memory. Instead, each node holds its own data plus a reference (pointer) to the next node in the sequence. The list itself is just a reference to the first node, called the head.

This is the structural opposite of an array. Where an array trades flexibility for O(1) indexed access, a linked list trades indexed access for flexible, cheap insertion and deletion. To reach the i-th element of a linked list, you must walk from the head, following pointers one at a time — O(n) in the worst case, with no shortcut.

Why accept that cost? Because insertion and deletion at the head, or at any node you already have a reference to, is O(1): you just rewire a couple of pointers, no shifting of other elements required. Compare that to an array, where inserting at the front means shifting every other element one slot over.

There are several variants. A singly linked list has each node point only forward. A doubly linked list adds a "previous" pointer too, letting you traverse backward and delete a node in O(1) without needing to track its predecessor separately. A circular linked list has the tail point back to the head instead of to null, useful for round-robin scheduling or any cyclic traversal.

Memory-wise, linked lists have real overhead: each node needs extra space for its pointer(s), and because nodes are scattered in memory rather than contiguous, traversal has poor cache locality compared to arrays — even though both are technically O(n) to scan, an array scan is typically faster in wall-clock time due to CPU cache prefetching.`,
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Linked lists are the right tool when insertion/deletion frequency outweighs the need for random access.

Where linked lists win:
- Implementing stacks and queues, where you only ever touch the ends, not the middle.
- Building LRU caches, where you need O(1) removal of arbitrary nodes (paired with a hash map for O(1) lookup) plus O(1) move-to-front.
- Situations with unknown, highly volatile size, where you want to avoid the resize-and-copy overhead dynamic arrays incur.
- As the underlying structure for adjacency lists in graph representations.

Where linked lists struggle:
- Anything requiring frequent access by index or position — binary search is impossible without random access, for instance.
- Memory-constrained environments, since pointer overhead per node (8 bytes per pointer on a 64-bit system, doubled for doubly linked lists) adds up for small data types.
- Cache-sensitive performance-critical code, where array contiguity wins even at the same Big-O.

A pattern worth knowing cold: the "fast and slow pointer" (tortoise and hare) technique. Two pointers traverse the list at different speeds — one node at a time, the other two nodes at a time. This detects cycles (if the fast pointer ever equals the slow pointer, there's a cycle), finds the middle of a list in one pass (when fast reaches the end, slow is at the midpoint), and finds the nth-from-end node, all without needing to know the list's length in advance.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Cycle detection with fast/slow pointers (Floyd\'s algorithm)',
                  code: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
                },
              ],
            },
            {
              title: 'Reversal & Manipulation',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Reversing a linked list in place is the single most common linked-list interview question, precisely because it forces you to manage pointers correctly without losing track of the rest of the list — a mistake here (overwriting next before saving a reference to it) silently corrupts the structure.

The iterative approach keeps three pointers: prev (starts as null), curr (starts at head), and a temporary next to remember where curr was pointing before you rewire it. At each step: save curr.next, point curr.next backward to prev, then advance prev and curr forward by one.

Time complexity: O(n), space: O(1) for the iterative version.

A recursive version exists too, conceptually cleaner but using O(n) call-stack space: reverse the rest of the list first, then fix up the current node's pointer.

Beyond full reversal, "reverse in groups of k" and "reverse between positions m and n" are common variations that test whether you understand the underlying mechanism rather than having memorized a single template.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Iterative reversal of a singly linked list',
                  code: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev; // new head
}`,
                },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Interview Patterns',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Linked list problems cluster around a small set of repeating techniques. Once you recognize the shape, most problems become a variation on one of these:

Dummy head node: when a problem might modify or remove the actual head (e.g., "remove all nodes with value X," "merge two sorted lists"), create a placeholder node before the real head. This avoids special-casing "what if the head itself needs to change" and lets every other node be handled uniformly.

In-place reversal of a sub-section: many "reverse between positions" or "reverse in groups of k" problems require carefully tracking the node just before the section being reversed, so you can reconnect it correctly afterward.

Merging two sorted lists: identical logic to the merge step in merge sort, just applied to linked nodes instead of array slices — walk both lists with a pointer each, always attaching the smaller current node to the result.

Detecting and removing cycles: Floyd's tortoise-and-hare finds whether a cycle exists; a second pass (resetting one pointer to the head and advancing both one step at a time) finds exactly where the cycle begins.

GeeksforGeeks' Linked List guide has a categorized problem list (singly, doubly, circular) that's a good supplement once the core patterns above feel solid.`,
              externalLinks: [
                { label: 'Linked List Data Structure Guide', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Stacks & Queues',
      description: 'LIFO and FIFO — the two access disciplines underneath recursion, parsing, and scheduling.',
      order: 4,
      difficulty: 'beginner',
      estimatedMinutes: 35,
      hasVisualizer: true,
      visualizerType: 'stack',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `A stack is a linear structure following Last-In-First-Out (LIFO) order: the most recently added element is the first one removed. Think of a stack of plates — you can only take from, or add to, the top. The two core operations are push (add to top) and pop (remove from top), both O(1).

A queue follows First-In-First-Out (FIFO) order: the first element added is the first removed, like a line at a counter. The two core operations are enqueue (add to the back) and dequeue (remove from the front), both O(1) when implemented correctly (a naive array-based queue that shifts elements on dequeue degrades to O(n) — this is why queues are usually implemented with a circular buffer or a linked list).

Both can be implemented on top of either an array or a linked list. Array-based stacks are simple and cache-friendly; array-based queues need either a circular buffer or two pointers (head and tail indices) to avoid O(n) shifting. Linked-list-based versions handle unbounded growth naturally but pay pointer overhead per element.

A deque (double-ended queue) generalizes both: insertion and removal are O(1) at both ends. Many languages provide this directly (Python's collections.deque, Java's Deque interface) and it's often the right default when you're not sure whether you need stack or queue semantics yet.`,
            },
            {
              title: 'Use Cases & Real Systems',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Stacks show up anywhere "undo the most recent thing" or "track nesting" is the operation you need.

- Function call stacks: every function call pushes a stack frame; returning pops it. This is literally why infinite recursion causes a "stack overflow" — you've pushed more frames than the call stack has memory for.
- Expression evaluation and syntax parsing: matching parentheses/brackets, evaluating postfix expressions, and parsing nested structures (JSON, HTML) all use an explicit stack to track "what level of nesting am I currently inside."
- Undo/redo functionality in editors: each action pushes onto an undo stack; undoing pops it (and often pushes onto a redo stack).
- Browser back button history.
- Depth-first search (DFS) on trees and graphs, either via explicit recursion (which uses the call stack implicitly) or an explicit stack data structure for iterative DFS.

Queues show up anywhere "process in arrival order" or "spread work evenly" is the requirement.

- Breadth-first search (BFS) on trees and graphs — process nodes level by level, which requires FIFO order.
- Task scheduling and job queues — print queues, CPU process scheduling, request handling in web servers.
- Rate limiting and buffering — a fixed-size queue (ring buffer) smooths out bursty input.
- Message queues in distributed systems (Kafka, RabbitMQ, SQS) — the conceptual queue data structure scaled up to a production messaging pattern.

A monotonic stack/queue (one that maintains elements in increasing or decreasing order by discarding ones that violate it) is a more advanced but very common interview pattern, used for problems like "next greater element" or sliding-window maximum, where it gets you from O(n²) brute force down to O(n).`,
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Implementation Patterns',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `When implementing a stack or queue yourself rather than using a language's built-in, the implementation choice matters:

Stack on an array: push/pop at the end of the array, both O(1) amortized (same amortized cost as dynamic array append). This is almost always the right default for a stack unless you specifically need O(1) worst-case (no occasional resize cost).

Queue on an array: never shift elements on dequeue. Instead, track a front index and back index, and either let the array grow (wasting the front gap) or wrap around as a circular buffer once the back hits the array's end. A naive \`arr.shift()\` implementation is a common interview anti-pattern that silently degrades to O(n) per dequeue.

Queue via two stacks: a classic interview question is implementing a queue using only stack operations. The trick: push everything onto stack A; when you need to dequeue, if stack B is empty, pop everything from A onto B (reversing order), then pop from B. This amortizes to O(1) per operation even though individual dequeues can occasionally cost O(n).

For implementations, complexity tables, and a broader set of stack/queue interview problems, GeeksforGeeks' Stack and Queue Data Structure guides are solid free references to go deeper.`,
              externalLinks: [
                { label: 'Stack Data Structure Guide', url: 'https://www.geeksforgeeks.org/stack-data-structure/', source: 'geeksforgeeks' },
                { label: 'Queue Data Structure Guide', url: 'https://www.geeksforgeeks.org/queue-data-structure/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Trees',
      description: 'Binary trees, BSTs, traversals, and balancing — hierarchy as a data structure.',
      order: 5,
      difficulty: 'intermediate',
      estimatedMinutes: 55,
      hasVisualizer: true,
      visualizerType: 'bst',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `A tree is a hierarchical data structure made of nodes, where each node has a value and references to child nodes, starting from one root node with no parent. Unlike linear structures (arrays, lists, stacks, queues), trees naturally represent nested, hierarchical relationships — file systems, organization charts, HTML DOM, decision logic.

Key terminology: the root is the topmost node. A leaf has no children. The depth of a node is its distance (number of edges) from the root. The height of a tree is the depth of its deepest leaf. A subtree rooted at any node is itself a valid tree.

A binary tree restricts each node to at most two children, conventionally called left and right. This restriction is what makes binary trees so analytically convenient — most of the classic algorithms (traversal, search, balancing) are defined specifically for binary trees, then generalized outward to n-ary trees when needed.

A binary search tree (BST) adds an ordering invariant on top of the binary tree shape: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger. This invariant is what makes search, insertion, and deletion all O(log n) on average — you can discard half the remaining tree at every step, the same logic as binary search on a sorted array, except now the structure itself encodes the sorted order instead of requiring contiguous memory.

The catch: a BST's O(log n) guarantee depends on the tree being reasonably balanced. If you insert already-sorted data into a plain BST, it degenerates into what is structurally a linked list — every node has only a right child, height becomes n, and every operation degrades to O(n). This is precisely the problem self-balancing trees (AVL, Red-Black) exist to solve.`,
            },
            {
              title: 'Traversals',
              isFreePreview: false,
              estimatedMinutes: 14,
              content: `Traversal means visiting every node in a tree exactly once, in some defined order. There are four standard traversals, three depth-first and one breadth-first, and each exists because it surfaces a different property of the tree.

Inorder (left, node, right): visits nodes in ascending sorted order for a BST. This is the traversal you use when you need sorted output from a BST — it's effectively "free" sorting, O(n), because the BST invariant already encodes the order.

Preorder (node, left, right): visits the root before its subtrees. Useful for copying/serializing a tree, since you can reconstruct the exact same structure by reading nodes in preorder and recursively rebuilding.

Postorder (left, right, node): visits a node only after both subtrees are fully processed. Used when children must be handled before the parent — deleting a tree node by node (you must delete children before the parent so you don't lose references), or evaluating expression trees (evaluate both operands before applying the operator at the root).

Level-order (breadth-first): visits nodes level by level, left to right, using a queue rather than recursion. This is the only one of the four that isn't depth-first, and it's the right choice whenever "shortest path" or "level-by-level" matters — finding the minimum depth of a tree, or printing the tree level by level.

All four are O(n) time since every node is visited exactly once. The three depth-first traversals are O(h) space for the recursion stack (h = tree height, which is O(log n) for a balanced tree but O(n) for a degenerate one); level-order is O(w) space for the queue, where w is the maximum width of any level.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'The three depth-first traversals, recursively',
                  code: `function inorder(node, result = []) {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.value);
  inorder(node.right, result);
  return result;
}

function preorder(node, result = []) {
  if (!node) return result;
  result.push(node.value);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

function postorder(node, result = []) {
  if (!node) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.value);
  return result;
}`,
                },
              ],
            },
            {
              title: 'Balancing & Self-Balancing Trees',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `A binary search tree's performance guarantee — O(log n) search, insert, delete — only holds if the tree's height stays O(log n). An unbalanced BST can degrade to O(n) height, at which point every operation is effectively a linked-list scan. Self-balancing trees solve this by enforcing a height invariant after every insertion and deletion.

AVL trees enforce that for every node, the heights of its left and right subtrees differ by at most 1. After every insert or delete, you check this "balance factor" up the path to the root; if it's violated anywhere, you fix it with a rotation — a local restructuring of a few pointers that restores balance without breaking the BST ordering invariant. AVL trees guarantee O(log n) height strictly, making them slightly more rigid (and slightly slower to update, due to more frequent rotations) but faster for lookup-heavy workloads.

Red-Black trees relax the balance condition: instead of a strict height-difference rule, each node is colored red or black under a set of rules (root is black, red nodes can't have red children, every path from root to a leaf has the same number of black nodes) that together bound the height to O(log n), just with a looser constant factor than AVL. Red-Black trees rebalance less aggressively than AVL, making inserts/deletes cheaper at a small cost to lookup speed — which is why they're the standard choice inside language standard libraries (Java's TreeMap, C++'s std::map both use Red-Black trees internally).

B-trees generalize this further for disk-based storage (databases, filesystems): each node holds multiple keys and children rather than just two, minimizing the number of disk reads needed to reach any record. This is why B-trees (and their variant B+ trees) are the standard structure underneath most database indexes.

The throughline across all of these: balance isn't a nice-to-have, it's the entire reason a "tree" beats a "sorted array" or "linked list" for dynamic data — and every self-balancing scheme is just a different set of rules for paying a small, bounded restructuring cost on every update to keep that O(log n) guarantee intact.`,
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Common Tree Problems',
              isFreePreview: true,
              estimatedMinutes: 14,
              content: `Tree problems in interviews almost always reduce to recursion on subtrees, since a tree's own definition is recursive (a tree is a node plus two trees). The skill being tested is rarely cleverness — it's correctly identifying the base case and the recursive case.

Height/depth of a tree: height(node) = 1 + max(height(left), height(right)), base case height(null) = 0. Nearly every tree problem either is this, or builds on this.

Validate a BST: a common mistake is checking only that node.left.value < node.value < node.right.value locally — this misses violations further down the tree. The correct approach passes a valid (min, max) range down through recursion, narrowing it at each step.

Lowest Common Ancestor (LCA): for a BST, you can use the ordering invariant directly — walk down from the root, going left if both target values are smaller than the current node, right if both are larger, and stopping at the first node where they split (or match). For a general binary tree without the BST invariant, you need a different recursive approach that returns the LCA found in each subtree and combines results upward.

Diameter of a tree (longest path between any two nodes, not necessarily through the root): the elegant trick is that the longest path through any given node equals the sum of the heights of its left and right subtrees, so you compute height and diameter simultaneously in one bottom-up pass rather than two separate traversals.

Serialization/deserialization: converting a tree to a string and back, usually via preorder traversal with explicit null markers, so the original structure (not just the values) can be exactly reconstructed.

GeeksforGeeks' Binary Tree and Binary Search Tree guides have extensive worked examples for all of the above, organized by traversal type and problem category.`,
              externalLinks: [
                { label: 'Binary Tree Data Structure Guide', url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/', source: 'geeksforgeeks' },
                { label: 'Binary Search Tree Guide', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Graphs',
      description: 'Vertices, edges, BFS/DFS, and the algorithms behind maps, networks, and dependencies.',
      order: 6,
      difficulty: 'intermediate',
      estimatedMinutes: 60,
      hasVisualizer: true,
      visualizerType: 'graph-bfs',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `A graph is a collection of vertices (nodes) connected by edges. Unlike a tree, a graph has no required hierarchy or single root — any vertex can connect to any other, including back to itself, and cycles are allowed. Trees are technically a restricted special case of graphs (connected, acyclic, with exactly one path between any two nodes).

Graphs are directed if edges have a direction (A → B doesn't imply B → A — think "follows" on social media, or one-way streets) or undirected if edges are symmetric (A — B implies both directions — think mutual friendships, or two-way roads).

Edges can be weighted (carrying a cost, distance, or capacity — think road distances or network bandwidth) or unweighted (just presence/absence of a connection matters).

Two standard representations:

Adjacency matrix: an n × n grid where matrix[i][j] = 1 (or the weight) if an edge exists from i to j, else 0. Checking whether an edge exists is O(1), but the matrix uses O(n²) space regardless of how few edges actually exist — wasteful for sparse graphs.

Adjacency list: each vertex stores a list of its neighbors (often implemented as an array of linked lists, or a hash map of arrays). Space is O(V + E) — proportional to what's actually there — making it the standard choice for most real-world graphs, which tend to be sparse (E is much smaller than V²). Checking whether a specific edge exists is slower (O(degree of vertex) instead of O(1)), but iterating all neighbors of a vertex — which is what most graph algorithms actually do — is faster and uses less memory.`,
            },
            {
              title: 'BFS and DFS',
              isFreePreview: false,
              estimatedMinutes: 16,
              content: `Breadth-first search (BFS) and depth-first search (DFS) are the two fundamental ways to traverse a graph, and nearly every other graph algorithm is built on top of one of them.

BFS explores level by level: visit all neighbors of the start node first, then all neighbors of those neighbors, and so on, using a queue to track what to visit next and a visited set to avoid revisiting nodes (critical in graphs, since cycles mean naive traversal can loop forever). Because it expands outward in concentric "rings" of distance, BFS is the algorithm to use whenever you need the shortest path in an unweighted graph — the first time you reach a target node via BFS, you've reached it via the fewest possible edges, guaranteed.

DFS explores as deep as possible down one path before backtracking, using either explicit recursion (which uses the call stack implicitly) or an explicit stack. DFS doesn't guarantee shortest paths, but it's the natural choice for problems about structure and reachability rather than distance: detecting cycles, finding connected components, topological sorting, and exploring all possibilities in backtracking problems (mazes, puzzle solving).

Both run in O(V + E) time — every vertex and every edge gets examined exactly once (twice for undirected edges, once from each endpoint, which doesn't change the asymptotic bound) — and O(V) space for the visited set, plus O(V) for BFS's queue or DFS's recursion/explicit stack in the worst case.

The choice between them is rarely about performance, since both are O(V + E); it's about what the problem is actually asking. "Shortest path / minimum steps" signals BFS. "Does a path exist / explore all paths / detect a cycle" signals DFS.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'BFS for shortest path in an unweighted graph (adjacency list)',
                  code: `function bfsShortestPath(graph, start, target) {
  const visited = new Set([start]);
  const queue = [[start, 0]]; // [node, distance]

  while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === target) return dist;

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1; // unreachable
}`,
                },
              ],
            },
            {
              title: "Dijkstra's & Shortest Paths",
              isFreePreview: false,
              estimatedMinutes: 16,
              content: `Plain BFS finds shortest paths only when every edge has the same cost. The moment edges carry different weights (road distances, network latency, monetary cost), BFS's "fewest edges" guarantee no longer means "cheapest path" — a path with more, cheaper edges can beat a path with fewer, expensive ones.

Dijkstra's algorithm solves single-source shortest paths on graphs with non-negative edge weights. The core idea: maintain a running "best known distance" to every vertex (initially infinity, except 0 for the source), and repeatedly pick the unvisited vertex with the smallest known distance, then relax its edges — for each neighbor, check if going through the current vertex gives a shorter path than what's currently recorded, and update if so. Once a vertex is "finalized" (picked as the minimum), its distance is guaranteed correct and never revisited, because all remaining edge weights are non-negative — there's no way a longer path could later become shorter.

Implemented with a min-priority-queue (a binary heap, typically) to always pick the next-smallest distance efficiently, Dijkstra's runs in O((V + E) log V) time. A naive implementation without a heap (scanning all vertices to find the minimum each time) runs in O(V²), which is actually faster for very dense graphs but slower for sparse ones.

The critical limitation: Dijkstra's breaks if any edge weight is negative, because the "once finalized, never revisited" assumption no longer holds — a later negative edge could retroactively create a shorter path to an already-finalized vertex. For graphs with negative weights (but no negative cycles), Bellman-Ford solves the same problem in O(V × E) by relaxing every edge V-1 times, slower but correct in the presence of negative weights, and it can additionally detect negative cycles, which Dijkstra's cannot do at all.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: "Dijkstra's algorithm (simple O(V²) version, no heap)",
                  code: `function dijkstra(graph, source) {
  const distances = {};
  const visited = new Set();
  Object.keys(graph).forEach((node) => (distances[node] = Infinity));
  distances[source] = 0;

  while (visited.size < Object.keys(graph).length) {
    const current = Object.keys(distances)
      .filter((n) => !visited.has(n))
      .reduce((min, n) => (distances[n] < distances[min] ? n : min));

    visited.add(current);

    for (const [neighbor, weight] of Object.entries(graph[current] || {})) {
      const newDist = distances[current] + weight;
      if (newDist < distances[neighbor]) distances[neighbor] = newDist;
    }
  }
  return distances;
}`,
                },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Topological Sort & Cycle Detection',
              isFreePreview: true,
              estimatedMinutes: 14,
              content: `A topological sort orders the vertices of a directed acyclic graph (DAG) so that for every directed edge u → v, u comes before v in the ordering. This is the exact algorithmic shape behind "what order should I run these tasks given their dependencies" — build systems, course prerequisite planning, package dependency resolution.

Topological sort only exists if the graph has no cycles — a cycle would mean task A depends on B, which depends on A, an impossible ordering. So cycle detection and topological sorting are deeply linked; most topological sort algorithms detect a cycle as a side effect (if you can't produce a valid ordering for all vertices, there's a cycle).

Kahn's algorithm (BFS-based): repeatedly find vertices with zero incoming edges ("in-degree zero" — nothing left depending on them being processed first), add them to the result, and decrement the in-degree of their neighbors. If you process all V vertices, the graph was a DAG; if you get stuck with vertices still having nonzero in-degree, there's a cycle.

DFS-based approach: run DFS, and after fully exploring a vertex (all its descendants processed), push it onto a stack. The final reversed stack is a valid topological order. Cycle detection here uses three states per node (unvisited, in-progress, done) — if DFS ever revisits a node that's currently "in-progress" (meaning it's an ancestor in the current recursion path, not just previously visited), that's a back edge, which means a cycle.

Both run in O(V + E). The choice is mostly style — Kahn's is iterative and gives natural insight into "what can run in parallel right now" (all current in-degree-zero nodes), while the DFS version is often shorter to write in interview settings.

For full worked examples of topological sort, cycle detection in both directed and undirected graphs, and broader graph algorithm coverage (minimum spanning trees, strongly connected components), GeeksforGeeks' Graph Data Structure guide is comprehensive and free.`,
              externalLinks: [
                { label: 'Graph Data Structure and Algorithms', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Dynamic Programming',
      description: 'Overlapping subproblems, memoization, and turning exponential brute force into polynomial time.',
      order: 7,
      difficulty: 'advanced',
      estimatedMinutes: 55,
      hasVisualizer: false,
      visualizerType: 'none',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Dynamic programming (DP) is an optimization technique for problems that have two specific properties: optimal substructure (the optimal solution to the whole problem can be built from optimal solutions to its subproblems) and overlapping subproblems (the same subproblems get recomputed repeatedly in a naive recursive approach).

The canonical illustration is computing Fibonacci numbers recursively. fib(n) = fib(n-1) + fib(n-2) looks innocent, but tracing the call tree shows fib(n-2) gets computed once as part of fib(n-1)'s call tree and once again directly — and this duplication compounds exponentially, giving a naive recursive Fibonacci O(2ⁿ) time despite there only being n distinct subproblems (fib(0) through fib(n)) that actually need computing.

DP exploits this by storing (caching) the result of each subproblem the first time it's computed, so subsequent requests for the same subproblem return instantly instead of recomputing. This single idea — trade memory for avoiding redundant computation — turns the Fibonacci example from O(2ⁿ) into O(n).

Two implementation styles achieve this:

Top-down (memoization): write the natural recursive solution, then add a cache (a hash map or array) that's checked before recursing and populated after computing. This preserves the intuitive recursive structure while eliminating redundant work.

Bottom-up (tabulation): build the answer iteratively from the smallest subproblems upward, filling a table (usually an array) in order, so that by the time you need fib(n-1) and fib(n-2), they're already computed and sitting in the table. This avoids recursion overhead entirely and is usually faster in practice, though sometimes less intuitive to derive than the top-down version.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'Fibonacci: naive O(2^n) vs memoized O(n) vs tabulated O(n)',
                  code: `// Naive - exponential, recomputes the same subproblems repeatedly
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// Top-down memoization - O(n) time, O(n) space
function fibMemo(n, cache = {}) {
  if (n <= 1) return n;
  if (cache[n] !== undefined) return cache[n];
  cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  return cache[n];
}

// Bottom-up tabulation - O(n) time, O(1) space (only need last two values)
function fibTab(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
                },
              ],
            },
            {
              title: 'Classic DP Patterns',
              isFreePreview: false,
              estimatedMinutes: 18,
              content: `Most DP problems you'll encounter are variations on a handful of recurring shapes. Recognizing which shape a problem matches is most of the difficulty; once recognized, the recurrence relation usually follows naturally.

0/1 Knapsack pattern: given items with weights and values, and a capacity limit, maximize value without exceeding capacity, where each item is taken entirely or not at all. The state is typically dp[i][w] = best value using the first i items with capacity w, with the choice at each step being "skip item i" vs "take item i" (if it fits). This pattern generalizes to subset-sum, partition equal subset sum, and target sum problems — anywhere you're making a binary include/exclude choice under a constraint.

Longest Common Subsequence (LCS) pattern: given two sequences, find the longest subsequence common to both (not necessarily contiguous). The state dp[i][j] = LCS length using the first i characters of string A and first j characters of string B; if characters match, extend the diagonal; if not, take the best of skipping one character from either string. This pattern underlies diff tools, edit distance, and longest palindromic subsequence.

Longest Increasing Subsequence (LIS) pattern: find the longest subsequence where each element is larger than the last. The naive O(n²) DP defines dp[i] = length of the longest increasing subsequence ending at index i; a more advanced O(n log n) version uses binary search over a maintained array of smallest tail values for each possible subsequence length.

Matrix/grid path pattern: count paths or find min/max cost paths through a grid, where dp[i][j] depends on dp[i-1][j] and dp[i][j-1] (moves from above or from the left). This pattern covers unique paths, minimum path sum, and grid-based obstacle problems.

The unifying skill across all of these: define what dp[state] actually means in plain English before writing any code. If you can't state the meaning of the state in one sentence, the recurrence relation won't come out right either.`,
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Recognizing DP in the Wild',
              isFreePreview: true,
              estimatedMinutes: 13,
              content: `The hardest part of DP isn't writing the recurrence once you've identified it — it's recognizing that a problem is a DP problem at all, especially when it's phrased to sound like a different kind of question.

Language signals worth flagging: "count the number of ways to..." (often DP, since the number of ways to reach a state is usually a sum over the ways to reach the states before it). "Find the minimum/maximum cost/value/length to..." (classic optimization phrasing, especially when "minimum" or "maximum" pairs with a constraint like "at most k moves" or "with at most one transaction"). "Can you reach/partition/split into..." (often boils down to a reachability or subset-sum-style DP in disguise).

A practical diagnostic: try to write the brute-force recursive solution first, even if it's exponential. If, while writing it, you notice the same (parameters) combination would get called multiple times from different branches — that's the overlapping-subproblems signal, and it means memoizing that brute-force solution directly often gets you most of the way to a working DP solution with minimal extra thinking.

A second diagnostic: if greedy (always making the locally best choice) seems almost right but fails on some edge case, that's frequently a sign the problem needs DP instead — greedy works when a locally optimal choice is provably always part of some globally optimal solution, and DP exists precisely for the cases where that assumption breaks down and you need to consider multiple possibilities and pick the best in hindsight.

For categorized DP problem sets organized by pattern (knapsack-style, LCS-style, partition-style), GeeksforGeeks' Dynamic Programming guide is a strong free reference to pressure-test pattern recognition against real problems.`,
              externalLinks: [
                { label: 'Dynamic Programming Guide', url: 'https://www.geeksforgeeks.org/dynamic-programming/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Recursion & Backtracking',
      description: 'Functions that call themselves, and the systematic way to explore every possibility.',
      order: 8,
      difficulty: 'intermediate',
      estimatedMinutes: 40,
      hasVisualizer: false,
      visualizerType: 'none',
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Recursion is a function calling itself to solve smaller instances of the same problem, until reaching a base case simple enough to answer directly without further recursion. Every recursive function needs exactly two things to terminate correctly: a base case (the stopping condition) and a recursive case that makes guaranteed progress toward that base case on every call.

Under the hood, each recursive call pushes a new stack frame onto the call stack, holding that call's local variables and where to resume execution once the call returns. This is why deep recursion without a base case (or with a base case that's never reached) causes a stack overflow — you've exceeded the memory allocated for the call stack, not run out of "time."

Backtracking is a specific application of recursion for exploring all possible solutions to a problem by building a solution incrementally, and abandoning ("backtracking" from) a partial solution the moment it's clear it cannot lead to a valid complete one. This pruning is what separates backtracking from brute-force enumeration of every possibility — you skip entire branches of the search space once you can prove they're dead ends, without ever having to fully construct them.

The general backtracking template: choose a candidate for the current position, recurse to fill in the rest, and if that recursive call doesn't lead to a solution, undo the choice (backtrack) and try the next candidate. This "choose, explore, unchoose" rhythm is the heartbeat of every backtracking algorithm, regardless of the specific problem.`,
              codeSnippets: [
                {
                  language: 'javascript',
                  caption: 'The backtracking template, applied to generating all subsets',
                  code: `function subsets(nums) {
  const result = [];
  const current = [];

  function backtrack(start) {
    result.push([...current]); // every state along the way is a valid subset

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);   // choose
      backtrack(i + 1);        // explore
      current.pop();           // unchoose (backtrack)
    }
  }

  backtrack(0);
  return result;
}`,
                },
              ],
            },
            {
              title: 'Classic Backtracking Problems',
              isFreePreview: false,
              estimatedMinutes: 14,
              content: `A handful of canonical problems cover nearly every backtracking pattern you'll see elsewhere, just with different "is this choice still valid" checks.

N-Queens: place N queens on an N×N chessboard so none attack each other. The backtracking structure places one queen per row, and before placing in a given column, checks whether that column or either diagonal is already under attack from a previously placed queen. If a row has no valid column, backtrack to the previous row and try its next option.

Permutations: generate every possible ordering of a set. At each recursive level, try every remaining (unused) element in the current position, recurse to fill the rest, then mark it unused again before trying the next option.

Combination Sum: find all combinations of numbers that sum to a target. The key pruning: once the running sum exceeds the target, or once you've sorted the candidates and the current candidate alone already exceeds what's left to reach, stop trying further candidates at that branch — no need to explore further, since they'd only make the sum larger.

Sudoku solver / maze solving: at each empty cell, try every valid digit (or every valid move direction), recurse, and backtrack if no choice from this cell leads to a full solution. The validity check (does this digit conflict with the row/column/box; is this maze cell open and unvisited) is what's problem-specific; the recursive skeleton around it is identical across all of these.

The time complexity of backtracking problems is usually expressed in terms of the branching factor and depth of the search tree (e.g., permutations of n elements is O(n!), since that's literally the number of leaf nodes in the search tree) — the actual runtime benefit backtracking provides over brute force comes from how aggressively the validity checks prune branches before they're fully explored, which doesn't change the worst-case bound but dramatically improves real-world performance on most inputs.`,
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'When to Reach for Backtracking',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Backtracking is the right tool specifically when a problem asks for "all possible..." (all subsets, all permutations, all valid arrangements) or "does there exist a valid..." (a valid Sudoku solution, a path through a maze) — anywhere the answer requires exploring a branching space of choices, rather than computing a single value via a formula or a single optimal path via DP.

A useful distinction from dynamic programming: DP also explores subproblems, but it does so to find one optimal value, exploiting overlapping subproblems via memoization. Backtracking is typically used when you need every valid solution (or to determine existence of at least one), and the subproblems usually aren't overlapping in a way that memoization would help — each path through the decision tree is genuinely distinct state, not a repeated computation.

A practical tell during problem-solving: if you find yourself wanting to write nested loops whose depth depends on the input size (which isn't possible to hardcode), that's a strong signal you need recursion instead — and if some of those loop iterations could be skipped early based on a partial check, that's backtracking specifically, not just plain recursion.

Performance-wise, always look for pruning opportunities before submitting a backtracking solution as final: sorting input first often enables early termination (as in Combination Sum), and checking constraints as early as possible in the recursion (rather than only at the full depth) avoids wasted exploration of doomed branches.

GeeksforGeeks' Backtracking Algorithms guide has a categorized set of practice problems (N-Queens, Sudoku, Hamiltonian path, graph coloring) that's a good next step for pattern repetition.`,
              externalLinks: [
                { label: 'Backtracking Algorithms Guide', url: 'https://www.geeksforgeeks.org/backtracking-algorithms/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = dsa;
