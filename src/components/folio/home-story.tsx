'use client';

import { useEffect, useRef, useState } from 'react';

import { ABOUT, AWARDS, EXPERIENCES, FOOTER_NOTE, HERO_IMAGE, JOURNEY_ITEMS, PORTRAIT_IMAGE, ROLES, SERVICES, SITE } from '@/components/folio/data';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const CITIES = ['Beirut', 'Limassol', 'Ithaca', 'Washington', 'Toronto', 'Innisfil'];

const ArrowForward = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
        <path d='M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z' fill='currentColor' />
    </svg>
);

const HomeStory = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const yearRowRef = useRef<HTMLDivElement>(null);
    const yearStripRef = useRef<HTMLDivElement>(null);
    const expandRectRef = useRef<HTMLDivElement>(null);
    const expandCaptionRef = useRef<HTMLParagraphElement>(null);
    const navigateRef = useRef<(id: string) => void>(() => {});

    const [menuOpen, setMenuOpen] = useState(false);

    /* lenis + gsap orchestration */
    useEffect(() => {
        const root = rootRef.current;
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        const header = headerRef.current;
        if (!root || !wrapper || !track || !header) return;

        const lenis = new Lenis({ lerp: 0.12 });
        lenis.on('scroll', ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        const q = gsap.utils.selector(root);

        const applyTheme = (el: HTMLElement | undefined) => {
            if (!el) return;
            header.style.setProperty('--header-bg', el.dataset.hbg ?? '#10181d');
            header.style.setProperty('--header-text', el.dataset.htext ?? '#cfc9bb');
            header.style.setProperty('--header-border', el.dataset.hborder ?? '#41525c');
            const indicator = header.querySelector('[data-chapter-indicator]');
            if (indicator) indicator.textContent = el.dataset.chapter ?? '—';
        };

        const setProgress = (p: number) => {
            const bar = progressRef.current;
            if (!bar) return;
            bar.style.transform = window.innerWidth >= 768 ? `scaleY(${p})` : `scaleX(${p})`;
        };

        setProgress(0);

        /* intro: year counts up, slides away, then the name reveals */
        const counter = { i: 0 };
        const intro = gsap.timeline({ delay: 0.2 });
        intro
            .fromTo(yearRowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
            .to(
                counter,
                {
                    i: CITIES.length - 1,
                    duration: 2.2,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        const strip = yearStripRef.current;
                        if (strip) strip.style.transform = `translateY(${-Math.round(counter.i)}em)`;
                    }
                },
                0.3
            )
            .to(yearRowRef.current, { yPercent: -110, opacity: 0, duration: 0.9, ease: 'power4.inOut' }, 2.5)
            .to(header, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 2.7)
            .set(q('[data-name-heading]'), { opacity: 1 }, 2.88)
            .fromTo(
                q('[data-name-word]'),
                { yPercent: 115 },
                { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 },
                2.9
            )
            .fromTo(
                q('[data-hero-fade]'),
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
                3.3
            );

        /* section reveals: rise / wipe / word-mask, fired once per unit */
        const trackRect0 = track.getBoundingClientRect();
        const units = [
            ...gsap.utils.toArray<HTMLElement>('[data-panel]:not([data-panel-id="home"]):not([data-panel-id="services"])', track),
            ...gsap.utils.toArray<HTMLElement>('[data-panel-id="services"] [data-reveal-unit]', track)
        ];
        const reveals = units
            .map((unit) => {
                const rise = unit.querySelectorAll('[data-anim-rise]');
                const wipes = unit.querySelectorAll('[data-anim-wipe]');
                const words = unit.querySelectorAll('[data-anim-word]');
                const lines = unit.querySelectorAll('[data-anim-line]');
                if (!rise.length && !wipes.length && !words.length && !lines.length) return null;
                const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
                if (words.length) {
                    gsap.set(words, { yPercent: 115 });
                    tl.to(words, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 }, 0);
                }
                if (wipes.length) {
                    const imgs = Array.from(wipes)
                        .map((w) => w.querySelector('img'))
                        .filter(Boolean);
                    gsap.set(wipes, { clipPath: 'inset(0% 0% 100% 0%)' });
                    gsap.set(imgs, { scale: 1.12 });
                    tl.to(wipes, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.out' }, 0.1);
                    tl.to(imgs, { scale: 1, duration: 1.5 }, 0.1);
                }
                if (lines.length) {
                    gsap.set(lines, { scaleX: 0, scaleY: 0 });
                    tl.to(lines, { scaleX: 1, scaleY: 1, duration: 1.6, ease: 'power4.inOut' }, 0);
                }
                if (rise.length) {
                    gsap.set(rise, { y: 36, opacity: 0 });
                    tl.to(rise, { y: 0, opacity: 1, duration: 1.05, stagger: 0.12 }, 0.1);
                }
                const left = unit.getBoundingClientRect().left - trackRect0.left;

                return { tl, left, unit, played: false };
            })
            .filter(
                (r): r is { tl: gsap.core.Timeline; left: number; unit: HTMLElement; played: boolean } => r !== null
            );

        const fireReveals = (x: number) => {
            const edge = x + window.innerWidth * 0.6;
            for (const r of reveals) {
                if (!r.played && r.left <= edge) {
                    r.played = true;
                    r.tl.play();
                }
            }
        };

        const mm = gsap.matchMedia();
        let masterST: ScrollTrigger | undefined;
        let holdDur = 0;
        let journeyX = 0;
        let totalX = 0;

        mm.add('(min-width: 768px)', () => {
            const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', track);
            totalX = track.scrollWidth - window.innerWidth;
            const journeyPanel = panels.find((p) => p.dataset.panelId === 'journey');
            journeyX = journeyPanel ? journeyPanel.offsetLeft : 0;
            holdDur = window.innerHeight * 0.7;

            const rect = expandRectRef.current;
            if (rect) gsap.set(rect, { scale: 0 });
            const quoteWords = q('[data-expand-word]');
            gsap.set(quoteWords, { yPercent: 115 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top top',
                    end: `+=${totalX + holdDur}`,
                    scrub: true,
                    pin: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        setProgress(self.progress);
                        const x = -(gsap.getProperty(track, 'x') as number);
                        fireReveals(x);
                        const probe = x + window.innerWidth * 0.5;
                        let active = panels[0];
                        for (const p of panels) if (p.offsetLeft <= probe) active = p;
                        applyTheme(active);
                    }
                }
            });

            tl.to(track, { x: -journeyX, duration: journeyX });
            if (rect) tl.to(rect, { scale: 1, duration: holdDur * 0.55 }, '>');
            tl.to(expandCaptionRef.current, { opacity: 0, duration: holdDur * 0.18 }, '<');
            tl.to(quoteWords, { yPercent: 0, duration: holdDur * 0.32, stagger: holdDur * 0.028 }, '>');
            tl.to(track, { x: -totalX, duration: totalX - journeyX });

            masterST = tl.scrollTrigger ?? undefined;

            navigateRef.current = (id: string) => {
                const target = panels.find((p) => p.dataset.panelId === id);
                if (!target || !masterST) return;
                const offset = gsap.utils.clamp(0, totalX, target.offsetLeft);
                const time = offset <= journeyX ? offset : offset + holdDur;
                lenis.scrollTo(masterST.start + time, { duration: 1.6 });
            };

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
            };
        });

        mm.add('(max-width: 767px)', () => {
            const sections = gsap.utils.toArray<HTMLElement>('[data-panel]', track);
            const triggers: ScrollTrigger[] = [];

            sections.forEach((section) => {
                triggers.push(
                    ScrollTrigger.create({
                        trigger: section,
                        start: 'top 64px',
                        end: 'bottom 64px',
                        onEnter: () => applyTheme(section),
                        onEnterBack: () => applyTheme(section)
                    })
                );
            });

            triggers.push(
                ScrollTrigger.create({
                    trigger: document.body,
                    start: 0,
                    end: 'max',
                    onUpdate: (self) => {
                        setProgress(self.progress);
                    }
                })
            );

            reveals.forEach((r) => {
                triggers.push(
                    ScrollTrigger.create({
                        trigger: r.unit,
                        start: 'top 68%',
                        onEnter: () => {
                            if (!r.played) {
                                r.played = true;
                                r.tl.play();
                            }
                        }
                    })
                );
            });

            navigateRef.current = (id: string) => {
                const target = sections.find((p) => p.dataset.panelId === id);
                if (target) lenis.scrollTo(target, { duration: 1.4 });
            };

            return () => triggers.forEach((t) => t.kill());
        });

        applyTheme(document.querySelector<HTMLElement>('[data-panel-id="home"]') ?? undefined);
        ScrollTrigger.refresh();

        return () => {
            intro.kill();
            reveals.forEach((r) => r.tl.kill());
            mm.revert();
            gsap.ticker.remove(raf);
            lenis.destroy();
        };
    }, []);

    /* lock scroll while menu is open */
    useEffect(() => {
        document.documentElement.classList.toggle('lenis-stopped', menuOpen);
    }, [menuOpen]);

    const openNav = (id: string) => {
        setMenuOpen(false);
        setTimeout(() => navigateRef.current(id), 350);
    };

    const chapterHeading = 'font-display text-lg font-normal uppercase leading-none md:absolute md:left-32 md:top-[var(--vg)] md:text-2xl';

    return (
        <div ref={rootRef} className='grain bg-[#ece7dc] text-[#1e2a30]'>
            {/* ── Fixed header: top bar on mobile, left rail on desktop ── */}
            <header
                ref={headerRef}
                style={
                    {
                        '--header-bg': '#142028',
                        '--header-text': '#f2eee3',
                        '--header-border': '#41525c'
                    } as React.CSSProperties
                }
                className='fixed inset-x-0 top-0 z-[110] flex w-full flex-row items-center justify-between border-b border-[var(--header-border)] bg-[var(--header-bg)] px-5 py-4 text-[var(--header-text)] opacity-0 transition-[background-color,color,border-color] duration-500 ease-out md:inset-x-auto md:inset-y-0 md:right-0 md:bottom-0 md:w-16 md:flex-col md:justify-start md:border-b-0 md:border-l md:px-0 md:py-0'
                aria-label='Global site header'>
                {/* scroll progress line */}
                <div
                    ref={progressRef}
                    className='pointer-events-none absolute -bottom-px left-0 z-10 h-px w-full origin-left bg-[#b08d57] will-change-transform md:top-0 md:bottom-auto md:h-dvh md:w-[2px] md:origin-top'
                    aria-hidden='true'
                />
                <button
                    type='button'
                    onClick={() => navigateRef.current('home')}
                    className='block shrink-0 cursor-pointer font-display text-2xl uppercase leading-none text-[var(--header-text)] md:hidden'
                    aria-label='Back to home'>
                    HR
                </button>
                <button
                    type='button'
                    onClick={() => setMenuOpen(true)}
                    className='flex shrink-0 cursor-pointer items-center justify-center outline-none hover:opacity-80 md:h-16 md:w-full md:border-b md:border-[var(--header-border)]'
                    aria-expanded={menuOpen}
                    aria-controls='fullscreen-menu'
                    aria-label='Open menu'>
                    <svg className='size-8' viewBox='0 0 32 32' fill='none' aria-hidden='true'>
                        <rect y='8' width='32' height='2' fill='currentColor' />
                        <rect y='15' width='32' height='2' fill='currentColor' />
                        <rect y='22' width='32' height='2' fill='currentColor' />
                    </svg>
                </button>
                <div className='hidden h-14 w-full items-center justify-center border-b border-[var(--header-border)] font-display text-lg md:flex'>
                    <span data-chapter-indicator>—</span>
                </div>
                <div className='hidden flex-1 flex-col items-center justify-between py-8 md:flex'>
                    <p className='vt-rl vt-reading-up text-[calc(1.1*var(--scale))] uppercase tracking-wide'>
                        Creating Destinations
                    </p>
                    <button
                        type='button'
                        onClick={() => navigateRef.current('home')}
                        className='vt-rl vt-reading-up block cursor-pointer font-display text-[calc(1.6*var(--scale))] uppercase tracking-wide text-[var(--header-text)]'
                        aria-label='Back to home'>
                        Hani Roustom
                    </button>
                    <p className='vt-rl vt-reading-up text-[calc(1.1*var(--scale))] uppercase tracking-wide'>© 2026</p>
                </div>
            </header>

            {/* ── Fullscreen menu ── */}
            <div
                id='fullscreen-menu'
                className={`fixed inset-0 z-[120] flex flex-col bg-[#1e2a30] text-[#f6f3ec] transition-[opacity,visibility] duration-500 ease-out ${
                    menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
                aria-label='Site navigation'
                aria-hidden={!menuOpen}>
                <button
                    type='button'
                    onClick={() => setMenuOpen(false)}
                    className='absolute right-5 top-6 z-10 cursor-pointer font-display text-2xl font-normal uppercase leading-none hover:opacity-80 md:right-16 md:top-[var(--vg)] md:text-[3.6vh]'
                    aria-label='Close menu'>
                    Close
                </button>
                <div className='flex min-h-0 flex-1 flex-col justify-between px-5 pb-6 pt-24 md:px-32 md:pb-[var(--vg)] md:pt-[var(--vg)] md:justify-center md:gap-[3.6vh]'>
                    <nav className='flex flex-col gap-5 md:items-end md:gap-[2.2vh]' aria-label='Primary'>
                        {[
                            { n: '', label: 'Home', id: 'home' },
                            { n: '01.', label: 'The Person', id: 'about' },
                            { n: '02.', label: 'The Journey', id: 'work' },
                            { n: '03.', label: 'The Craft', id: 'services' },
                            { n: '04.', label: 'The Record', id: 'clients' },
                            { n: '05.', label: 'Contact', id: 'contact' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type='button'
                                onClick={() => openNav(item.id)}
                                className='group flex cursor-pointer items-center gap-5 text-left text-[calc(5.2*var(--scale))] text-[#f6f3ec] opacity-40 outline-none transition-opacity duration-300 hover:opacity-100 md:flex-row-reverse md:text-right md:text-[min(11vh,8vw)] xl:gap-6'>
                                <span className='w-6 shrink-0 font-display text-[0.3em] font-normal leading-[1.2] md:w-auto'>
                                    {item.n}
                                </span>
                                <span className='font-display font-normal uppercase leading-[0.9] md:tracking-[-0.04em]'>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>
                    <div className='flex flex-wrap gap-6 border-t border-[#41525c] pt-5 text-sm font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:right-16 md:border-0 md:pt-0'>
                        <a className='link-underline' href={SITE.linkedin} target='_blank' rel='noreferrer'>
                            LinkedIn
                        </a>
                        <a className='link-underline' href={`mailto:${SITE.email}`}>
                            Email
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Horizontal story ── */}
            <main>
                <div ref={wrapperRef} className='relative w-full md:h-dvh md:overflow-hidden' id='site-top'>
                    <div ref={trackRef} className='flex w-full flex-col md:h-dvh md:w-max md:flex-row md:flex-nowrap'>
                        {/* ─ Panel 1: Hero ─ */}
                        <section
                            data-panel
                            data-panel-id='home'
                            data-chapter='—'
                            data-hbg='#1b2a33'
                            data-htext='#f2eee3'
                            data-hborder='#41525c'
                            className='relative flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-[#142028] text-[#f2eee3]'
                            aria-label='Introduction'>
                            {/* year counter — overlays the name slot, then slides away */}
                            <div className='absolute inset-x-5 bottom-8 z-[2] overflow-hidden md:inset-x-auto md:bottom-auto md:left-32 md:top-[var(--vg)]'>
                                <div
                                    ref={yearRowRef}
                                    className='font-display tabular-nums opacity-0'
                                    aria-hidden='true'>
                                    <div className='flex h-[1em] w-max text-[calc(5.2*var(--scale))] leading-none md:text-[calc(10.5*var(--scale))]'>
                                        <span className='block h-[1em] overflow-hidden'>
                                            <div ref={yearStripRef} className='will-change-transform'>
                                                {CITIES.map((city) => (
                                                    <span key={city} className='flex h-[1em] items-center italic leading-none'>
                                                        {city}
                                                    </span>
                                                ))}
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* name — revealed after the year counter leaves */}
                            <div className='absolute inset-x-5 bottom-8 z-[1] md:inset-x-auto md:bottom-auto md:left-32 md:top-[var(--vg)]'>
                                <h1
                                    data-name-heading
                                    className='font-display text-[calc(6.6*var(--scale))] uppercase leading-[0.92] tracking-[-0.04em] opacity-0 md:text-[calc(16*var(--scale))]'>
                                    {SITE.name.map((word, wi) => (
                                        <span
                                            key={word}
                                            className={`-ml-[0.06em] -mt-[0.1em] -mr-[0.12em] block w-max overflow-hidden pt-[0.1em] pl-[0.06em] pr-[0.12em] ${wi === 1 ? 'italic' : ''}`}>
                                            <span data-name-word className='block whitespace-nowrap'>
                                                {word}
                                            </span>
                                        </span>
                                    ))}
                                </h1>
                                <p
                                    data-hero-fade
                                    className='mt-6 hidden w-max border-t border-[#41525c] pt-3 text-[calc(1.1*var(--scale))] uppercase tracking-[0.14em] opacity-0 md:block'>
                                    CEO — Friday Harbour Resort
                                </p>
                            </div>
                            <p
                                data-hero-fade
                                className='absolute inset-x-5 top-24 z-[1] font-normal leading-[1.3] text-[calc(1.8*var(--scale))] opacity-0 md:inset-x-auto md:right-24 md:top-[calc(5.8*var(--scale))] md:w-[calc(36*var(--scale))] md:text-right md:text-[length:var(--cta-fs)]'>
                                {SITE.tagline}
                            </p>
                            <p
                                data-hero-fade
                                className='absolute bottom-12 left-5 z-[1] hidden text-base font-normal leading-[1.5] opacity-0 md:bottom-[var(--vg)] md:left-32 md:block'>
                                <span className='block'>25+ years in luxury hospitality</span>
                                <span className='block text-[#f2eee3]/60'>70+ countries · 6 languages</span>
                            </p>
                            <p
                                data-hero-fade
                                className='absolute left-1/2 top-1/2 z-[1] hidden -translate-x-1/2 -translate-y-1/2 text-base font-normal leading-[1.4] opacity-0 md:bottom-[var(--vg)] md:left-[calc(50%_-_calc(10*var(--scale)))] md:top-auto md:block md:translate-x-0 md:translate-y-0'>
                                <span className='block'>Open to</span>
                                <span className='block'>new connections</span>
                            </p>
                            <p
                                data-hero-fade
                                className='absolute right-5 top-24 z-[1] hidden text-right text-[calc(1.8*var(--scale))] leading-[1.2] opacity-0 md:bottom-[calc(var(--vg)_+_calc(6*var(--scale)))] md:right-24 md:top-auto md:block md:whitespace-nowrap md:text-[length:var(--cta-fs)]'>
                                {SITE.journeyLine}
                            </p>
                            <p
                                data-hero-fade
                                className='absolute bottom-12 right-5 z-[1] hidden text-right font-display text-xl font-normal uppercase leading-none opacity-0 md:bottom-[var(--vg)] md:right-24 md:block md:text-[length:var(--display-fs)]'>
                                ( Scroll )
                            </p>
                        </section>

                        {/* ─ Panel 2: About ─ */}
                        <section
                            data-panel
                            data-panel-id='about'
                            data-chapter='01'
                            data-hbg='#f6f3ec'
                            data-htext='#1e2a30'
                            data-hborder='#c9c1b0'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#f6f3ec] text-[#1e2a30] md:h-dvh'
                            style={
                                {
                                    '--portrait-h': 'calc(43 * var(--scale))',
                                    '--portrait-w': 'calc(34 * var(--scale))',
                                    '--portrait-top': 'calc(100dvh - var(--portrait-h) - var(--vg))'
                                } as React.CSSProperties
                            }
                            aria-label='About'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-12 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p data-anim-rise className={chapterHeading}>№ 01 — The Person</p>
                                <div className='flex w-full flex-col gap-5 md:absolute md:right-24 md:top-[var(--vg)] md:z-10 md:w-[calc(58*var(--scale))]'>
                                    <p data-anim-rise className='text-[calc(1.1*var(--scale))] uppercase leading-[1.2]'>
                                        {ABOUT.label}
                                    </p>
                                    <p data-anim-rise className='text-2xl font-medium leading-[1.3] md:text-[length:var(--display-fs)]'>
                                        {ABOUT.intro}
                                    </p>
                                </div>
                                <a
                                    data-anim-rise
                                    className='link-underline inline-flex w-fit items-center gap-2 text-lg font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:right-24 md:z-10 md:text-[length:var(--cta-fs)]'
                                    href={SITE.linkedin}
                                    target='_blank'
                                    rel='noreferrer'>
                                    {ABOUT.cta}
                                    <ArrowForward className='size-5 shrink-0 md:size-6' />
                                </a>
                                <div className='flex w-full flex-col items-center gap-6 md:contents'>
                                    {/* portrait placeholder */}
                                    <div className='relative w-full md:absolute md:bottom-[var(--vg)] md:left-32 md:z-0 md:h-[var(--portrait-h)] md:w-[var(--portrait-w)]'>
                                    <span
                                        className='pointer-events-none absolute -right-3 -top-3 hidden size-full border border-[#c9c1b0] md:block'
                                        aria-hidden='true'
                                    />
                                    <div data-anim-wipe className='relative aspect-[3/4] w-full overflow-hidden bg-[#ddd6c7] md:aspect-auto md:size-full'>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={PORTRAIT_IMAGE}
                                            alt='Portrait of Hani Roustom'
                                            className='size-full object-cover object-top'
                                            loading='lazy'
                                        />
                                    </div>
                                    </div>
                                    <blockquote data-anim-rise className='w-full border-0 p-0 text-[calc(1.1*var(--scale))] font-normal uppercase not-italic leading-[1.4] md:absolute md:left-[calc(8rem_+_var(--portrait-w)_+_calc(4*var(--scale)))] md:top-[var(--portrait-top)] md:z-10 md:w-[calc(16*var(--scale))]'>
                                        {ABOUT.quote.map((line) => (
                                            <span key={line} className='block'>
                                                {line}
                                            </span>
                                        ))}
                                    </blockquote>
                                </div>
                                <p
                                    data-anim-rise
                                    className='hidden text-base font-normal leading-[1.5] md:absolute md:bottom-[calc(var(--vg)_+_calc(8*var(--scale)))] md:right-24 md:block md:max-w-[calc(32*var(--scale))] md:text-right'>
                                    <span className='block tracking-[0.06em]'>{ABOUT.beyond}</span>
                                    <span className='block text-[#1e2a30]/60'>{ABOUT.beyondSub}</span>
                                </p>
                            </div>
                        </section>

                        {/* ─ Panel 3: "An act of love" cinematic quote ─ */}
                        <section
                            data-panel
                            data-panel-id='journey'
                            data-chapter='02'
                            data-hbg='#f6f3ec'
                            data-htext='#1e2a30'
                            data-hborder='#c9c1b0'
                            className='relative flex w-screen shrink-0 flex-col items-center justify-center gap-8 overflow-hidden bg-[#f6f3ec] px-5 py-14 text-[#1e2a30] md:h-dvh md:px-0 md:py-0'
                            aria-label='Hospitality is an act of love'>
                            <div
                                className='pointer-events-none absolute inset-0 z-10 hidden items-center justify-center md:flex'
                                aria-hidden='true'>
                                <div
                                    ref={expandRectRef}
                                    className='h-dvh w-screen overflow-hidden bg-[#10181d] will-change-transform'
                                    style={{ transformOrigin: '50% 50%' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={HERO_IMAGE}
                                        alt=''
                                        className='size-full object-cover object-center opacity-80'
                                        loading='eager'
                                    />
                                    <div className='absolute inset-0 bg-[#10181d]/35' aria-hidden='true' />
                                </div>
                            </div>
                            <p
                                ref={expandCaptionRef}
                                className='relative z-20 text-center text-[calc(1.1*var(--scale))] uppercase tracking-[0.2em] text-[#1e2a30]/70 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2'>
                                Friday Harbour — Lake Simcoe
                            </p>
                            <div className='relative z-20 w-full overflow-hidden md:hidden' style={{ aspectRatio: '16 / 10' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={HERO_IMAGE}
                                    alt=''
                                    className='size-full object-cover object-center'
                                    loading='eager'
                                />
                            </div>
                            <blockquote className='relative z-20 m-0 border-0 p-0 text-center not-italic md:absolute md:left-1/2 md:top-1/2 md:w-max md:-translate-x-1/2 md:-translate-y-1/2'>
                                <p className='font-display text-[calc(4.6*var(--scale))] leading-[1.05] tracking-[-0.02em] md:text-[calc(6.4*var(--scale))] md:text-[#f6f3ec]'>
                                    {['Hospitality', 'is', 'an'].map((w) => (
                                        <span key={w} className='mr-[0.28em] inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom'>
                                            <span data-expand-word className='inline-block'>
                                                {w}
                                            </span>
                                        </span>
                                    ))}
                                    <span className='mr-[0.28em] inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom'>
                                        <span data-expand-word className='inline-block italic'>
                                            act
                                        </span>
                                    </span>
                                    {['of', 'love.'].map((w) => (
                                        <span key={w} className='mr-[0.28em] inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom'>
                                            <span data-expand-word className='inline-block italic'>
                                                {w}
                                            </span>
                                        </span>
                                    ))}
                                </p>
                                <footer className='mt-5 overflow-hidden'>
                                    <span
                                        data-expand-word
                                        className='inline-block text-[calc(1.1*var(--scale))] uppercase tracking-[0.2em] text-[#1e2a30]/70 md:text-[#f6f3ec]/70'>
                                        — Hani Roustom
                                    </span>
                                </footer>
                            </blockquote>
                        </section>

                        {/* ─ Panel 4: career timeline ─ */}
                        <section
                            data-panel
                            data-panel-id='work'
                            data-chapter='02'
                            data-hbg='#ece7dc'
                            data-htext='#1e2a30'
                            data-hborder='#c9c1b0'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#ece7dc] text-[#1e2a30] md:h-dvh'
                            aria-label='Career timeline'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-12 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p data-anim-rise className='font-display text-lg font-normal uppercase leading-none md:absolute md:right-24 md:top-[var(--vg)] md:text-2xl'>№ 02 — The Journey</p>
                                <p data-anim-rise className='text-[calc(1.1*var(--scale))] uppercase leading-[1.4] md:absolute md:left-32 md:top-[var(--vg)]'>
                                    Two decades, four houses
                                </p>
                                {/* timeline */}
                                <div className='relative flex flex-col gap-12 md:absolute md:left-32 md:right-24 md:top-1/2 md:h-[min(calc(64*var(--scale)),calc(100dvh_-_15rem))] md:-translate-y-1/2 md:flex-row md:items-stretch md:gap-0'>
                                    <span
                                        data-anim-line
                                        className='absolute left-1 top-0 h-full w-px origin-top bg-[#1e2a30]/25 md:left-0 md:top-1/2 md:h-px md:w-full md:origin-left'
                                        aria-hidden='true'
                                    />
                                    {[...JOURNEY_ITEMS].reverse().map((item, i) => (
                                        <div key={item.title} className='relative pl-8 md:flex-1 md:px-3 md:pl-3'>
                                            <span
                                                className='absolute left-1 top-2 size-2 -translate-x-1/2 rounded-full bg-[#1e2a30] md:left-1/2 md:top-1/2 md:-translate-y-1/2'
                                                aria-hidden='true'
                                            />
                                            <div
                                                className={`flex flex-col gap-2.5 md:absolute md:inset-x-3 ${
                                                    i % 2 === 1
                                                        ? 'md:top-[calc(50%_+_1rem)]'
                                                        : 'md:bottom-[calc(50%_+_1rem)] md:flex-col-reverse'
                                                }`}>
                                                <div data-anim-rise className='w-full overflow-hidden' style={{ aspectRatio: '21 / 10' }}>
                                                    {item.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className='size-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105'
                                                            loading='eager'
                                                        />
                                                    ) : null}
                                                </div>
                                                <div data-anim-rise className='flex flex-col gap-1'>
                                                    <p className='font-display text-[calc(2.6*var(--scale))] leading-none text-[#1e2a30]/60'>
                                                        {item.year}
                                                    </p>
                                                    <p className='text-base font-medium leading-[1.2] md:text-lg'>{item.title}</p>
                                                    <p className='text-xs font-normal uppercase tracking-wide text-[#1e2a30]/60'>
                                                        {item.meta}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a
                                    data-anim-rise
                                    className='link-underline inline-flex w-fit items-center gap-2 text-lg font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:left-32 md:text-[length:var(--cta-fs)]'
                                    href={SITE.linkedin}
                                    target='_blank'
                                    rel='noreferrer'>
                                    View full journey
                                    <ArrowForward className='size-5 shrink-0 md:size-6' />
                                </a>
                                <p
                                    data-anim-rise
                                    className='text-[calc(1.1*var(--scale))] uppercase leading-[1.3] md:absolute md:bottom-[var(--vg)] md:right-24 md:text-right'>
                                    ❋ 25+ years in luxury hospitality
                                </p>
                            </div>
                        </section>

                        {/* ─ Panel 5: What I do ─ */}
                        <section
                            data-panel
                            data-panel-id='services'
                            data-chapter='03'
                            data-hbg='#1e2a30'
                            data-htext='#f6f3ec'
                            data-hborder='#41525c'
                            className='relative z-[1] flex w-screen shrink-0 flex-col overflow-hidden bg-[#1e2a30] pt-14 text-[#f6f3ec] md:h-dvh md:w-max md:pl-16 md:pt-0'
                            aria-label='What I do'>
                            <div className='flex w-full flex-col md:min-h-0 md:w-max md:flex-1 md:flex-row md:items-stretch md:pl-16'>
                                <div
                                    data-reveal-unit
                                    className='mb-12 flex flex-col gap-10 px-5 md:mb-0 md:w-[calc(63.6*var(--scale))] md:min-h-0 md:shrink-0 md:justify-between md:gap-0 md:px-0 md:py-[var(--vg)] md:pr-6'>
                                    <p data-anim-rise className='font-display text-lg font-normal uppercase leading-none md:text-2xl'>
                                        № 03 — The Craft
                                    </p>
                                    <div className='flex flex-col gap-5'>
                                        <p data-anim-rise className='text-[calc(1.1*var(--scale))] font-normal uppercase leading-[1.2]'>
                                            What I do?
                                        </p>
                                        <p data-anim-rise className='text-2xl font-normal leading-[1.3] md:text-[length:var(--display-fs)]'>
                                            Building destinations with clarity, care, and intention.
                                        </p>
                                    </div>
                                </div>
                                {SERVICES.map((service, si) => (
                                    <article
                                        key={service.num}
                                        data-reveal-unit
                                        className={`group relative flex h-[70dvh] w-full flex-col justify-between gap-10 overflow-hidden border-t border-[#41525c] px-5 py-8 first-of-type:border-t md:h-full md:w-[calc(40*var(--scale))] md:shrink-0 md:gap-0 md:border-l md:border-t-0 md:p-[var(--vg)] ${si % 2 === 1 ? 'md:flex-col-reverse' : ''}`}>
                                        <div
                                            className={`absolute inset-0 -z-[1] transition-[clip-path] duration-700 ease-[cubic-bezier(.3,.86,.36,.95)] group-hover:[clip-path:inset(0%_0%_0%)] ${si % 2 === 1 ? '[clip-path:inset(0%_0%_100%)]' : '[clip-path:inset(100%_0%_0%)]'}`}
                                            aria-hidden='true'>
                                            <div className='absolute inset-0 z-[1] bg-[#10181d]/60' />
                                            <div className='size-full bg-[#10181d]'>
                                                {service.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={service.image}
                                                        alt=''
                                                        className='size-full object-cover object-center'
                                                        loading='eager'
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        <p
                                            data-anim-rise
                                            className='font-display text-[calc(7*var(--scale))] leading-none text-transparent md:text-[calc(11*var(--scale))] md:leading-[1.1] md:tracking-[-0.024em]'
                                            style={{ WebkitTextStroke: '1px #f6f3ec' }}>
                                            {service.num}
                                        </p>
                                        <p data-anim-rise className='font-display text-[calc(3.2*var(--scale))] font-normal uppercase leading-[1.3] md:text-[length:var(--display-fs)] md:leading-[1.2]'>
                                            {service.title}
                                        </p>
                                        <p data-anim-rise className='text-sm leading-[1.3] md:text-base'>
                                            {service.text}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* ─ Panel 6: Selected experiences ─ */}
                        <section
                            data-panel
                            data-panel-id='clients'
                            data-chapter='04'
                            data-hbg='#ece7dc'
                            data-htext='#1e2a30'
                            data-hborder='#c9c1b0'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#ece7dc] text-[#1e2a30] md:h-dvh'
                            aria-label='Selected experiences'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-10 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p data-anim-rise className='font-display text-lg font-normal uppercase leading-none md:absolute md:right-24 md:top-[var(--vg)] md:text-2xl'>№ 04 — The Record</p>
                                <div className='w-full md:absolute md:left-32 md:top-[var(--vg)] md:max-w-[calc(48*var(--scale))]'>
                                    <p data-anim-rise className='mb-5 text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                        Selected experiences
                                    </p>
                                    <ul className='flex min-w-0 flex-col text-[calc(3.2*var(--scale))] font-medium leading-[1.2] md:text-[calc(2.8*var(--scale))]'>
                                        {EXPERIENCES.map((exp, ei) => (
                                            <li
                                                key={exp.name}
                                                data-anim-rise
                                                className='flex cursor-default items-baseline gap-6 border-t border-[#c9c1b0] py-3.5 opacity-90 transition-[opacity,padding] duration-300 ease-out first:border-t-0 hover:pl-3 hover:opacity-100'>
                                                <span className='hidden w-8 shrink-0 font-display text-base leading-none text-[#1e2a30]/50 md:block'>
                                                    0{ei + 1}
                                                </span>
                                                <span className='min-w-0 flex-1 whitespace-nowrap'>{exp.name}</span>
                                                <span className='shrink-0 text-xs font-normal uppercase tracking-wide text-[#1e2a30]/60 md:text-sm'>
                                                    {exp.years}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='flex w-full flex-col gap-10 md:absolute md:right-24 md:top-[calc(var(--vg)_+_calc(5*var(--scale)))] md:w-[calc(34*var(--scale))]'>
                                    <div>
                                        <p data-anim-rise className='mb-4 text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                            Recognition
                                        </p>
                                        <ul className='flex flex-col'>
                                            {AWARDS.map((award) => (
                                                <li
                                                    key={award.title}
                                                    data-anim-rise
                                                    className='flex items-baseline justify-between gap-4 border-t border-[#c9c1b0] py-2.5 first:border-t-0'>
                                                    <span className='min-w-0'>
                                                        <span className='block text-base font-medium leading-[1.3]'>
                                                            {award.title}
                                                        </span>
                                                        <span className='block text-xs uppercase tracking-wide text-[#1e2a30]/60'>
                                                            {award.org}
                                                        </span>
                                                    </span>
                                                    <span className='shrink-0 font-display text-base text-[#1e2a30]/60'>
                                                        {award.year}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p data-anim-rise className='mb-4 text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                            Industry leadership
                                        </p>
                                        <ul className='flex flex-col gap-1.5'>
                                            {ROLES.map((role) => (
                                                <li
                                                    key={role}
                                                    data-anim-rise
                                                    className='text-xs uppercase leading-[1.5] tracking-wide text-[#1e2a30]/75'>
                                                    {role}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <p
                                    data-anim-rise
                                    className='text-[calc(1.1*var(--scale))] font-normal uppercase leading-[1.4] md:absolute md:bottom-[var(--vg)] md:left-32 md:max-w-[calc(29.4*var(--scale))]'>
                                    A career spanning hotels, resorts,
                                    <br />
                                    and destinations.
                                </p>
                            </div>
                        </section>

                        {/* ─ Panel 7: Contact / footer ─ */}
                        <section
                            id='contact'
                            data-panel
                            data-panel-id='contact'
                            data-chapter='05'
                            data-hbg='#10181d'
                            data-htext='#cfc9bb'
                            data-hborder='#41525c'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#10181d] text-[#cfc9bb] md:h-dvh'
                            aria-label='Contact'>
                            <div
                                className='pointer-events-none absolute inset-x-0 top-14 z-[2] overflow-hidden border-y border-[#263740] py-3 md:top-0'
                                aria-hidden='true'>
                                <div className='marquee-track flex w-max whitespace-nowrap text-[calc(1.1*var(--scale))] uppercase tracking-[0.18em] text-[#cfc9bb]/50 will-change-transform'>
                                    {Array.from({ length: 2 }).map((_, mi) => (
                                        <span key={mi} className='flex gap-12 pr-12'>
                                            <span>From Beirut to Lake Simcoe</span>
                                            <span>✳</span>
                                            <span>Success follows excellence</span>
                                            <span>✳</span>
                                            <span>Creating destinations, not just hotels</span>
                                            <span>✳</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className='relative flex min-h-[calc(100dvh_-_calc(6*var(--scale)))] flex-1 flex-col justify-between gap-12 px-5 pb-5 pt-24 md:min-h-0 md:px-0 md:py-0'>
                                {/* portrait anchor, left */}
                                <div
                                    className='relative w-40 shrink-0 md:absolute md:left-32 md:top-1/2 md:w-[calc(26*var(--scale))] md:-translate-y-1/2'
                                    style={{ aspectRatio: '600 / 777' }}>
                                    <span
                                        className='pointer-events-none absolute -right-3 -top-3 hidden size-full border border-[#41525c] md:block'
                                        aria-hidden='true'
                                    />
                                    <div data-anim-wipe className='relative size-full overflow-hidden bg-[#1e2a30]'>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src='/images/hani-roustom-2.jpg'
                                            alt='Hani Roustom'
                                            className='size-full object-cover object-top'
                                            loading='lazy'
                                        />
                                    </div>
                                </div>
                                {/* centered composition: label / headline / email cta */}
                                <div className='flex flex-col gap-6 md:absolute md:left-[62%] md:top-1/2 md:w-max md:-translate-x-1/2 md:-translate-y-1/2 md:items-center md:gap-8'>
                                    <p
                                        data-anim-rise
                                        className='text-[calc(1.1*var(--scale))] font-normal uppercase tracking-[0.18em] leading-[1.4] text-[#cfc9bb]/70 md:text-center'>
                                        № 05 — Where journeys become destinations
                                    </p>
                                    <h2 className='font-display text-[calc(6.4*var(--scale))] uppercase leading-[0.95] tracking-[-0.03em] md:text-center md:text-[calc(9*var(--scale))] md:text-[#f6f3ec]'>
                                        <span className='block overflow-hidden pb-[0.08em] -mb-[0.08em]'>
                                            <span data-anim-word className='block'>Let’s build</span>
                                        </span>
                                        <span className='block overflow-hidden pb-[0.08em] -mb-[0.08em]'>
                                            <span data-anim-word className='block italic'>the next</span>
                                        </span>
                                        <span className='block overflow-hidden pb-[0.08em] -mb-[0.08em]'>
                                            <span data-anim-word className='block'>destination</span>
                                        </span>
                                    </h2>
                                    <a
                                        data-anim-rise
                                        className='group mt-2 inline-flex w-fit items-center gap-4 border border-[#41525c] px-6 py-4 text-lg font-medium leading-none transition-colors duration-300 hover:border-[#f6f3ec] hover:bg-[#f6f3ec] hover:text-[#10181d] md:mt-4 md:px-8 md:py-5 md:text-[length:var(--cta-fs)]'
                                        href={`mailto:${SITE.email}`}>
                                        {SITE.email}
                                        <ArrowForward className='size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1' />
                                    </a>
                                </div>
                                {/* balanced bottom line: credits / copyright / social */}
                                <div className='hidden md:absolute md:inset-x-0 md:bottom-8 md:flex md:items-end md:justify-between md:pl-32 md:pr-24'>
                                    <p className='max-w-[calc(30*var(--scale))] text-[calc(1.1*var(--scale))] uppercase leading-[1.4] tracking-[0.1em] text-[#cfc9bb]/60'>
                                        {FOOTER_NOTE}
                                    </p>
                                    <p className='text-[calc(1.1*var(--scale))] uppercase tracking-[0.14em] text-[#cfc9bb]/70'>
                                        © 2026 — Hani Roustom
                                    </p>
                                    <nav className='text-base font-medium leading-[1.2]' aria-label='Social'>
                                        <a
                                            className='link-underline w-fit'
                                            href={SITE.linkedin}
                                            target='_blank'
                                            rel='noreferrer'>
                                            LinkedIn
                                        </a>
                                    </nav>
                                </div>
                                {/* mobile bottom block */}
                                <div className='flex flex-col gap-5 md:hidden'>
                                    <nav
                                        className='flex flex-col gap-1 text-2xl font-medium leading-[1.2]'
                                        aria-label='Social'>
                                        <a
                                            className='link-underline w-fit'
                                            href={SITE.linkedin}
                                            target='_blank'
                                            rel='noreferrer'>
                                            LinkedIn
                                        </a>
                                    </nav>
                                    <div className='flex flex-col gap-2 border-t border-[#263740] pt-5 text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                        <div className='flex items-start justify-between'>
                                            <p>© 2026 — hani roustom</p>
                                            <p>creating destinations</p>
                                        </div>
                                        <p className='text-[#cfc9bb]/60'>{FOOTER_NOTE}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomeStory;
