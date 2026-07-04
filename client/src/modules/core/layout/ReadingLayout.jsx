import { Outlet } from 'react-router-dom';

/**
 * ReadingLayout — stripped-down layout with NO global header or footer.
 * Used for immersive reading pages: BlogDetail and TopicPage.
 * Each of those pages renders its own minimal chrome (back button, progress bar).
 */
const ReadingLayout = () => (
  <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
    <Outlet />
  </div>
);

export default ReadingLayout;
