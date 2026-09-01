// Java & Advanced Java content tree.
// Structured to cover Java Basics, OOPs, Collections, Stream API, Multithreading, JVM Memory, and Spring Boot Enterprise Microservices.

const java = {
  subject: {
    name: 'Java & Advanced Java',
    description: 'Master Java fundamentals, Object-Oriented Programming (OOP), Collections Framework, Stream API, Multithreading, JVM Memory Tuning, and Spring Boot Microservices.',
    icon: 'coffee',
    color: '#FFB454',
    order: 2,
    hasRoadmap: true,
    hasCheatsheet: true,
  },
  topics: [
    {
      name: 'Java Basics & Environment',
      description: 'JVM, JRE, JDK, Bytecode execution, Primitive data types, Control Flow, and Array structures.',
      order: 1,
      difficulty: 'beginner',
      estimatedMinutes: 30,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Java Architecture (JVM, JRE, JDK) & Syntax',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `Java is a strongly-typed, class-based programming language designed to follow the philosophy of "Write Once, Run Anywhere" (WORA).

### The Java Execution Pipeline: JDK vs JRE vs JVM
- **JDK (Java Development Kit)**: The complete software development environment containing tools (compiler \`javac\`, debugger \`jdb\`, archiver \`jar\`) and the JRE.
- **JRE (Java Runtime Environment)**: Provides the class libraries (rt.jar / Java modules) and the JVM necessary to run Java applications.
- **JVM (Java Virtual Machine)**: An abstract computing machine that executes compiled Java **Bytecode** (\`.class\` files). Converts bytecode into machine-specific native instructions using the **JIT (Just-In-Time) Compiler**.

### Standard Java Entrypoint Syntax
Every standalone Java program requires a main method inside a class:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java & Advanced Java on HttpTechNex!");
    }
}
\`\`\`

### Primitive vs Reference Types
1. **Primitives (Stored directly in Stack memory)**:
   - \`byte\` (8 bits), \`short\` (16 bits), \`int\` (32 bits), \`long\` (64 bits).
   - \`float\` (32 bits), \`double\` (64 bits).
   - \`char\` (16-bit Unicode).
   - \`boolean\` (\`true\` / \`false\`).
2. **Reference Types (Stored in Heap memory with references on Stack)**:
   - Objects, Arrays, Interfaces, and Strings.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Primitive variables and System output in Java',
                  code: `public class PrimitiveDemo {
    public static void main(String[] args) {
        int studentCount = 1250;
        double passPercentage = 94.5;
        char grade = 'A';
        boolean isActive = true;

        System.out.printf("Count: %d, Rate: %.1f%%, Grade: %c, Active: %b%n",
            studentCount, passPercentage, grade, isActive);
    }
}`
                }
              ],
              externalLinks: [
                { label: 'JDK JRE JVM Differences', url: 'https://www.geeksforgeeks.org/difference-between-jdk-jre-and-jvm/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'Variables, Data Types & Control Flow',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `### Control Flow Statements
Java provides structured flow controls:
- **Branching**: \`if-else if-else\`, \`switch\` expressions (including enhanced switch yield statements in modern Java 17+).
- **Iteration**: \`for\` loops, \`while\` loops, \`do-while\` loops, and enhanced \`for-each\` loops.

### Java Arrays & Strings
- **Arrays**: Fixed-length contiguous memory collections.
- **String Pool**: Java maintains an internal **String Constant Pool** inside Heap memory. String literals are cached to minimize memory overhead. Because Strings are immutable, modifying a String creates a new object in memory.
- **StringBuilder**: Use \`StringBuilder\` for mutable, high-performance string concatenation in single-threaded logic.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Enhanced switch statement & StringBuilder usage',
                  code: `public class ControlFlowDemo {
    public static void main(String[] args) {
        String day = "MONDAY";
        
        // Modern Java switch expression
        String type = switch (day) {
            case "SATURDAY", "SUNDAY" -> "Weekend";
            default -> "Workday";
        };
        
        // High-performance string manipulation
        StringBuilder sb = new StringBuilder();
        sb.append("Day: ").append(day).append(" is a ").append(type);
        System.out.println(sb.toString());
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Java Strings & Memory', url: 'https://www.geeksforgeeks.org/string-concatenation-in-java/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Object-Oriented Programming (OOPs)',
      description: 'The 4 Pillars: Encapsulation, Inheritance, Polymorphism, Abstraction, Abstract Classes & Interfaces.',
      order: 2,
      difficulty: 'beginner',
      estimatedMinutes: 40,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'The 4 Pillars of OOPs in Java',
              isFreePreview: true,
              estimatedMinutes: 20,
              content: `Object-Oriented Programming (OOP) is centered around modular, reusable software design built on classes and objects.

### 1. Encapsulation
Hiding internal object state behind \`private\` fields and exposing controlled access via \`public\` getters and setters.

### 2. Inheritance
A subclass inherits attributes and behavior from a parent class using the \`extends\` keyword. Promotes code reuse.

### 3. Polymorphism
- **Compile-time Polymorphism**: Method Overloading (same method name, different signature/parameter list).
- **Runtime Polymorphism**: Method Overriding (subclass redefines parent method with \`@Override\`).

### 4. Abstraction
Hiding complex implementation details and showing only essential public features through interfaces and abstract classes.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Clean OOP implementation in Java',
                  code: `// Encapsulated Base Class
class BankAccount {
    private String accountNumber;
    private double balance;

    public BankAccount(String accNo, double balance) {
        this.accountNumber = accNo;
        this.balance = balance;
    }

    public double getBalance() { return balance; }
    
    public void deposit(double amount) {
        if (amount > 0) this.balance += amount;
    }
}

// Subclass inheriting BankAccount
class SavingsAccount extends BankAccount {
    private double interestRate;

    public SavingsAccount(String accNo, double balance, double rate) {
        super(accNo, balance);
        this.interestRate = rate;
    }
}`
                }
              ],
              externalLinks: [
                { label: 'OOP Concepts in Java', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'Interfaces, Abstract Classes & SOLID Principles',
              isFreePreview: false,
              estimatedMinutes: 20,
              content: `### Abstract Classes vs Interfaces
- **Abstract Class**: Can contain state (instance variables), constructors, concrete methods, and abstract methods. A class can extend only **one** abstract class.
- **Interface**: Pure behavioral contract. Supports default and static methods (since Java 8) and private methods (since Java 9). A class can implement **multiple** interfaces.

### SOLID Principles Overview
- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Interface with default methods & contract implementation',
                  code: `interface PaymentProcessor {
    boolean processPayment(double amount);

    // Default method (Java 8+)
    default void logTransaction(double amount) {
        System.out.println("Transaction processed for amount: $" + amount);
    }
}

class StripeProcessor implements PaymentProcessor {
    @Override
    public boolean processPayment(double amount) {
        System.out.println("Processing via Stripe API...");
        logTransaction(amount);
        return true;
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Abstract Class vs Interface', url: 'https://www.geeksforgeeks.org/difference-between-abstract-class-and-interface-in-java/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Java Collections Framework',
      description: 'List, Set, Map, Queue, ArrayList vs LinkedList, and HashMap internal hashing mechanics.',
      order: 3,
      difficulty: 'intermediate',
      estimatedMinutes: 45,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Lists, Sets & Queues in Java Collections',
              isFreePreview: true,
              estimatedMinutes: 20,
              content: `The Java Collections Framework (\`java.util\`) provides a unified architecture for managing groups of objects.

### Core Hierarchy
- **List Interface (Ordered, duplicate elements allowed)**:
  - \`ArrayList\`: Dynamic resizable array. $O(1)$ random access, $O(N)$ insertion/deletion in middle.
  - \`LinkedList\`: Doubly-linked list implementation. $O(1)$ head/tail insertion, $O(N)$ random access.
- **Set Interface (Unordered, unique elements only)**:
  - \`HashSet\`: Backed by a HashMap. $O(1)$ average time lookup.
  - \`TreeSet\`: Red-Black tree implementation. $O(\log N)$ sorted order iteration.
- **Queue & Deque**: \`ArrayDeque\` and \`PriorityQueue\` for FIFO and min/max heap processing.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'ArrayList vs HashSet usage',
                  code: `import java.util.*;

public class CollectionDemo {
    public static void main(String[] args) {
        // List retains order
        List<String> list = new ArrayList<>();
        list.add("Java");
        list.add("Spring");
        list.add("Java"); // duplicate allowed

        // Set enforces uniqueness
        Set<String> uniqueSet = new HashSet<>(list);
        System.out.println("Unique elements: " + uniqueSet); // [Java, Spring]
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Java Collections Framework', url: 'https://www.geeksforgeeks.org/collections-in-java-2/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'HashMap Internals & Bucket Hashing Mechanics',
              isFreePreview: false,
              estimatedMinutes: 25,
              content: `### How HashMap Works Under the Hood
A \`HashMap<K, V>\` stores key-value pairs using an array of **Buckets** (Node objects).

1. **Hashing**: Calling \`key.hashCode()\` calculates a 32-bit integer hash code.
2. **Bucket Index**: The bucket index is calculated via \`index = hash & (n - 1)\` where $n$ is bucket capacity.
3. **Collision Handling**:
   - If two keys produce the same bucket index, Java uses a **Singly Linked List** chain.
   - **Treeification (Java 8+)**: When a bucket list length exceeds 8 elements (and array capacity $\ge 64$), the bucket transforms from a Linked List into a **Red-Black Tree**, reducing worst-case lookup from $O(N)$ to $O(\log N)$.
4. **Resizing / Rehashing**: When capacity passes the load factor threshold ($0.75 \times \text{capacity}$), the table size doubles and elements are rehashed.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Custom key implementation overriding hashCode() and equals()',
                  code: `import java.util.Objects;

class UserKey {
    private final String userId;

    public UserKey(String id) { this.userId = id; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserKey userKey = (UserKey) o;
        return Objects.equals(userId, userKey.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }
}`
                }
              ],
              externalLinks: [
                { label: 'HashMap Internal Mechanism', url: 'https://www.geeksforgeeks.org/internal-working-of-hashmap-java/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Advanced Java Features & Stream API',
      description: 'Lambda Expressions, Stream API, Optional, Generics, and Functional Interfaces.',
      order: 4,
      difficulty: 'advanced',
      estimatedMinutes: 50,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Functional Interfaces & Lambda Expressions',
              isFreePreview: true,
              estimatedMinutes: 20,
              content: `### Functional Interfaces (Java 8+)
A **Functional Interface** contains exactly one abstract method (annotated with \`@FunctionalInterface\`).

Standard Built-in Functional Interfaces (\`java.util.function\`):
- **Predicate<T>**: Accepts $T$, returns \`boolean\` (\`test(T t)\`).
- **Function<T, R>**: Accepts $T$, returns $R$ (\`apply(T t)\`).
- **Consumer<T>**: Accepts $T$, returns \`void\` (\`accept(T t)\`).
- **Supplier<T>**: Accepts nothing, returns $T$ (\`get()\`).

### Lambda Expressions
Anonymous functions that provide inline implementations of functional interfaces:
\`(parameters) -> { body }\``,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Lambda expressions with Predicate and Consumer',
                  code: `import java.util.function.*;

public class LambdaDemo {
    public static void main(String[] args) {
        Predicate<Integer> isEven = num -> num % 2 == 0;
        Consumer<String> printer = str -> System.out.println("Log: " + str);

        if (isEven.test(42)) {
            printer.accept("42 is an even number!");
        }
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Java Lambda Expressions', url: 'https://www.geeksforgeeks.org/lambda-expressions-java-8/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'Java Stream API Operations & Pipelines',
              isFreePreview: false,
              estimatedMinutes: 25,
              content: `### Stream Pipeline Mechanics
A Stream is a sequence of elements supporting sequential and parallel aggregate operations.
1. **Source**: Collection, Array, or I/O channel.
2. **Intermediate Operations (Lazy evaluation)**:
   - \`filter()\`, \`map()\`, \`flatMap()\`, \`sorted()\`, \`distinct()\`, \`peek()\`.
3. **Terminal Operations (Triggers execution)**:
   - \`collect()\`, \`forEach()\`, \`reduce()\`, \`findFirst()\`, \`count()\`.

### Optional<T>
Prevents \`NullPointerException\` by wrapping nullable values cleanly.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Filtering, mapping, and collecting with Streams and Optional',
                  code: `import java.util.*;
import java.util.stream.*;

public class StreamDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

        List<String> result = names.stream()
            .filter(name -> name.length() > 3)
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());

        System.out.println(result); // [ALICE, CHARLIE, DAVID]
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Java Stream API Guide', url: 'https://www.geeksforgeeks.org/java-8-streams-tutorial/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Multithreading, Concurrency & JVM Memory',
      description: 'Threads, Synchronization, Thread Pools, ExecutorService, Heap & Stack Memory, and Garbage Collection.',
      order: 5,
      difficulty: 'advanced',
      estimatedMinutes: 55,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Multithreading, Synchronization & Thread Pools',
              isFreePreview: true,
              estimatedMinutes: 25,
              content: `### Multithreading Foundations
Multithreading enables concurrent execution of CPU tasks within a process.
- Implement \`Runnable\` or \`Callable<V>\` (preferred over extending \`Thread\`).
- Call \`start()\` to launch a thread asynchronously on the OS level.

### Concurrency Tools & Synchronization
- **synchronized**: Mutex lock ensuring only one thread executes a code block at a time.
- **volatile**: Enforces visibility by bypassing CPU L1/L2 caches and writing directly to main RAM memory.
- **ExecutorService**: Manages worker thread pools efficiently (\`Executors.newFixedThreadPool(n)\`).`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Thread pool execution with ExecutorService',
                  code: `import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(4);

        for (int i = 1; i <= 5; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("Task " + taskId + " running on thread " + Thread.currentThread().getName());
            });
        }

        executor.shutdown();
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Java Multithreading', url: 'https://www.geeksforgeeks.org/multithreading-in-java/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'JVM Memory Architecture & Garbage Collection',
              isFreePreview: false,
              estimatedMinutes: 25,
              content: `### JVM Memory Structure
1. **Heap Memory**: Shared across all threads. Stores objects, instance variables, and arrays. Divided into:
   - **Young Generation**: Eden space, Survivor spaces S0 & S1.
   - **Old Generation (Tenured)**: Long-surviving objects.
2. **Stack Memory**: Thread-private. Stores method stack frames, primitive local variables, and object references.
3. **Metaspace (Java 8+)**: Native memory storing class metadata.

### Garbage Collection (GC) Algorithms
GC automatically reclaims unreachable Heap memory:
- **Serial / Parallel GC**: High-throughput stop-the-world collectors.
- **G1 GC (Garbage-First)**: Divides heap into equal regions for predictable low-latency GC.
- **ZGC / Shenandoah**: Ultra-low-latency garbage collectors with sub-millisecond pause times.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Monitoring runtime memory usage in Java',
                  code: `public class MemoryDemo {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        
        System.out.printf("Free Memory: %d MB, Total Memory: %d MB%n", freeMemory, totalMemory);
    }
}`
                }
              ],
              externalLinks: [
                { label: 'JVM Memory Model', url: 'https://www.geeksforgeeks.org/jvm-works-jvm-architecture/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Spring Boot & Enterprise Microservices',
      description: 'Spring Boot Starters, Dependency Injection (DI/IoC), REST Controllers, Spring Data JPA & Hibernate.',
      order: 6,
      difficulty: 'advanced',
      estimatedMinutes: 60,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Spring IoC Container, Dependency Injection & Annotations',
              isFreePreview: true,
              estimatedMinutes: 25,
              content: `### Spring Framework Core: IoC & DI
- **Inversion of Control (IoC)**: Transferring control of object creation and lifecycle management to the Spring Container.
- **Dependency Injection (DI)**: Injecting required dependencies into components automatically.
  - **Constructor Injection** (Best practice): Immutable, clean, easy to mock unit tests.
  - **Stereotype Annotations**: \`@Component\`, \`@Service\`, \`@Repository\`, \`@RestController\`, \`@Configuration\`, \`@Bean\`.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Spring Service with Constructor Injection',
                  code: `import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    // Constructor Injection (autowired by Spring automatically)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Spring Dependency Injection', url: 'https://www.geeksforgeeks.org/spring-dependency-injection-di/', source: 'other' }
              ]
            },
            {
              title: 'Building RESTful Microservices with Spring Boot & Spring Data JPA',
              isFreePreview: false,
              estimatedMinutes: 35,
              content: `### Building REST Web Services
Spring Boot simplifies REST API endpoints using Jackson serialization:
- \`@RestController\` & \`@RequestMapping("/api/v1/users")\`
- \`@GetMapping\`, \`@PostMapping\`, \`@PutMapping\`, \`@DeleteMapping\`
- \`@PathVariable\`, \`@RequestParam\`, \`@Valid @RequestBody\`

### Spring Data JPA & Hibernate ORM
Spring Data JPA provides generic repository interfaces (\`JpaRepository<T, ID>\`) that generate database SQL queries automatically without boilerplate code.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Spring Boot REST Controller and JPA Repository',
                  code: `import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;

@Entity
@Table(name = "products")
class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;

    public Product() {}
    public Product(String name, double price) { this.name = name; this.price = price; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

interface ProductRepository extends JpaRepository<Product, Long> {}

@RestController
@RequestMapping("/api/v1/products")
class ProductController {
    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(repository.findAll());
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Spring Boot REST Controller', url: 'https://www.geeksforgeeks.org/spring-boot-rest-controller/', source: 'other' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = java;
