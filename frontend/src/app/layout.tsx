import './globals.css';
import type { Metadata } from 'next';
import ContactSupportWidget from '@/components/ContactSupportWidget';

export const metadata: Metadata = {
  title: 'Coworking Space Booking System',
  description: 'Smart Workspace Booking System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className="antialiased selection:bg-emerald-500 selection:text-forest-950">
        {children}
        <ContactSupportWidget />
      </body>
    </html>
  );
}
