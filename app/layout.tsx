import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'StyleDNA — Your wardrobe, considered.', description: 'A considered wardrobe. A style that is entirely yours. Your private digital closet and outfit planner.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
