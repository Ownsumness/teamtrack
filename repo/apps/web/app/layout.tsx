import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'TeamTrack',
  description: 'Modern project and team management platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
