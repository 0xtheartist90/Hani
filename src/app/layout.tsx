import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Archivo, Instrument_Serif } from 'next/font/google';

import '@/app/globals.css';

const archivo = Archivo({
    subsets: ['latin'],
    variable: '--font-geist-sans',
    display: 'swap'
});

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: '400',
    style: ['normal', 'italic'],
    variable: '--font-instrument-serif',
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
        type: 'website'
    }
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <html suppressHydrationWarning lang='en' className='overflow-x-clip'>
            <body className={`${archivo.variable} ${instrumentSerif.variable} overflow-x-hidden font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
};

export default Layout;
