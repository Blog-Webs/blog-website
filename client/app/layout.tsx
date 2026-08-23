import type { Metadata } from 'next';
import './globals.css';
import { StudentOSProvider } from '@/context/StudentOSContext';
import { RoadmapProvider } from '@/context/RoadmapContext';

export const metadata: Metadata = {
  title: 'StudentOS — Apple-like Academic Command Center',
  description: 'AI-Powered Academic & Engineering Operating System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-blue-500/30">
        <StudentOSProvider>
          <RoadmapProvider>
            {children}
          </RoadmapProvider>
        </StudentOSProvider>
      </body>
    </html>
  );
}
