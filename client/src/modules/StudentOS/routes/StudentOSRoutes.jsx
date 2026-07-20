import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { StudentOSProvider } from '../context/StudentOSContext';

const StudentOSLayout = lazy(() => import('../layouts/StudentOSLayout'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ClassroomPage = lazy(() => import('../pages/ClassroomPage'));
const DrivePage = lazy(() => import('../pages/DrivePage'));
const GmailPage = lazy(() => import('../pages/GmailPage'));
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const AiAssistantPage = lazy(() => import('../pages/AiAssistantPage'));
const FocusModePage = lazy(() => import('../pages/FocusModePage'));
const CodingPage = lazy(() => import('../pages/CodingPage'));

// AI Roadmap & Career pages
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const RoadmapPage = lazy(() => import('../pages/RoadmapPage'));
const AssessmentPage = lazy(() => import('../pages/AssessmentPage'));
const DailyPlannerPage = lazy(() => import('../pages/DailyPlannerPage'));
const CareerDashboard = lazy(() => import('../pages/CareerDashboard'));
const WeakAreasPage = lazy(() => import('../pages/WeakAreasPage'));

const Fallback = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]"
    style={{ color: 'var(--text-muted)' }}>
    Loading…
  </div>
);

/**
 * All StudentOS routes live under /student-os/*.
 * Wrapped in its own StudentOSProvider so its state never touches the main app.
 */
const StudentOSRoutes = () => (
  <StudentOSProvider>
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<StudentOSLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="drive" element={<DrivePage />} />
          <Route path="gmail" element={<GmailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="ai" element={<AiAssistantPage />} />
          <Route path="focus" element={<FocusModePage />} />
          <Route path="coding" element={<CodingPage />} />

          {/* AI Roadmap Routes */}
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="planner" element={<DailyPlannerPage />} />
          <Route path="career" element={<CareerDashboard />} />
          <Route path="weak-areas" element={<WeakAreasPage />} />
        </Route>
      </Routes>
    </Suspense>
  </StudentOSProvider>
);

export default StudentOSRoutes;
