import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import NotFound from '../../pages/NotFound';

// Renders the admin shell ONLY if the backend confirms admin status.
// Falls back to a generic NotFound for everyone else, so /admin-portal
// never visibly differs from a route that simply doesn't exist.
const AdminGuard = () => {
  const { loading: authLoading } = useAuth();
  const [status, setStatus] = useState('checking'); // checking | allowed | denied

  useEffect(() => {
    if (authLoading) return;
    adminApi
      .checkAdmin()
      .then(() => setStatus('allowed'))
      .catch(() => setStatus('denied'));
  }, [authLoading]);

  if (status === 'checking') return null;
  if (status === 'denied') return <NotFound />;

  return <Outlet />;
};

export default AdminGuard;
