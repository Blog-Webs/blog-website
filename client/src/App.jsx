import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
const ReadingLayout = lazy(() => import('./components/layout/ReadingLayout'));

// Every page is lazy-loaded so a visitor reading the blog or browsing
// chapters never downloads the rich-text editor bundle (BlockNote +
// Mantine) that only the admin pages actually need, and vice versa.
const Home = lazy(() => import('./pages/Home'));
const SubjectPage = lazy(() => import('./pages/SubjectPage'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const TodoPage = lazy(() => import('./pages/TodoPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBlogList = lazy(() => import('./pages/admin/AdminBlogList'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const AdminSeriesList = lazy(() => import('./pages/admin/AdminSeriesList'));
const ContentTreeManager = lazy(() => import('./pages/admin/ContentTreeManager'));
const ChapterEditor = lazy(() => import('./pages/admin/ChapterEditor'));
const MigrationTool = lazy(() => import('./pages/admin/MigrationTool'));
const Subscribers = lazy(() => import('./pages/admin/Subscribers'));
const ContactSubmissions = lazy(() => import('./pages/admin/ContactSubmissions'));

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
          <Route path="/learn/:subjectSlug" element={<SubjectPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/series/:slug" element={<SeriesDetail />} />
          <Route path="/todos" element={<TodoPage />} />
        </Route>

        {/* Topic reading — no header/footer (immersive reading layout) */}
        <Route element={<ReadingLayout />}>
          <Route path="/learn/:subjectSlug/:topicSlug" element={<TopicPage />} />
        </Route>

        {/* Blog reading — no header/footer, only center pane scrolls */}
        <Route element={<ReadingLayout />}>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Route>

        {/* Hidden admin portal - guarded server-side, 404s for non-admins */}
        <Route path="/admin-portal" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogList />} />
            <Route path="blogs/:id" element={<BlogEditor />} />
            <Route path="series" element={<AdminSeriesList />} />
            <Route path="content" element={<ContentTreeManager />} />
            <Route path="content/chapters/:id" element={<ChapterEditor />} />
            <Route path="migration" element={<MigrationTool />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="contact" element={<ContactSubmissions />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
