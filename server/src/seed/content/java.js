// Java & Advanced Java content tree. Same shape as dsa.js: each topic
// has "Deep Analysis" (core concept, theory) and "Data Research" (usage
// patterns, where to read more) tracks.

const java = {
  subject: {
    name: 'Java & Advanced Java',
    description: 'Core Java fundamentals through JVM internals, OOP, collections, concurrency, and enterprise patterns.',
    icon: 'coffee',
    color: '#FFB454',
    order: 2,
  },
  topics: [
    {
      name: 'Java Fundamentals',
      description: 'Syntax, data types, the JVM, and how Java actually executes your code.',
      order: 1,
      difficulty: 'beginner',
      estimatedMinutes: 35,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `Java is a statically-typed, object-oriented language that compiles to bytecode rather than native machine code. That single design decision — compile once, run on any JVM — is the reason Java spread across enterprise servers, Android devices, and embedded systems without ever needing platform-specific builds.

When you compile a .java file with javac, you get a .class file containing bytecode: a compact, platform-independent instruction set. The Java Virtual Machine (JVM) then either interprets this bytecode directly or, for code that runs often (hot paths), compiles it to native machine code on the fly via the Just-In-Time (JIT) compiler. This hybrid approach is why Java programs are slower to start than natively-compiled languages but converge to near-native speed for long-running processes.

Java is also statically typed: every variable's type is known at compile time, and the compiler rejects code where types don't line up. This catches a large class of bugs before the program ever runs, at the cost of being more verbose than dynamically-typed languages like Python or JavaScript.

The "write once, run anywhere" promise depends entirely on the JVM being correctly implemented for each platform — Oracle, OpenJDK, and other vendors each ship their own JVM, but all of them execute the same bytecode spec, which is what makes a .class file portable.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Minimal Java program — note the class wrapper and the exact method signature required',
                  code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, HttpTechNex!");
    }
}`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 14,
              content: `Java's core features explain where it gets used in production, and why teams choose it over alternatives for specific kinds of systems.

Platform independence (JVM bytecode): the same compiled artifact runs on Windows, Linux, and macOS without recompilation, which is why Java dominates in enterprises running heterogeneous server fleets.

Automatic memory management: the JVM's garbage collector reclaims memory for objects no longer reachable, removing an entire category of manual memory bugs (use-after-free, double-free) that plague C/C++ codebases. The tradeoff is GC pause time, which modern collectors like G1 and ZGC have driven down to single-digit milliseconds for most workloads.

Strong standard library: java.util, java.io, java.net, and java.util.concurrent ship with the JDK itself, meaning most common tasks — collections, file I/O, networking, threading — don't need a third-party dependency at all.

Where Java is the default choice in production:
- Large enterprise backends (banking, insurance, logistics) where long-term maintainability and a huge hiring pool matter more than raw startup speed.
- Android app development — the official Android SDK is Java/Kotlin based, with Kotlin now preferred but Java still widely present in legacy codebases.
- Big data tooling — Hadoop, Kafka, and Spark's core are written in Java/Scala and run on the JVM.
- High-throughput backend services at companies like Netflix, LinkedIn, and Uber, particularly where the team already has deep Java/JVM operational expertise.

Where Java is usually not the first choice: quick scripts and prototypes (Python wins on iteration speed), and CPU-bound systems-level code where you need manual memory layout control (Rust/C++ win there).`,
              externalLinks: [
                { label: 'Java Tutorial', url: 'https://www.geeksforgeeks.org/java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'JVM Architecture',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Understanding the JVM's internal structure explains a lot of Java's runtime behavior — why some operations are fast, why OutOfMemoryError happens, and why the same code can behave differently under heavy load.

Class loader subsystem: loads .class files into memory, in three steps — loading (reading bytecode), linking (verifying it, preparing default values, resolving symbolic references), and initialization (running static initializers). The bootstrap, platform, and application class loaders form a delegation hierarchy — a request first goes up to the parent loader before the child tries to load it itself.

Runtime data areas:
- Heap: where all objects live. Shared across all threads, and the primary target of garbage collection. Split internally into Young Generation (Eden + Survivor spaces, for newly created objects) and Old Generation (long-lived objects that survived several GC cycles).
- Stack: each thread gets its own stack, holding method call frames — local variables, partial results, and the call/return mechanism. A stack that grows unbounded (usually via uncontrolled recursion) throws StackOverflowError.
- Method area / Metaspace: stores class-level metadata — field and method info, runtime constant pool. In modern JVMs (Java 8+) this lives in native memory as Metaspace rather than a fixed-size area, removing the old PermGen size limit problem.
- PC registers and native method stacks: per-thread bookkeeping for the currently executing instruction and native (JNI) calls.

Execution engine: the interpreter executes bytecode line by line at first; the JIT compiler profiles which methods run frequently ("hot" methods) and compiles those directly to native machine code, caching the result so subsequent calls skip interpretation entirely.

Garbage collection in brief: most collectors use a generational hypothesis — most objects die young — so minor GCs sweep the young generation frequently and cheaply, while major/full GCs sweeping the old generation are rarer but more expensive. Picking a GC algorithm (G1, ZGC, Parallel) is a real production tuning decision for latency-sensitive services.`,
              externalLinks: [
                { label: 'JVM Architecture Guide', url: 'https://www.geeksforgeeks.org/java-jvm-run-time-data-areas/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Object-Oriented Programming',
      description: 'Encapsulation, inheritance, polymorphism, and abstraction — the four pillars, with real tradeoffs.',
      order: 2,
      difficulty: 'beginner',
      estimatedMinutes: 45,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `Object-oriented programming models a system as a collection of objects, each bundling its own data (fields) and behavior (methods), rather than as a sequence of operations on shared global data. Java was designed from the ground up as an OOP language — even primitives have wrapper classes, and every method lives inside some class.

The four pillars are usually taught together because they reinforce each other rather than being independent features:

Encapsulation: hiding an object's internal state behind a controlled interface (typically private fields with public getters/setters, or no setters at all for immutable objects). This means the internal representation can change without breaking code that depends on the object, as long as the public interface stays stable.

Inheritance: a class can extend another class, inheriting its fields and methods while adding or overriding behavior. This models "is-a" relationships — a Car is-a Vehicle — and enables code reuse, but overused inheritance creates fragile hierarchies that are hard to change later.

Polymorphism: the same method call can produce different behavior depending on the actual runtime type of the object, even though the calling code only knows about the parent type or interface. This is what allows a single List<Shape> to hold Circle, Square, and Triangle objects and call shape.area() on each without knowing which concrete type it is.

Abstraction: exposing only the essential behavior through interfaces or abstract classes, hiding implementation detail. A JDBC Connection interface, for example, lets your code talk to any database driver without knowing how that specific driver implements the connection internally.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Polymorphism in action: same call, different behavior per runtime type',
                  code: `abstract class Shape {
    abstract double area();
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    double area() { return Math.PI * radius * radius; }
}
class Square extends Shape {
    double side;
    Square(double s) { this.side = s; }
    double area() { return side * side; }
}
// shape.area() resolves to the correct override at runtime`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 16,
              content: `Beyond the four pillars, Java's specific OOP mechanics have practical implications worth knowing cold for interviews and real code review.

Method overloading vs overriding: overloading (same method name, different parameter list, resolved at compile time based on argument types) is different from overriding (subclass redefines a parent method with the same signature, resolved at runtime based on the actual object type). Mixing these up is one of the most common Java interview trip-ups.

Interfaces vs abstract classes: an interface defines a contract with no state (until Java 8 added default and static methods); a class can implement multiple interfaces but extend only one class. Abstract classes can hold shared state and partial implementation but only support single inheritance. The modern guideline: use interfaces to define capability ("can fly," "is comparable"), use abstract classes when you have genuinely shared implementation to reuse.

The diamond problem and why Java avoids it: languages with multiple class inheritance face ambiguity when two parent classes define the same method differently. Java sidesteps this by disallowing multiple class inheritance entirely — a class extends exactly one superclass — while still allowing multiple interface implementation, since interface default-method conflicts must be explicitly resolved by the implementing class.

Composition over inheritance: a widely-held modern design preference. Instead of a Car extending Engine, a Car holds an Engine instance and delegates to it. This avoids fragile base class problems, where a change in a deeply-inherited parent silently breaks every subclass, and is the principle behind most well-designed Java frameworks (Spring favors composition + dependency injection heavily over inheritance).

equals() and hashCode(): overriding equals() without also overriding hashCode() breaks the contract that equal objects must have equal hash codes, which silently corrupts behavior in HashMap and HashSet — objects that are logically equal end up in different buckets and lookups fail.`,
              externalLinks: [
                { label: 'OOP Concepts in Java', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Design Pattern Usage',
              isFreePreview: true,
              estimatedMinutes: 14,
              content: `OOP pillars become genuinely useful once you see the design patterns built on top of them — recurring, named solutions to recurring design problems.

Singleton: ensures a class has exactly one instance, with global access to it (commonly used for configuration managers, connection pools). Modern Java prefers enum-based singletons or framework-managed singletons (Spring beans) over the classic private-constructor-plus-static-instance pattern, since the latter has subtle issues under reflection and serialization.

Factory: delegates object creation to a dedicated method or class instead of calling new directly, so the calling code depends on an interface, not a concrete class. This is everywhere in the JDK itself — Calendar.getInstance(), various *Factory classes in javax.

Observer: an object (the subject) maintains a list of dependents (observers) and notifies them automatically of state changes. This is the backbone of Java's event listener model (ActionListener, PropertyChangeListener) and is conceptually identical to the pub/sub pattern used in modern event-driven backend systems.

Strategy: defines a family of interchangeable algorithms behind a common interface, letting the algorithm vary independently of the client using it. Java's Comparator interface is a textbook Strategy pattern — you pass a different comparison strategy into Collections.sort() without changing the sort logic itself.

Decorator: wraps an object to add behavior without modifying its class. Java's I/O classes are the canonical example — wrapping a FileInputStream in a BufferedInputStream adds buffering without touching either class's source.

Knowing which pattern fits which interview question (and why) tends to matter more than memorizing UML diagrams — interviewers are usually probing for "do you reach for the simplest tool that solves this specific problem," not "can you recite the Gang of Four book."`,
              externalLinks: [
                { label: 'Design Patterns in Java', url: 'https://www.geeksforgeeks.org/software-design-patterns/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Collections Framework',
      description: 'List, Set, Map, and Queue implementations — what each one actually costs under the hood.',
      order: 3,
      difficulty: 'intermediate',
      estimatedMinutes: 50,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `The Java Collections Framework is a unified architecture for storing and manipulating groups of objects, built around a small set of core interfaces: Collection, List, Set, Queue, and Map (Map technically sits outside the Collection interface hierarchy but is considered part of the framework).

List: an ordered collection that allows duplicates and indexed access. ArrayList is backed by a dynamic array — O(1) get by index, O(n) insert/delete in the middle. LinkedList is backed by a doubly-linked list — O(1) insert/delete at the ends, O(n) get by index since it must traverse from a head or tail.

Set: a collection with no duplicates. HashSet uses a hash table internally (in fact it's backed by a HashMap), giving O(1) average add/remove/contains but no ordering guarantee. LinkedHashSet adds predictable insertion-order iteration. TreeSet keeps elements sorted, backed by a red-black tree, giving O(log n) operations.

Map: key-value pairs with unique keys. HashMap gives O(1) average get/put via hashing, with no ordering guarantee. LinkedHashMap preserves insertion order (or optionally access order, useful for building an LRU cache). TreeMap keeps keys sorted, O(log n) operations, backed by a red-black tree — useful whenever you need range queries or sorted iteration over keys.

Queue / Deque: FIFO or double-ended access. ArrayDeque is generally preferred over the legacy Stack and LinkedList classes for both stack and queue use cases today, since it has lower overhead and no synchronization cost.

Choosing the right collection is rarely about memorizing Big-O tables — it's about matching the access pattern your code actually needs (random access? ordered iteration? frequent middle insertion? uniqueness?) to the structure that's cheap for exactly that pattern.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'HashMap average O(1) get/put vs TreeMap O(log n) but sorted',
                  code: `Map<String, Integer> scores = new HashMap<>();
scores.put("alice", 95); // O(1) average

Map<String, Integer> sortedScores = new TreeMap<>();
sortedScores.put("alice", 95); // O(log n), keys stay sorted`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `Production Java code leans on a handful of collection choices repeatedly — knowing why each one is the default for its situation is more valuable than memorizing the entire framework.

ArrayList as the default List: unless you have a specific reason to need O(1) insertion at arbitrary positions (rare in practice), ArrayList's cache-friendly contiguous storage beats LinkedList's pointer-chasing for almost every real workload, including ones that look like they'd favor LinkedList on paper.

HashMap as the default Map: O(1) average lookups make it the right choice unless you specifically need sorted iteration (TreeMap) or insertion-order iteration (LinkedHashMap, also the basis for a simple LRU cache via its access-order mode plus removeEldestEntry).

ConcurrentHashMap for multi-threaded access: the plain HashMap is not thread-safe — concurrent writes can corrupt its internal structure or cause infinite loops in older JDK versions. ConcurrentHashMap achieves thread safety with fine-grained locking (segment/bucket-level rather than one global lock), making it far more scalable under contention than synchronizing a HashMap wholesale or using the legacy Hashtable.

Iterating safely while modifying: directly removing from a List or Map while iterating with a for-each loop throws ConcurrentModificationException. The fix is using an Iterator's own remove() method, or building a list of items to remove and batching the removal after iteration completes.

Immutable collections: List.of(), Map.of(), and Collections.unmodifiableList() produce collections that throw UnsupportedOperationException on any mutation attempt. Returning immutable collections from public APIs is a defensive habit — it prevents callers from silently corrupting your internal state by mutating what you handed them.

Streams integration: every Collection can produce a Stream via .stream(), enabling functional-style filter/map/reduce pipelines — list.stream().filter(x -> x.isActive()).map(Order::getTotal).reduce(0.0, Double::sum) — which is now the idiomatic way to transform collections in modern Java rather than manual for-loops.`,
              externalLinks: [
                { label: 'Java Collections Framework', url: 'https://www.geeksforgeeks.org/collections-in-java-2/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Implementation Patterns',
              isFreePreview: true,
              estimatedMinutes: 13,
              content: `A few patterns recur constantly when collections show up in real systems and in interviews.

LRU Cache via LinkedHashMap: override removeEldestEntry() and construct with accessOrder=true to get a working least-recently-used cache in under 15 lines — a frequent system design / coding interview question with an elegant built-in solution most candidates don't know about.

Grouping with Collectors.groupingBy(): list.stream().collect(Collectors.groupingBy(Person::getDepartment)) turns a flat list into a Map<Department, List<Person>> in one line — the modern replacement for manually building a HashMap<K, List<V>> with null-checked get-or-create logic.

Bounded queues for backpressure: ArrayBlockingQueue with a fixed capacity is the standard way to implement backpressure in producer-consumer systems — when the queue is full, producers block (or fail fast, depending on the method called), preventing unbounded memory growth under load.

PriorityQueue for top-K problems: backed by a binary heap, giving O(log n) insert and O(log n) extract-min/max. The classic "find the k largest elements" pattern uses a min-heap of size k — push every element, and if the heap exceeds size k, pop the smallest, leaving the k largest after processing the whole input in O(n log k) instead of O(n log n) for a full sort.

Defensive copying: when a constructor accepts a mutable collection parameter, copying it into a new internal collection (rather than storing the reference directly) protects against the caller mutating your internal state later through their own reference to the original object.`,
              externalLinks: [
                { label: 'Collections Cheat Sheet', url: 'https://www.geeksforgeeks.org/java-collection-cheat-sheet/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Exception Handling',
      description: 'Checked vs unchecked exceptions, try-with-resources, and designing clean error contracts.',
      order: 4,
      difficulty: 'beginner',
      estimatedMinutes: 30,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `Java's exception handling forces a decision other languages leave implicit: should a caller be required, by the compiler, to acknowledge that something might go wrong?

Checked exceptions (subclasses of Exception other than RuntimeException) must either be caught or declared in a method's throws clause — the compiler enforces this. IOException is the classic example: any method that does file or network I/O is forced to make failure visible in its signature.

Unchecked exceptions (RuntimeException and its subclasses, like NullPointerException, IllegalArgumentException, IndexOutOfBoundsException) carry no such compiler obligation. They represent programming errors that, in principle, careful code should prevent rather than handle.

Errors (subclasses of Error, like OutOfMemoryError, StackOverflowError) represent serious problems an application generally shouldn't try to catch and recover from — they usually indicate the JVM itself is in trouble.

The try-catch-finally structure: code in finally always runs, whether or not an exception was thrown, whether or not the try block returned — making it the traditional place to release resources like file handles or sockets. Since Java 7, try-with-resources offers a cleaner alternative for anything implementing AutoCloseable, automatically closing the resource without an explicit finally block.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'try-with-resources closes the file automatically, even if an exception is thrown',
                  code: `try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line = reader.readLine();
} catch (IOException e) {
    System.err.println("Failed to read file: " + e.getMessage());
}`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `Exception design is one of the most debated topics in Java codebases, and the "right" answer depends heavily on what kind of error you're modeling.

Checked vs unchecked, the practical rule most modern Java style guides converge on: use checked exceptions only when the caller has a realistic, specific recovery action available (retry, fallback, prompt the user again). Use unchecked exceptions for programming errors and for situations with no sensible recovery path other than "fail and let it propagate to a top-level handler." Overusing checked exceptions leads to the well-known anti-pattern of catch blocks that just wrap-and-rethrow or, worse, silently swallow the exception.

Custom exception hierarchies: defining your own exception classes (extending RuntimeException for most application-level errors) lets calling code catch at exactly the right granularity — catching InsufficientFundsException specifically rather than a generic Exception that could mask unrelated bugs.

Exception chaining: when catching one exception and throwing a new, more meaningful one, always pass the original as the cause (new ServiceException("Payment failed", originalException)) rather than discarding it. This preserves the full stack trace for debugging instead of losing the root cause.

Don't catch Throwable or Exception broadly in application code: doing so swallows everything including programming errors you actually want to surface loudly (like a NullPointerException revealing a real bug), and it makes log output far less useful for debugging production incidents.

Global exception handlers: in Spring Boot REST APIs, @ControllerAdvice with @ExceptionHandler methods centralizes error-to-HTTP-response mapping in one place, instead of repeating try-catch blocks in every controller method — a pattern directly analogous to Express's centralized error-handling middleware in a Node backend.`,
              externalLinks: [
                { label: 'Exception Handling in Java', url: 'https://www.geeksforgeeks.org/exceptions-in-java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Best Practices Reference',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `A condensed reference for exception-handling decisions that come up repeatedly in code review.

Never use exceptions for ordinary control flow: throwing and catching an exception is significantly more expensive than a normal conditional branch (stack trace capture alone is costly), so exceptions should signal genuinely exceptional conditions, not be used as a substitute for an if-check or a loop break.

Always include a meaningful message: throw new IllegalArgumentException("age must be non-negative, got: " + age) is far more debuggable at 3am than throw new IllegalArgumentException(), which tells the next engineer nothing about what actually went wrong.

Fail fast at the boundary: validate inputs as early as possible (e.g., the moment a request hits your API layer) rather than letting bad data travel deep into business logic before something finally throws — the closer the failure point is to the bad input's origin, the easier the bug is to trace.

Logging exceptions: log the full stack trace at the point an exception is finally handled (not at every layer it passes through, which produces duplicate, confusing log spam), and choose log level deliberately — an expected, recoverable condition shouldn't be logged at ERROR severity, which should be reserved for things that actually need someone's attention.

Resource cleanup is not optional: any class implementing Closeable or AutoCloseable that gets opened (file handles, DB connections, sockets) must be closed via try-with-resources or an equivalent guarantee — leaked file descriptors and connections are a common, hard-to-diagnose cause of production outages under load.`,
              externalLinks: [
                { label: 'Java Exception Handling Best Practices', url: 'https://www.geeksforgeeks.org/exceptions-in-java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Multithreading & Concurrency',
      description: 'Threads, synchronization, the executor framework, and the concurrency bugs that only show up under load.',
      order: 5,
      difficulty: 'advanced',
      estimatedMinutes: 55,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Multithreading lets a single Java process run multiple paths of execution concurrently, sharing the same memory space. This is what makes a Java web server able to handle many simultaneous requests without spinning up a separate OS process per request.

A Thread in Java can be created by extending the Thread class or, more commonly in modern code, by implementing Runnable (or Callable, if the task needs to return a value) and passing it to a Thread or, better, an ExecutorService. Calling start() schedules the thread to run concurrently; calling run() directly just executes it synchronously on the current thread — a common beginner mistake.

The core challenge of concurrency isn't creating threads — it's coordinating shared mutable state safely. When two threads read and write the same variable without coordination, you get a race condition: the final result depends on unpredictable timing of which thread's operations interleave with which, often producing a different (wrong) answer on different runs.

The synchronized keyword provides mutual exclusion: only one thread can execute a synchronized block (or method) on a given object's monitor at a time. This solves race conditions but introduces its own risk — if two threads each hold a lock the other needs, you get deadlock, where both threads wait forever.

Java's memory model also matters here: without proper synchronization, one thread's write to a variable isn't guaranteed to ever become visible to another thread, due to CPU caching and compiler reordering optimizations. The volatile keyword and synchronized blocks both establish the "happens-before" guarantees needed for visibility, not just mutual exclusion.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'A race condition: without synchronization, the final count is unpredictable',
                  code: `class Counter {
    private int count = 0;
    public void increment() { count++; } // NOT atomic: read, add, write
}
// Two threads calling increment() 1000 times each may not produce 2000
// because count++ is actually three separate operations that can interleave.`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 16,
              content: `Modern Java concurrency code rarely manages raw Thread objects directly — the java.util.concurrent package (introduced in Java 5, expanded heavily since) provides higher-level building blocks that are both safer and more efficient.

ExecutorService and thread pools: rather than creating a new Thread per task (expensive — thread creation involves real OS overhead), an ExecutorService maintains a pool of reusable worker threads and queues tasks for them. Executors.newFixedThreadPool(n) is common for CPU-bound work sized to available cores; for I/O-bound workloads, a larger or cached pool tends to perform better since threads spend most of their time blocked waiting on I/O rather than using CPU.

CompletableFuture: represents a computation that will complete in the future, with a fluent API for chaining (.thenApply, .thenCompose), combining (.thenCombine), and handling errors (.exceptionally) across asynchronous operations — the Java analog to JavaScript Promises, and the modern replacement for manually managing Future.get() blocking calls.

java.util.concurrent.atomic classes: AtomicInteger, AtomicLong, and friends provide lock-free, thread-safe operations on single variables using CPU-level compare-and-swap (CAS) instructions, which is significantly cheaper than acquiring a lock for simple counter or flag updates.

Concurrent collections: ConcurrentHashMap, CopyOnWriteArrayList, and the various BlockingQueue implementations are specifically engineered for safe concurrent access without requiring the caller to manually synchronize — covered in more depth in the Collections Framework topic.

Where this shows up in real systems: connection pool management, request handling in any multi-threaded server, parallel batch processing (parallelStream() for CPU-bound data processing), and background job scheduling. The common failure mode in production is not "forgetting to use threads" but rather subtle shared-state bugs that only manifest under real concurrent load — which is exactly why concurrency bugs are notoriously hard to reproduce in local testing.`,
              externalLinks: [
                { label: 'Multithreading in Java', url: 'https://www.geeksforgeeks.org/multithreading-in-java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Concurrency Pitfalls Reference',
              isFreePreview: true,
              estimatedMinutes: 14,
              content: `A reference for the concurrency bugs that show up most often in code review and in production incident reviews.

Deadlock: two or more threads each hold a lock the other is waiting for, so neither can proceed. The classic fix is establishing a consistent global lock ordering (always acquire lock A before lock B, everywhere in the codebase) so circular waiting can never occur.

Livelock: threads are actively running, not blocked, but keep changing state in response to each other without making real progress — harder to detect than deadlock since CPU usage looks "normal" even though nothing useful is happening.

Starvation: a thread is perpetually denied access to a resource because other threads keep getting priority, often due to unfair lock implementations or poor priority configuration. Using fair locks (e.g., new ReentrantLock(true)) trades some throughput for guaranteeing no thread waits forever.

Double-checked locking for lazy singleton initialization: a common but easy-to-get-wrong pattern, requiring the field to be declared volatile — without volatile, a thread can observe a partially-constructed object due to instruction reordering, a bug that's notoriously hard to reproduce because it depends on JIT optimization behavior and CPU architecture.

Thread pool sizing mistakes: an unbounded thread pool under high load can exhaust memory or OS thread limits; an undersized pool for I/O-heavy work leaves throughput on the table. There's no universal right number — it needs to be measured against the actual workload's CPU-bound vs I/O-bound ratio.

Testing concurrency bugs: tools like JCStress exist specifically because standard unit tests rarely catch race conditions reliably — the bug depends on precise timing that a single test run may never trigger, which is why concurrency code reviews lean more heavily on reasoning about invariants than on test coverage alone.`,
              externalLinks: [
                { label: 'Concurrency Pitfalls', url: 'https://www.geeksforgeeks.org/concurrency-in-java/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Spring Boot & Enterprise Java',
      description: 'Dependency injection, REST APIs, and the Spring ecosystem that powers most production Java backends.',
      order: 6,
      difficulty: 'advanced',
      estimatedMinutes: 50,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Spring Boot is the dominant framework for building production Java backends today, and almost everything it does is built on one core idea from the broader Spring Framework: Dependency Injection (DI).

In a non-DI design, a class that needs a database connection typically constructs that connection itself inside its own code — which tightly couples the class to one specific implementation and makes testing painful (you can't easily swap in a fake database for a unit test). With DI, a class declares what it needs (via constructor parameters, typically), and a container — the Spring ApplicationContext — is responsible for constructing and "injecting" the right implementation at runtime.

This is enabled by annotations: @Component, @Service, @Repository mark a class as something Spring should manage (a "bean"); @Autowired (or, in modern Spring, constructor injection without any annotation at all) tells Spring where to inject a dependency. Spring scans the codebase at startup, builds a graph of beans and their dependencies, and wires everything together automatically — this is Inversion of Control: the framework controls object creation and lifecycle, not your application code directly calling new.

Spring Boot specifically adds auto-configuration and embedded servers on top of core Spring: instead of manually configuring an XML application context and deploying a WAR file to an external Tomcat server (the old-school Spring/J2EE workflow), a Spring Boot application is a self-contained executable JAR with an embedded server, runnable with a single java -jar command — a dramatically simpler deployment story that mirrors how Node.js or Go services are typically deployed.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Constructor injection — Spring resolves and provides the UserRepository automatically',
                  code: `@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository; // injected by Spring, not constructed here
    }
}`,
                },
              ],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 16,
              content: `Spring Boot's ecosystem covers most of what a production backend needs out of the box, which is why it remains the default choice for enterprise Java systems.

REST API development: @RestController combined with @GetMapping, @PostMapping, etc. maps HTTP routes to Java methods almost identically to how Express.js maps routes to handler functions in Node — request bodies are automatically deserialized from JSON into Java objects, and return values automatically serialized back to JSON, using Jackson under the hood.

Spring Data JPA: dramatically reduces boilerplate for database access. Defining an interface that extends JpaRepository<User, Long> automatically provides save(), findById(), findAll(), delete() and more — Spring generates the implementation at runtime. Custom queries can be declared just by following a naming convention (findByEmailAndStatus(String email, String status) generates the correct query automatically from the method name).

Spring Security: handles authentication and authorization declaratively — configuring which routes require which roles, integrating OAuth2/JWT-based auth (directly comparable to the Google OAuth + JWT cookie pattern this very platform uses on its Node backend), and protecting against common web vulnerabilities (CSRF, session fixation) by default.

Profiles and externalized configuration: application-dev.properties vs application-prod.properties let the same compiled JAR behave differently per environment (different DB URLs, log levels, feature flags) without code changes — directly analogous to using different .env files per environment in a Node app.

Where Spring Boot dominates: mid-to-large backend systems at companies with existing Java expertise, microservices architectures (Spring Cloud adds service discovery, config servers, circuit breakers), and any system where the team values convention-over-configuration and a vast, mature ecosystem of libraries over a leaner, more manual setup.`,
              externalLinks: [
                { label: 'Spring Boot Tutorial', url: 'https://www.geeksforgeeks.org/spring-boot/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Production Architecture Patterns',
              isFreePreview: true,
              estimatedMinutes: 14,
              content: `Patterns that recur across real Spring Boot production systems, beyond the basic CRUD tutorial.

Layered architecture: Controller (HTTP concerns only) → Service (business logic) → Repository (data access) is the standard layering, with each layer depending only on the one below it. The Controller should never talk to the Repository directly — keeping business logic out of controllers and out of repositories makes both layers independently testable.

DTOs (Data Transfer Objects) vs Entities: returning JPA entities directly from a REST controller couples your API contract to your database schema, and risks leaking internal fields or lazy-loading exceptions. Mapping entities to dedicated DTO classes at the API boundary (often via MapStruct or manual mapper methods) keeps the two concerns separate, so a database migration doesn't automatically become a breaking API change.

Global exception handling with @ControllerAdvice: centralizes the mapping from exceptions to HTTP status codes and error response bodies in one place, instead of repeating try-catch in every controller — directly analogous to centralized error-handling middleware in Express.

Caching with @Cacheable: Spring's caching abstraction lets a method's result be cached transparently (backed by Caffeine, Redis, etc.) just by adding an annotation, without rewriting the method's internal logic to manually check and populate a cache.

Database transaction management with @Transactional: wraps a service method in a database transaction automatically, rolling back all changes if any exception is thrown partway through — critical for operations that must succeed or fail atomically across multiple repository calls (e.g., debit one account and credit another).

Testing strategy: @WebMvcTest for controller-layer tests (mocking the service layer), @DataJpaTest for repository-layer tests against an in-memory database, and @SpringBootTest only when you genuinely need the full application context loaded — reaching for full integration tests by default makes the test suite slow and brittle.`,
              externalLinks: [
                { label: 'Spring Boot Architecture', url: 'https://www.geeksforgeeks.org/spring-boot-architecture/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = java;
