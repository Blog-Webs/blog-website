'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentTask, CalendarEvent } from '@/types/studentos';
import api from '@/lib/api';

interface StudentOSContextType {
  tasks: StudentTask[];
  loadingTasks: boolean;
  addTask: (task: Omit<StudentTask, 'id'>) => Promise<void>;
  updateTaskStatus: (id: string, status: StudentTask['status']) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  focusMinutesToday: number;
  addFocusMinutes: (minutes: number) => void;
  isGoogleConnected: boolean;
  googleEmail: string | null;
  userName: string;
  userAvatar: string;
  streakDays: number;
  connectGoogleWorkspace: () => Promise<void>;
  disconnectGoogleWorkspace: () => Promise<void>;
}

const StudentOSContext = createContext<StudentOSContextType>({
  tasks: [],
  loadingTasks: false,
  addTask: async () => {},
  updateTaskStatus: async () => {},
  deleteTask: async () => {},
  events: [],
  addEvent: async () => {},
  focusMinutesToday: 0,
  addFocusMinutes: () => {},
  isGoogleConnected: false,
  googleEmail: null,
  userName: 'StudentOS User',
  userAvatar: '',
  streakDays: 1,
  connectGoogleWorkspace: async () => {},
  disconnectGoogleWorkspace: async () => {},
});

export const StudentOSProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<StudentTask[]>([
    {
      id: 't-1',
      title: 'Complete Distributed Systems Paxos Lab',
      description: 'Implement leader election & consensus state machine in Node.js',
      status: 'in_progress',
      priority: 'high',
      dueDate: 'Tomorrow',
      category: 'Academic',
    },
    {
      id: 't-2',
      title: 'Machine Learning Model Benchmarking',
      description: 'Train PyTorch Transformer & evaluate attention weights',
      status: 'todo',
      priority: 'high',
      dueDate: 'Aug 26',
      category: 'Project',
    },
    {
      id: 't-3',
      title: 'Refactor StudentOS with Apple Clean UI',
      description: 'Convert React frontend to Next.js App Router with shadcn/ui components',
      status: 'completed',
      priority: 'medium',
      dueDate: 'Today',
      category: 'Engineering',
    },
    {
      id: 't-4',
      title: 'Solve LeetCode Hard Dynamic Programming',
      description: 'Interval DP & Bitmask state compression exercises',
      status: 'todo',
      priority: 'medium',
      dueDate: 'Aug 28',
      category: 'Coding',
    },
  ]);

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'e-1', title: 'Distributed Systems Lecture', start: '10:00 AM', color: '#3b82f6', type: 'general' },
    { id: 'e-2', title: 'System Design Mock Interview', start: '02:00 PM', color: '#10b981', type: 'coding' },
    { id: 'e-3', title: 'Deep Learning Midterm Review', start: '05:30 PM', color: '#8b5cf6', type: 'exam' },
  ]);
  const [focusMinutesToday, setFocusMinutesToday] = useState(90);

  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('StudentOS User');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [streakDays, setStreakDays] = useState<number>(1);

  // Daily streak tracker
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem('studentos_streak_tracker');
      if (saved) {
        const parsed = JSON.parse(saved);
        const lastDate = parsed.lastDate;
        const currentStreak = parsed.streak || 1;

        if (lastDate === todayStr) {
          setStreakDays(currentStreak);
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yesterdayStr) {
            const nextStreak = currentStreak + 1;
            setStreakDays(nextStreak);
            localStorage.setItem('studentos_streak_tracker', JSON.stringify({ lastDate: todayStr, streak: nextStreak }));
          } else {
            // Missed a day or first time
            setStreakDays(1);
            localStorage.setItem('studentos_streak_tracker', JSON.stringify({ lastDate: todayStr, streak: 1 }));
          }
        }
      } else {
        setStreakDays(1);
        localStorage.setItem('studentos_streak_tracker', JSON.stringify({ lastDate: todayStr, streak: 1 }));
      }
    } catch {
      setStreakDays(1);
    }
  }, []);

  // Fetch initial tasks and auth status from backend if authenticated
  useEffect(() => {
    setLoadingTasks(true);
    
    // Check Google Workspace Auth status
    api.get('/studentos/auth/status')
      .then((res) => {
        if (res.data) {
          setIsGoogleConnected(!!res.data.connected);
          setGoogleEmail(res.data.googleEmail || null);
          if (res.data.userName) setUserName(res.data.userName);
          if (res.data.userAvatar) setUserAvatar(res.data.userAvatar);
        }
      })
      .catch(() => {});

    // Also fallback/sync from /auth/me
    api.get('/auth/me')
      .then((res) => {
        if (res.data?.user) {
          if (res.data.user.name) setUserName(res.data.user.name);
          if (res.data.user.avatar) setUserAvatar(res.data.user.avatar);
          if (res.data.user.email && !googleEmail) setGoogleEmail(res.data.user.email);
        }
      })
      .catch(() => {});

    // Fetch tasks
    api.get('/student-os/tasks')
      .then((res) => {
        if (res.data?.tasks && Array.isArray(res.data.tasks)) {
          setTasks(res.data.tasks);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTasks(false));

    // Fetch events
    api.get('/studentos/calendar/events')
      .then((res) => {
        if (res.data?.events && Array.isArray(res.data.events)) {
          setEvents(res.data.events);
        }
      })
      .catch(() => {});
  }, []);

  const connectGoogleWorkspace = async () => {
    try {
      const res = await api.get('/studentos/auth/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert('Unable to initiate Google Workspace connection. Please log in first.');
    }
  };

  const disconnectGoogleWorkspace = async () => {
    try {
      await api.delete('/studentos/auth/disconnect');
      setIsGoogleConnected(false);
      setGoogleEmail(null);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (taskData: Omit<StudentTask, 'id'>) => {
    const tempId = `t-${Date.now()}`;
    const newTask: StudentTask = { ...taskData, id: tempId };
    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await api.post('/student-os/tasks', taskData);
      if (res.data?.task?.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: res.data.task.id } : t))
        );
      }
    } catch (err) {
      // Retain optimistic UI state
    }
  };

  const updateTaskStatus = async (id: string, status: StudentTask['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await api.patch(`/student-os/tasks/${id}`, { status });
    } catch (err) {
      // State updated optimistically
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/student-os/tasks/${id}`);
    } catch (err) {
      // Optimistic delete
    }
  };

  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = { ...eventData, id: `e-${Date.now()}` };
    setEvents((prev) => [...prev, newEvt]);
  };

  const addFocusMinutes = (minutes: number) => {
    setFocusMinutesToday((prev) => prev + minutes);
  };

  return (
    <StudentOSContext.Provider
      value={{
        tasks,
        loadingTasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        events,
        addEvent,
        focusMinutesToday,
        addFocusMinutes,
        isGoogleConnected,
        googleEmail,
        userName,
        userAvatar,
        streakDays,
        connectGoogleWorkspace,
        disconnectGoogleWorkspace,
      }}
    >
      {children}
    </StudentOSContext.Provider>
  );
};

export const useStudentOS = () => useContext(StudentOSContext);

