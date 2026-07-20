import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { roadmapApi } from '../api/roadmapApi';
import { useAuth } from '../../core/context/AuthContext';

const RoadmapContext = createContext(null);

export const RoadmapProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile]             = useState(null);
  const [roadmap, setRoadmap]             = useState(null);
  const [roadmapStatus, setRoadmapStatus] = useState('none'); // 'none' | 'generating' | 'active'
  const [onboardingComplete, setOnboardingComplete] = useState(null); // null = loading
  const [loading, setLoading]             = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [statusRes, profileRes] = await Promise.allSettled([
        roadmapApi.getOnboardingStatus(),
        roadmapApi.getProfile(),
      ]);

      if (statusRes.status === 'fulfilled') {
        setOnboardingComplete(statusRes.value.data.onboardingComplete);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data.profile);
      }
    } catch {
      setOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshRoadmap = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await roadmapApi.getRoadmap();
      setRoadmap(data.roadmap);
      setRoadmapStatus(data.roadmap?.status || 'none');
    } catch {
      setRoadmap(null);
    }
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (onboardingComplete) refreshRoadmap();
  }, [onboardingComplete, refreshRoadmap]);

  // Poll for roadmap generation completion
  useEffect(() => {
    if (roadmapStatus !== 'generating') return;
    const interval = setInterval(async () => {
      try {
        const { data } = await roadmapApi.getRoadmapStatus();
        if (data.status === 'active') {
          setRoadmapStatus('active');
          await refreshRoadmap();
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [roadmapStatus, refreshRoadmap]);

  return (
    <RoadmapContext.Provider value={{
      profile, roadmap, roadmapStatus, onboardingComplete, loading,
      setProfile, setRoadmap, setRoadmapStatus, setOnboardingComplete,
      refreshProfile, refreshRoadmap,
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within RoadmapProvider');
  return ctx;
};
