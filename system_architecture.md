# System Architecture: HttpTechNex

Here is a high-level overview of the HttpTechNex platform's architecture. The application follows the modern decoupled client-server model, utilizing a React frontend and a Node.js/Express backend.

---

## 1. High-Level System Architecture

This diagram illustrates how the external client interacts with the backend services, the internal event bus, and external dependencies.

```mermaid
graph TD
    Client[Web Browser Client] -->|HTTPS REST API| APIGateway(Express Router / App.js)
    Client -->|WebSockets| SocketServer(Socket.io Server)
    
    subgraph "Backend Services (Node.js)"
        APIGateway --> AuthModule[Auth Controller]
        APIGateway --> CoreModules[Domain Controllers: Forum, Blog, Learn]
        APIGateway --> OSModules[StudentOS Controllers]
        
        AuthModule -->|Emits| EventBus((EventBus))
        CoreModules -->|Emits| EventBus
        
        EventBus -->|Listens| NotificationService[Admin Notification Listener]
        EventBus -->|Listens| EmailService[Email Listener]
    end
    
    subgraph "Data & External Layer"
        CoreModules -->|Read/Write| MongoDB[(MongoDB Atlas)]
        OSModules -->|Read/Write| MongoDB
        NotificationService -->|Write| MongoDB
        
        CoreModules -->|Cache| Redis[(Redis)]
        OSModules -->|Cache| Redis
        
        AuthModule -->|Verify Token| GoogleOAuth[Google Identity]
        EmailService -->|SMTP| EmailProvider[Nodemailer/SMTP]
        CoreModules -->|Uploads| Cloudinary[Cloudinary CDN]
    end
```

---

## 2. Frontend Architecture (React / Vite)

The frontend uses a highly modular structure. Instead of organizing purely by file type (e.g., all pages together, all components together), it is organized by **Domain Modules**, making it extremely scalable.

```mermaid
graph TD
    Vite[Vite Bundler] --> AppRoot(App.jsx)
    AppRoot --> Router(React Router v6)
    AppRoot --> GlobalState
    
    subgraph "Global State & Context"
        GlobalState --> AuthContext[Auth Provider]
        GlobalState --> ThemeContext[Theme Provider]
        GlobalState --> OSContext[StudentOS Context]
    end
    
    subgraph "Domain Modules"
        Router --> CoreModule[Core Module]
        Router --> AdminModule[Admin Module]
        Router --> BlogModule[Blog Module]
        Router --> ForumModule[Forum Module]
        Router --> LearnModule[Learn/Content Module]
        Router --> StudentOS[StudentOS Module]
    end
    
    subgraph "API Client Layer"
        CoreModule --> Axios[Axios Client]
        AdminModule --> Axios
        BlogModule --> Axios
        ForumModule --> Axios
        LearnModule --> Axios
        StudentOS --> Axios
    end
    
    Axios -->|HTTP Requests| BackendAPI[Backend Server]
```

---

## 3. Backend Architecture (Node.js / Express)

The backend is built with Express and follows a clear separation of concerns: Routing -> Controller -> Data/Services. It incorporates Event-Driven Architecture (EDA) to prevent slow synchronous bottlenecks.

```mermaid
graph LR
    IncomingReq((Incoming Request)) --> ExpressApp(app.js)
    
    subgraph "Middleware Layer"
        ExpressApp --> RateLimit[Rate Limiter]
        RateLimit --> Security[Helmet / CORS / Mongo Sanitize]
        Security --> AuthCheck[Auth Middleware]
    end
    
    subgraph "Routing Layer (src/modules/*/routes.js)"
        AuthCheck --> RouteAuth[Auth Routes]
        AuthCheck --> RouteBlog[Blog / Admin Routes]
        AuthCheck --> RouteForum[Forum Routes]
        AuthCheck --> RouteOS[StudentOS Routes]
    end
    
    subgraph "Controller & Service Layer"
        RouteAuth --> CtrlAuth(Auth Controller)
        RouteBlog --> CtrlBlog(Blog Controller)
        RouteForum --> CtrlForum(Forum Controller)
        
        CtrlAuth --> EventBus{EventBus}
        CtrlBlog --> EventBus
        CtrlForum --> EventBus
        
        EventBus -.->|Async| Listener[Event Listeners index.js]
        Listener -.-> Mailer(utils/mailer.js)
    end
    
    subgraph "Data Access Layer (Mongoose Models)"
        CtrlAuth --> ModelUser[(User)]
        CtrlBlog --> ModelBlog[(Blog / Newsletter)]
        CtrlForum --> ModelForum[(Topic / Reply)]
        Listener --> ModelNotification[(AdminNotification)]
    end
```

> [!TIP]
> **Why Event-Driven?** Notice how the Controllers offload secondary work (like sending emails or creating admin logs) to the **EventBus**. This ensures the primary HTTP request finishes instantly, dramatically improving the perceived speed for the end user.
