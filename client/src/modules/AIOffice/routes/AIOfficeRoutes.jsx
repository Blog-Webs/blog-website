import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AIOfficeMainPage from '../pages/AIOfficeMainPage';

export default function AIOfficeRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AIOfficeMainPage />} />
      <Route path="*" element={<AIOfficeMainPage />} />
    </Routes>
  );
}
