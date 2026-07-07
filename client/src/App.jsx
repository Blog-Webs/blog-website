import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './modules/core/layout/Layout';
import BackToTop from './modules/core/components/ui/BackToTop';
const ReadingLayout = lazy(() => import('./modules/core/layout/ReadingLayout'));

// Every page is lazy-loaded so a visitor reading the blog or browsing
// chapters never downloads the rich-text editor bundle (BlockNote +
// Mantine) that only the admin pages actually need, and vice versa.
const Home = lazy(() => import('./modules/core/pages/Home'));
const LearnHome = lazy(() => import('./modules/learn/pages/LearnHome'));
const DocsPage = lazy(() => import('./modules/docs/pages/DocsPage'));
const TopicPage = lazy(() => import('./modules/learn/pages/TopicPage'));
const BlogList = lazy(() => import('./modules/blog/pages/BlogList'));
const BlogDetail = lazy(() => import('./modules/blog/pages/BlogDetail'));
const SeriesDetail = lazy(() => import('./modules/blog/pages/SeriesDetail'));
const TodoPage = lazy(() => import('./modules/workspace/pages/TodoPage'));
const NotFound = lazy(() => import('./modules/core/pages/NotFound'));

// Forum
const ForumHome = lazy(() => import('./modules/forum/pages/ForumHome'));
const CreateTopicPage = lazy(() => import('./modules/forum/pages/CreateTopicPage'));
const CategoryPage = lazy(() => import('./modules/forum/pages/CategoryPage'));
const TopicDetail = lazy(() => import('./modules/forum/pages/TopicDetail'));
const AdminGuard = lazy(() => import('./modules/admin/components/AdminGuard'));
const AdminLayout = lazy(() => import('./modules/admin/components/AdminLayout'));
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'));
const AdminBlogStudio = lazy(() => import('./modules/blog/pages/AdminBlogStudio'));
const AdminSeriesList = lazy(() => import('./modules/admin/pages/AdminSeriesList'));
const AdminContentStudio = lazy(() => import('./modules/admin/pages/AdminContentStudio'));
const MigrationTool = lazy(() => import('./modules/admin/pages/MigrationTool'));
const Subscribers = lazy(() => import('./modules/admin/pages/Subscribers'));
const ContactSubmissions = lazy(() => import('./modules/admin/pages/ContactSubmissions'));
// StudentOS — completely isolated module
const StudentOSRoutes = lazy(() => import('./modules/StudentOS/routes/StudentOSRoutes'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
    Loading…
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public site — with global header + footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<LearnHome />} />
          <Route path="/docs/:slug?" element={<DocsPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/series/:slug" element={<SeriesDetail />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/forum" element={<ForumHome />} />
          <Route path="/forum/create" element={<CreateTopicPage />} />
          <Route path="/forum/:categorySlug" element={<CategoryPage />} />
          <Route path="/forum/topic/:topicSlug" element={<TopicDetail />} />
        </Route>

        {/* Topic reading — no header/footer (immersive reading layout) */}
        <Route element={<ReadingLayout />}>
          <Route path="/learn/:subjectSlug" element={<TopicPage />} />
        </Route>

        {/* Blog reading — no header/footer, only center pane scrolls */}
        <Route element={<ReadingLayout />}>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Route>

        {/* Hidden admin portal - guarded server-side, 404s for non-admins */}
        <Route path="/admin-portal" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogStudio />} />
            <Route path="blogs/:id" element={<AdminBlogStudio />} />
            <Route path="series" element={<AdminSeriesList />} />
            <Route path="content" element={<AdminContentStudio />} />
            <Route path="content/chapters/:id" element={<AdminContentStudio />} />
            <Route path="migration" element={<MigrationTool />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="contact" element={<ContactSubmissions />} />
          </Route>
        </Route>

        {/* StudentOS — AI Academic Hub, completely isolated from the main site */}
        <Route path="/student-os/*" element={<StudentOSRoutes />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <BackToTop />
    </Suspense>
  );
}

export default App;
