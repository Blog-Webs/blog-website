import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { studentOSApi } from '../api';
import { useAuth } from '../../../context/AuthContext';

const StudentOSContext = createContext(null);

export const StudentOSProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [connectedAt, setConnectedAt] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!user) { setStatusLoading(false); return; }
    try {
      const { data } = await studentOSApi.getStatus();
      setConnected(data.connected);
      setGoogleEmail(data.googleEmail);
      setConnectedAt(data.connectedAt);
    } catch {
      setConnected(false);
    } finally {
      setStatusLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshStatus(); }, [refreshStatus]);

  const connect = async () => {
    const { data } = await studentOSApi.getAuthUrl();
    window.location.href = data.url;
  };

  const disconnect = async () => {
    await studentOSApi.disconnect();
    setConnected(false);
    setGoogleEmail(null);
  };

  return (
    <StudentOSContext.Provider value={{
      connected, googleEmail, connectedAt, statusLoading,
      connect, disconnect, refreshStatus,
    }}>
      {children}
    </StudentOSContext.Provider>
  );
};

export const useStudentOS = () => {
  const ctx = useContext(StudentOSContext);
  if (!ctx) throw new Error('useStudentOS must be used within StudentOSProvider');
  return ctx;
};
