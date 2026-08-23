import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Wrapper for StudentOS in Vite React Router
export default function StudentOSRoutes() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: '#e5e7eb', background: '#09090b', minHeight: '80vh' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800 }}>StudentOS — Academic Command Center</h2>
      <p style={{ color: '#9ca3af', marginTop: 8 }}>
        StudentOS is running on Next.js App Router at <strong>/student-os</strong>.
      </p>
      <div style={{ marginTop: 24 }}>
        <a
          href="/student-os"
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Launch StudentOS Suite
        </a>
      </div>
    </div>
  );
}
