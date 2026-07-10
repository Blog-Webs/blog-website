// Java & Advanced Java content tree. Structured exactly to cover Java Basics, OOPs, Advanced OOPs, and Spring Boot.
// Used by server/src/seed/index.js to seed the database.

const java = {
  subject: {
    name: 'Java & Advanced Java',
    description: 'Master Java fundamentals, Object-Oriented Programming (OOP), Stream API, Multithreading, and Spring Boot development.',
    icon: 'coffee',
    color: '#FFB454',
    order: 2,
  },
  topics: [
    {
      name: 'Java Basics',
      description: 'Syntax, variables, data types, loops, strings, arrays, and space/time complexity analysis.',
      order: 1,
      difficulty: 'beginner',
      estimatedMinutes: 30,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Syntax, Variables, Data Types & Loops',
              isFreePreview: true,
              estimatedMinutes: 12,
              content: `Java is a strongly-typed, class-based programming language designed to have as few implementation dependencies as possible. The core philosophy of "Write Once, Run Anywhere" (WORA) is achieved by compiling Java code into platform-independent bytecode, which is executed by the Java Virtual Machine (JVM).

### Syntax & Variables
Every Java program must contain at least one class wrapper and a main method as the entry point:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`
Variables in Java are containers for storing data values. Being strongly-typed, every variable must have a declared type:
- **Local variables**: Declared inside methods.
- **Instance variables**: Declared inside a class but outside any method.
- **Static variables**: Declared with the 'static' keyword, shared across all instances of the class.

### Primitive & Reference Data Types
Java data types are split into two categories:
1. **Primitve Types**: Store simple values. There are 8 primitives:
   - Integer types: \`byte\` (1 byte), \`short\` (2 bytes), \`int\` (4 bytes), \`long\` (8 bytes).
   - Floating-point types: \`float\` (4 bytes), \`double\` (8 bytes).
   - Character type: \`char\` (2 bytes, supports Unicode).
   - Boolean type: \`boolean\` (\`true\` / \`false\`).
2. **Reference Types**: Store references to memory addresses where the actual objects live (e.g., Classes, Interfaces, Arrays, Strings).

### Control Flow & Loops
Java provides standard control flow statements:
- **if-else / switch**: For conditional branching.
- **for loop**: Best when the number of iterations is known.
- **while loop**: Repeats a statement while a condition remains true.
- **do-while loop**: Similar to while, but guarantees at least one execution.
- **Enhanced for-each loop**: Used exclusively to loop through elements in an array or collection.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Primitive vs reference types and loops comparison',
                  code: `int primitiveNum = 42; // primitive
String referenceStr = "Java Basics"; // reference

// Enhanced for loop over an array
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println("Value: " + num);
}`
                }
              ],
              externalLinks: [
                { label: 'Java Variables & Types', url: 'https://www.geeksforgeeks.org/variables-in-java/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'Strings, Arrays & Time/Space Complexity',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `### Java Arrays
An array is a contiguous block of memory holding elements of the same data type. Arrays are objects in Java, are zero-indexed, and have a fixed length determined at instantiation:
\`\`\`java
int[] numbers = new int[5]; // initialized with default values (0)
int[] initializedArr = {10, 20, 30, 40};
System.out.println(initializedArr.length); // 4
\`\`\`

### Java Strings
Strings represent a sequence of characters. In Java, Strings are **immutable** — once created, their values cannot be changed. Any modification returns a new String object.
- **String Pool**: A special storage area in the Java Heap memory. If a string literal is created, the JVM checks the String Pool first to reuse existing instances, optimizing memory.
- **StringBuilder & StringBuffer**: Mutable sequences of characters. Use \`StringBuilder\` for single-threaded operations (as it is not synchronized, making it faster) and \`StringBuffer\` for multi-threaded thread-safe operations.

### Time & Space Complexity
Understanding algorithmic efficiency is key to writing scalable Java code.
- **Time Complexity**: Measures how execution time scales with input size $N$, expressed using Big-O notation.
  - $O(1)$ - Constant time (e.g., accessing an array index).
  - $O(\log N)$ - Logarithmic time (e.g., Binary Search).
  - $O(N)$ - Linear time (e.g., traversing an array or string).
  - $O(N \log N)$ - Merge/Quick sort.
  - $O(N^2)$ - Quadratic time (e.g., nested loops).
- **Space Complexity**: Measures auxiliary memory footprint scaling with input size $N$. Creating a new array of size $N$ requires $O(N)$ auxiliary space.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Efficient string manipulation using StringBuilder',
                  code: `// Inefficient: creates multiple string instances in the pool
String s = "";
for(int i = 0; i < 100; i++) s += i;

// Efficient: modifies the same internal char array, O(N) time
StringBuilder sb = new StringBuilder();
for(int i = 0; i < 100; i++) sb.append(i);
String result = sb.toString();`
                }
              ],
              externalLinks: [
                { label: 'Java String Immutability', url: 'https://www.geeksforgeeks.org/oops-object-oriented-programming/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'OOPs Concepts',
      description: 'Object-Oriented Programming pillars: Classes, Objects, Inheritance, Encapsulation, Polymorphism, and Abstraction.',
      order: 2,
      difficulty: 'beginner',
      estimatedMinutes: 35,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'The 4 Pillars of OOPs',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects", which contain data (fields/attributes) and code (methods/behaviors).

### Classes and Objects
- **Class**: A blueprint or template from which individual objects are created. It defines variables and methods.
- **Object**: A concrete instance of a class. It occupies physical memory.

### The 4 Pillars:
1. **Inheritance**: The mechanism where a subclass inherits fields and methods from a superclass (parent), promoting code reuse. Java uses the \`extends\` keyword and supports single class inheritance.
2. **Encapsulation**: Bundling variables and methods within a single class, and hiding internal implementation details using access modifiers (\`private\`, \`protected\`, \`public\`). Access is controlled via public getter and setter methods.
3. **Polymorphism**: The ability of an object to take on many forms.
   - *Compile-time (Static) Polymorphism*: Method Overloading (same method name, different parameter lists, resolved at compile-time).
   - *Runtime (Dynamic) Polymorphism*: Method Overriding (subclass redefines a superclass method, resolved at runtime based on the actual object instance).
4. **Abstraction**: Hiding complex details and showing only essential interfaces. Achieved using **Abstract Classes** (can have abstract & concrete methods, instance variables) and **Interfaces** (pure contracts, supports multiple inheritance, default methods since Java 8).`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Pillars of OOP implemented cleanly in Java code',
                  code: `// 1. Abstraction (Interface)
interface Animal {
    void makeSound(); // abstract method
}

// 2. Inheritance
class Dog implements Animal {
    // 3. Encapsulation
    private String name;

    public Dog(String name) { this.name = name; }
    public String getName() { return name; }

    // 4. Polymorphism (Overriding)
    @Override
    public void makeSound() {
        System.out.println(name + " says: Woof!");
    }
}`
                }
              ],
              externalLinks: [
                { label: 'OOP Concepts in Java', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'OOP Implementation Practice',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `### Interface vs Abstract Class
Choosing between interfaces and abstract classes determines code flexibility:
- Use an **Abstract Class** when classes share a common identity ("is-a" relationship) and need to inherit fields and constructor states.
- Use an **Interface** when classes share a behavioral contract ("can-do" relationship) across completely unrelated class trees.

### Access Modifiers Matrix
- \`private\`: Visible within the class only.
- \`default\` (no modifier): Visible within the package.
- \`protected\`: Visible within package and subclasses.
- \`public\`: Visible everywhere.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Abstract class with implementation inheritance',
                  code: `abstract class Employee {
    protected String name;
    protected double baseSalary;

    public Employee(String name, double salary) {
        this.name = name;
        this.baseSalary = salary;
    }
    
    // Abstract method to be overridden by subclasses
    abstract double calculateSalary();
}`
                }
              ],
              externalLinks: [
                { label: 'Interfaces in Java', url: 'https://www.geeksforgeeks.org/interfaces-in-java/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Advanced OOPs',
      description: 'Comparable & Comparator, Java Stream API, Multithreading, Concurrency, and Thread Pool Executors.',
      order: 3,
      difficulty: 'advanced',
      estimatedMinutes: 45,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Comparable, Comparator & Java Stream API',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `### Comparable vs Comparator
Java provides two interfaces to sort collections of custom objects:
1. **Comparable**: Defines the *natural sorting order* of a class. The class must implement \`Comparable<T>\` and override the \`compareTo()\` method. (Alters the class definition itself).
2. **Comparator**: Defines a *custom sorting order*. Implemented outside the target class as a separate comparator class or lambda expression, overriding the \`compare()\` method. Useful when sorting objects in multiple different ways.

### Java Stream API (Introduced in Java 8)
Streams represent a pipeline of computational steps through which collection elements flow. They do not store data, nor do they modify the original source.
- **Intermediate Operations**: Return a new stream, executed lazily (e.g., \`filter()\`, \`map()\`, \`sorted()\`).
- **Terminal Operations**: Execute the pipeline to return a concrete result (e.g., \`collect()\`, \`forEach()\`, \`reduce()\`, \`count()\`).`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Custom sorting with Comparator and Stream transformations',
                  code: `import java.util.*;
import java.util.stream.*;

class Student {
    String name;
    int score;
    Student(String name, int score) { this.name = name; this.score = score; }
}

// Stream Pipeline: filters, sorts, and collects
List<Student> students = Arrays.asList(new Student("Alice", 85), new Student("Bob", 95));
List<String> honorsStudents = students.stream()
    .filter(s -> s.score >= 90)
    // Sort custom by score descending using Comparator lambda
    .sorted((s1, s2) -> Integer.compare(s2.score, s1.score))
    .map(s -> s.name)
    .collect(Collectors.toList());`
                }
              ],
              externalLinks: [
                { label: 'Java Stream API Guide', url: 'https://www.geeksforgeeks.org/java-8-streams-tutorial/', source: 'geeksforgeeks' }
              ]
            },
            {
              title: 'Multithreading, Concurrency & Thread Pool Executor',
              isFreePreview: false,
              estimatedMinutes: 18,
              content: `### Multithreading Foundations
Multithreading allows concurrent execution of multiple parts of a program. A thread is a lightweight subprocess.
- Created by extending \`Thread\` or implementing \`Runnable\`. Implementing Runnable is preferred because Java only supports single class inheritance.
- Always use \`thread.start()\` to execute concurrently. Calling \`thread.run()\` executes it synchronously on the caller thread.

### Concurrency Coordinates
- **Synchronization**: Prevents thread interference and memory consistency errors. The \`synchronized\` keyword guarantees mutual exclusion.
- **volatile**: Declares that a variable's value is read and written directly to main memory, ensuring changes are immediately visible to all threads.
- **Atomic Variables**: Thread-safe single-variable update operations (e.g., \`AtomicInteger\`) using lock-free CPU instructions (Compare-and-Swap).

### Thread Pool Executor
Creating threads is expensive due to OS context switching. An \`ExecutorService\` manages a pool of reusable worker threads:
- **Core Pool Size**: The minimum number of active threads kept in the pool.
- **Max Pool Size**: The maximum number of threads allowed in the pool.
- **Work Queue**: A queue holding tasks before they are executed. Fixed-size bounded queues (like \`ArrayBlockingQueue\`) prevent OutOfMemory issues under high load.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Creating and executing tasks with a ThreadPoolExecutor',
                  code: `import java.util.concurrent.*;

// Create a thread pool with fixed 3 worker threads
ExecutorService executor = Executors.newFixedThreadPool(3);

executor.submit(() -> {
    System.out.println("Executing task concurrently on: " + Thread.currentThread().getName());
});

// Always shutdown executors when done to prevent process leaks
executor.shutdown();`
                }
              ],
              externalLinks: [
                { label: 'Java Concurrency Utilities', url: 'https://www.geeksforgeeks.org/multithreading-in-java/', source: 'geeksforgeeks' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Spring Boot Framework',
      description: 'Spring Boot Starters, REST APIs, Dependency Injection (DI), Maven/Gradle, and running Spring applications.',
      order: 4,
      difficulty: 'advanced',
      estimatedMinutes: 40,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Starter Projects, Maven/Gradle & Dependency Injection',
              isFreePreview: true,
              estimatedMinutes: 15,
              content: `### Spring Boot Starter Projects
Spring Boot Starters are dependency descriptors that simplify build configurations. Instead of importing 15 different libraries for web APIs or database drivers, importing \`spring-boot-starter-web\` imports Tomcat, Spring MVC, Jackson, and core logging automatically.

### Build Automation: Maven vs Gradle
Java projects use build managers to handle compilation, test execution, dependency resolution, and packaging (.JAR / .WAR):
- **Maven**: Uses an XML configuration file (\`pom.xml\`) and standardized directory structures.
- **Gradle**: Uses a Groovy/Kotlin domain-specific language (\`build.gradle\`), is task-based, and supports highly performant incremental builds.

### Dependency Injection (DI) & IoC
- **Inversion of Control (IoC)**: The framework manages object instances and control flows instead of the application program doing it.
- **Dependency Injection (DI)**: A design pattern where Spring automatically supplies dependent objects to a class.
- **Beans**: Objects instantiated and managed by the Spring IoC Container.
  - Declared using \`@Component\`, \`@Service\`, \`@Repository\`, or \`@Bean\`.
  - Injected using Constructor Injection (highly recommended for thread-safety and easy testing), Setter Injection, or Field Injection (\`@Autowired\`).`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'Constructor injection (best practice) in a Spring Service',
                  code: `@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    // Spring automatically supplies the dependency bean at runtime
    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Spring Dependency Injection', url: 'https://www.geeksforgeeks.org/spring-dependency-injection-di/', source: 'other' }
              ]
            },
            {
              title: 'REST APIs & Running Spring Boot Applications',
              isFreePreview: false,
              estimatedMinutes: 15,
              content: `### Building REST APIs
Spring Boot makes it simple to map HTTP web routes using annotations:
- \`@RestController\`: Combination of \`@Controller\` and \`@ResponseBody\`. Specifies that return values are serialized directly into HTTP response bodies (JSON).
- \`@RequestMapping\`, \`@GetMapping\`, \`@PostMapping\`, etc.: Map URLs to controller handler methods.
- \`@RequestBody\`: Deserializes incoming HTTP request JSON payloads into Java objects.
- \`@PathVariable\` / \`@RequestParam\`: Extract segments of URL paths or query parameters.

### How to Import and Run Spring Boot apps
1. **Importing**:
   - Open your IDE (IntelliJ IDEA, Eclipse, or VS Code).
   - Choose "Import Project" or "Open Folder", select the directory containing \`pom.xml\` or \`build.gradle\`, and let the IDE resolve dependencies.
2. **Running**:
   - Run via IDE: Click the play button next to the class annotated with \`@SpringBootApplication\` (containing the \`main\` entry point).
   - Run via CLI (Maven): Execute \`./mvnw spring-boot:run\` or compile into an executable jar via \`./mvnw clean package\` and run it using \`java -jar target/app.jar\`.
   - Run via CLI (Gradle): Execute \`./gradlew bootRun\`.`,
              codeSnippets: [
                {
                  language: 'java',
                  caption: 'A simple REST controller in Spring Boot',
                  code: `@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = new Product(id, "Java Book", 29.99);
        return ResponseEntity.ok(product); // returns JSON
    }
}`
                }
              ],
              externalLinks: [
                { label: 'Build REST API with Spring Boot', url: 'https://www.geeksforgeeks.org/spring-boot-rest-controller/', source: 'other' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = java;
