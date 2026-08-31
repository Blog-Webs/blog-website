import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HouseWorkAIPage from '../pages/HouseWorkAIPage';

function Loader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#060912' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{
                animationName: 'hwThinkBounce',
                animationDuration: '1s',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
        <p className="text-[11px] font-mono text-white/30 tracking-widest uppercase">
          Initializing HouseWork AI…
        </p>
      </div>
    </div>
  );
}

export default function HouseWorkAIRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route index element={<HouseWorkAIPage />} />
        <Route path="*" element={<HouseWorkAIPage />} />
      </Routes>
    </Suspense>
  );
}
