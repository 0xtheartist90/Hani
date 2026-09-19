import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Archivo, Fraunces } from 'next/font/google';

import '@/app/globals.css';

const archivo = Archivo({
    subsets: ['latin'],
    variable: '--font-geist-sans',
    display: 'swap'
});

const fraunces = Fraunces({
    subsets: ['latin'],
    weight: ['400', '500'],
    style: ['normal', 'italic'],
    variable: '--font-display',
    display: 'swap'
});

export const metadata: Metadata = {
    title: 'Hani Roustom ─ Hospitality Executive',
    description:
        'Hospitality executive crafting destinations, luxury experiences, and thriving communities. CEO of Friday Harbour Resort.',
    openGraph: {
        title: 'Hani Roustom ─ Hospitality Executive',
        description:
            'Hospitality executive crafting destinations, luxury experiences, and thriving communities. CEO of Friday Harbour Resort.',
        type: 'website',
        images: ['/images/friday-harbour-night.jpg']
    }
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <html suppressHydrationWarning lang='en' className='overflow-x-clip'>
            <body className={`${archivo.variable} ${fraunces.variable} overflow-x-hidden font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
};

export default Layout;
