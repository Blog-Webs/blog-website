import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

export const useLiveUserCount = () => {
  const [count, setCount] = useState(1);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('liveUserCount', (n) => setCount(n));

    return () => {
      socket.disconnect();
    };
  }, []);

  return count;
};
