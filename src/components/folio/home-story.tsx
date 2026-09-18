'use client';

import { useEffect, useRef, useState } from 'react';

import { ABOUT, EXPERIENCES, HERO_IMAGE, JOURNEY_ITEMS, PHOTO_CREDITS, PORTRAIT_IMAGE, SERVICES, SITE } from '@/components/folio/data';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const YEARS = Array.from(
    { length: SITE.endYear - SITE.startYear + 1 },
    (_, i) => String(SITE.startYear + i).slice(2) as string
);

const ArrowForward = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
        <path d='M16.175 13H4V11H16.175L10.575 5.4L12 4L20 12L12 20L10.575 18.6L16.175 13Z' fill='currentColor' />
    </svg>
);

const ArrowUpRight = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 56 56' fill='none' className={className} aria-hidden='true'>
        <path
            d='M16.4366 42.3367L14 39.9001L36.9612 16.9167H16.0866V13.4167H42.9199V40.2501H39.4199V19.3755L16.4366 42.3367Z'
            fill='currentColor'
        />
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
    const expandLeftRef = useRef<HTMLParagraphElement>(null);
    const expandRightRef = useRef<HTMLParagraphElement>(null);
    const navigateRef = useRef<(id: string) => void>(() => {});

    const [menuOpen, setMenuOpen] = useState(false);
    const [clock, setClock] = useState('00:00');
    const [hoveredWork, setHoveredWork] = useState<number | null>(null);

    /* live clock */
    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('en-CA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: SITE.timezone
        });
        const tick = () => setClock(fmt.format(new Date()));
        tick();
        const id = setInterval(tick, 15_000);

        return () => clearInterval(id);
    }, []);

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
            header.style.setProperty('--header-bg', el.dataset.hbg ?? '#1f1d1b');
            header.style.setProperty('--header-text', el.dataset.htext ?? '#ccc');
            header.style.setProperty('--header-border', el.dataset.hborder ?? '#5a524d');
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
                    i: YEARS.length - 1,
                    duration: 2,
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
                        const probe = x + window.innerWidth * 0.5;
                        let active = panels[0];
                        for (const p of panels) if (p.offsetLeft <= probe) active = p;
                        applyTheme(active);
                    }
                }
            });

            tl.to(track, { x: -journeyX, duration: journeyX });
            if (rect) tl.to(rect, { scale: 1, duration: holdDur }, '>');
            tl.to(expandLeftRef.current, { y: -window.innerHeight * 0.55, duration: holdDur }, '<');
            tl.to(expandRightRef.current, { y: window.innerHeight * 0.55, duration: holdDur }, '<');
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
        <div ref={rootRef} className='bg-[#edeae6] text-[#2e2b28]'>
            {/* ── Fixed header: top bar on mobile, left rail on desktop ── */}
            <header
                ref={headerRef}
                style={
                    {
                        '--header-bg': '#262220',
                        '--header-text': '#f3eee8',
                        '--header-border': '#5a524d'
                    } as React.CSSProperties
                }
                className='fixed inset-x-0 top-0 z-[110] flex w-full flex-row items-center justify-between border-b border-[var(--header-border)] bg-[var(--header-bg)] px-5 py-4 text-[var(--header-text)] opacity-0 transition-[background-color,color,border-color] duration-500 ease-out md:inset-x-auto md:inset-y-0 md:right-0 md:bottom-0 md:w-16 md:flex-col md:justify-start md:border-b-0 md:border-l md:px-0 md:py-0'
                aria-label='Global site header'>
                {/* scroll progress line */}
                <div
                    ref={progressRef}
                    className='pointer-events-none absolute -bottom-px left-0 z-10 h-px w-full origin-left bg-[#8A8178] will-change-transform md:top-0 md:bottom-auto md:h-dvh md:w-[2px] md:origin-top'
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
                <div className='hidden flex-1 flex-col items-center justify-between py-8 md:flex'>
                    <p className='vt-rl vt-reading-up text-[calc(1.1*var(--scale))] uppercase tracking-wide'>
                        Folio — Edition
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
                className={`fixed inset-0 z-[120] flex flex-col bg-[#2e2b28] text-[#faf9f6] transition-[opacity,visibility] duration-500 ease-out ${
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
                    <nav className='flex flex-col gap-6 xl:gap-[3.6vh]' aria-label='Primary'>
                        {[
                            { n: '01.', label: 'Home', id: 'home' },
                            { n: '02.', label: 'About', id: 'about' },
                            { n: '03.', label: 'Journey', id: 'work' },
                            { n: '04.', label: 'Contact', id: 'contact' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type='button'
                                onClick={() => openNav(item.id)}
                                className='group flex cursor-pointer items-center gap-5 text-left text-[calc(6.8*var(--scale))] text-[#faf9f6] opacity-40 outline-none transition-opacity duration-300 hover:opacity-100 md:text-[min(18vh,12vw)] xl:gap-6'>
                                <span className='w-6 shrink-0 font-display text-[0.3em] font-normal leading-[1.2] md:w-auto'>
                                    {item.n}
                                </span>
                                <span className='font-display font-normal uppercase leading-[0.9] md:tracking-[-0.04em]'>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>
                    <div className='flex flex-wrap gap-6 border-t border-[#5f5a54] pt-5 text-sm font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:right-16 md:border-0 md:pt-0'>
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
                            data-hbg='#3A3632'
                            data-htext='#f3eee8'
                            data-hborder='#5a524d'
                            className='relative flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-[#262220] text-[#f3eee8]'
                            aria-label='Introduction'>
                            {/* year counter — overlays the name slot, then slides away */}
                            <div className='absolute inset-x-5 bottom-8 z-[2] overflow-hidden md:inset-x-auto md:bottom-auto md:left-32 md:top-[var(--vg)]'>
                                <div
                                    ref={yearRowRef}
                                    className='font-display tabular-nums opacity-0'
                                    aria-hidden='true'>
                                    <div className='flex h-[1em] w-max text-[calc(8.4*var(--scale))] leading-none md:text-[calc(18.1*var(--scale))]'>
                                        <span className='flex h-full items-center'>20</span>
                                        <span className='block h-[1em] overflow-hidden'>
                                            <div ref={yearStripRef} className='will-change-transform'>
                                                {YEARS.map((y) => (
                                                    <span
                                                        key={y}
                                                        className='flex h-[1em] items-center leading-none tabular-nums'>
                                                        {y}
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
                                    className='font-display text-[calc(9*var(--scale))] uppercase leading-[0.9] tracking-[-0.04em] opacity-0 md:text-[calc(14*var(--scale))]'>
                                    {SITE.name.map((word, wi) => (
                                        <span
                                            key={word}
                                            className={`-mt-[0.1em] block w-max overflow-hidden pt-[0.1em] ${wi === 1 ? 'italic md:pl-[1.1em]' : ''}`}>
                                            <span data-name-word className='block whitespace-nowrap'>
                                                {word}
                                            </span>
                                        </span>
                                    ))}
                                </h1>
                                <p
                                    data-hero-fade
                                    className='mt-6 hidden w-max border-t border-[#5a524d] pt-3 text-[calc(1.1*var(--scale))] uppercase tracking-[0.14em] opacity-0 md:block'>
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
                                className='absolute bottom-12 left-5 z-[1] hidden text-base font-normal leading-[1.4] opacity-0 md:bottom-[var(--vg)] md:left-32 md:block'>
                                <span className='block'>{SITE.location}</span>
                                <span className='block tabular-nums'>
                                    {SITE.timezoneLabel} {clock}
                                </span>
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
                                className='absolute bottom-12 right-5 z-[1] text-right font-display text-xl font-normal uppercase leading-none opacity-0 md:bottom-[var(--vg)] md:right-24 md:text-[length:var(--display-fs)]'>
                                ( Scroll )
                            </p>
                        </section>

                        {/* ─ Panel 2: About ─ */}
                        <section
                            data-panel
                            data-panel-id='about'
                            data-hbg='#faf9f6'
                            data-htext='#2e2b28'
                            data-hborder='#b8b3ac'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#faf9f6] text-[#2e2b28] md:h-dvh'
                            style={
                                {
                                    '--portrait-h': 'calc(43 * var(--scale))',
                                    '--portrait-w': 'calc(34 * var(--scale))',
                                    '--portrait-top': 'calc(100dvh - var(--portrait-h) - var(--vg))'
                                } as React.CSSProperties
                            }
                            aria-label='About'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-12 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p className={chapterHeading}>№ 01 — The Person</p>
                                <div className='flex w-full flex-col gap-5 md:absolute md:right-24 md:top-[var(--vg)] md:z-10 md:w-[calc(58*var(--scale))]'>
                                    <p className='text-[calc(1.1*var(--scale))] uppercase leading-[1.2]'>{ABOUT.label}</p>
                                    <p className='text-2xl font-medium leading-[1.3] md:text-[length:var(--display-fs)]'>
                                        {ABOUT.intro}
                                    </p>
                                </div>
                                <a
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
                                        className='pointer-events-none absolute -right-3 -top-3 hidden size-full border border-[#b8b3ac] md:block'
                                        aria-hidden='true'
                                    />
                                    <div className='relative aspect-[3/4] w-full overflow-hidden bg-[#d8d1c8] md:aspect-auto md:size-full'>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={PORTRAIT_IMAGE}
                                            alt='Portrait of Hani Roustom'
                                            className='size-full object-cover object-top'
                                            loading='lazy'
                                        />
                                    </div>
                                    </div>
                                    <blockquote className='w-full border-0 p-0 text-[calc(1.1*var(--scale))] font-normal uppercase not-italic leading-[1.4] md:absolute md:left-[calc(8rem_+_var(--portrait-w)_+_calc(4*var(--scale)))] md:top-[var(--portrait-top)] md:z-10 md:w-[calc(16*var(--scale))]'>
                                        {ABOUT.quote.map((line) => (
                                            <span key={line} className='block'>
                                                {line}
                                            </span>
                                        ))}
                                    </blockquote>
                                </div>
                                <p className='hidden text-base font-normal leading-[1.4] md:absolute md:bottom-[calc(var(--vg)_+_calc(8*var(--scale)))] md:right-24 md:block md:max-w-[calc(29.4*var(--scale))] md:text-right'>
                                    {ABOUT.beyond}
                                </p>
                            </div>
                        </section>

                        {/* ─ Panel 3: "The Journey" cinematic expand ─ */}
                        <section
                            data-panel
                            data-panel-id='journey'
                            data-hbg='#faf9f6'
                            data-htext='#2e2b28'
                            data-hborder='#b8b3ac'
                            className='relative flex h-[100svh] w-screen shrink-0 flex-col items-center justify-center overflow-hidden bg-[#faf9f6] px-5 py-14 text-[#2e2b28] md:h-dvh md:px-0 md:py-0'
                            aria-label='The journey'>
                            <div
                                className='pointer-events-none absolute inset-0 z-10 hidden items-center justify-center md:flex'
                                aria-hidden='true'>
                                <div
                                    ref={expandRectRef}
                                    className='h-dvh w-screen overflow-hidden will-change-transform'
                                    style={{
                                        transformOrigin: '50% 50%',
                                        background: 'linear-gradient(135deg, #1c2b33 0%, #3d5a66 60%, #8fb0ba 100%)'
                                    }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={HERO_IMAGE}
                                        alt=''
                                        className='size-full object-cover object-center'
                                        loading='lazy'
                                    />
                                </div>
                            </div>
                            <div className='relative z-20 flex flex-1 items-center justify-center md:flex-initial md:flex-col md:gap-10 md:px-4'>
                                <p
                                    ref={expandLeftRef}
                                    className='absolute bottom-[calc(50%_+_calc(1.6*var(--scale)))] left-1/2 z-20 -translate-x-1/2 font-display text-[calc(7*var(--scale))] font-normal uppercase leading-none will-change-transform md:relative md:bottom-auto md:left-auto md:translate-x-0 md:text-[calc(12.8*var(--scale))]'>
                                    The
                                </p>
                                <div
                                    className='pointer-events-none absolute left-1/2 top-1/2 z-10 h-[calc(15.2*var(--scale))] w-[calc(8.5*var(--scale))] -translate-x-1/2 -translate-y-1/2 overflow-hidden md:hidden'
                                    aria-hidden='true'
                                    style={{
                                        background: 'linear-gradient(135deg, #1c2b33 0%, #3d5a66 60%, #8fb0ba 100%)'
                                    }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={HERO_IMAGE}
                                        alt=''
                                        className='size-full object-cover object-center'
                                        loading='lazy'
                                    />
                                </div>
                                <p
                                    ref={expandRightRef}
                                    className='absolute left-1/2 top-[calc(50%_+_calc(1.6*var(--scale)))] z-20 -translate-x-1/2 font-display text-[calc(7*var(--scale))] font-normal uppercase leading-none will-change-transform md:relative md:left-auto md:top-auto md:translate-x-0 md:text-[calc(12.8*var(--scale))] md:italic'>
                                    Journey
                                </p>
                            </div>
                        </section>

                        {/* ─ Panel 4: Defining chapters (work list) ─ */}
                        <section
                            data-panel
                            data-panel-id='work'
                            data-hbg='#edeae6'
                            data-htext='#2e2b28'
                            data-hborder='#b8b3ac'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#edeae6] text-[#2e2b28] md:h-dvh'
                            aria-label='Defining chapters'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-12 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p className='font-display text-lg font-normal uppercase leading-none md:absolute md:right-24 md:top-[var(--vg)] md:text-2xl'>№ 02 — The Journey</p>
                                <div className='flex flex-col gap-2.5 md:absolute md:left-32 md:top-[var(--vg)] md:w-full md:max-w-[calc(61.2*var(--scale))]'>
                                    <p className='text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                        Defining chapters
                                    </p>
                                    <ul className='w-full text-[calc(4.1*var(--scale))] font-medium leading-[1.2] md:text-[length:var(--list-fs)]'>
                                        {JOURNEY_ITEMS.map((item, i) => (
                                            <li
                                                key={item.title}
                                                className='group relative border-b border-[#b8b3ac] last:border-b-0'
                                                onMouseEnter={() => setHoveredWork(i)}
                                                onMouseLeave={() => setHoveredWork(null)}>
                                                <div className='flex cursor-default items-center justify-between gap-4 py-2.5'>
                                                    <span className='hidden w-10 shrink-0 font-display text-base leading-none text-[#2e2b28]/50 md:block'>
                                                        0{i + 1}
                                                    </span>
                                                    <span className='min-w-0 flex-1'>
                                                        {item.title}
                                                        <span className='mt-1 block text-xs font-normal uppercase tracking-wide text-[#2e2b28]/60 md:text-sm'>
                                                            {item.meta}
                                                        </span>
                                                    </span>
                                                    <ArrowUpRight className='hidden size-8 shrink-0 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 md:block md:size-14 md:-translate-x-2' />
                                                </div>
                                                <span
                                                    className='pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#2e2b28] transition-transform duration-500 ease-out group-hover:scale-x-100'
                                                    aria-hidden='true'
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <a
                                    className='link-underline inline-flex w-fit items-center gap-2 text-lg font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:left-32 md:text-[length:var(--cta-fs)]'
                                    href={SITE.linkedin}
                                    target='_blank'
                                    rel='noreferrer'>
                                    View full journey
                                    <ArrowForward className='size-5 shrink-0 md:size-6' />
                                </a>
                                <p className='text-[calc(1.1*var(--scale))] uppercase leading-[1.3] text-[#1a1a1a] md:absolute md:bottom-[calc(var(--vg)_+_calc(3.4*var(--scale)))] md:left-32 md:max-w-[calc(29.4*var(--scale))]'>
                                    ❋ Highlights from 25+ years in luxury hospitality
                                </p>
                                {/* hover preview */}
                                <div
                                    className='relative isolate hidden w-full max-w-[calc(40.1*var(--scale))] shrink-0 overflow-hidden md:absolute md:bottom-[var(--vg)] md:right-24 md:block'
                                    aria-hidden='true'>
                                    <svg viewBox='0 0 401 225' fill='none' className='h-auto w-full'>
                                        <rect x='0.5' y='0.5' width='400' height='224' stroke='#B8B3AC' />
                                        <path d='M0 1L401 224' stroke='#B8B3AC' />
                                    </svg>
                                    {JOURNEY_ITEMS.map((item, i) => (
                                        <div
                                            key={item.title}
                                            className='pointer-events-none absolute inset-0 flex origin-center items-end overflow-hidden p-5 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]'
                                            style={{
                                                background: item.gradient,
                                                opacity: hoveredWork === i ? 1 : 0,
                                                transform: hoveredWork === i ? 'scale(1)' : 'scale(0.85)'
                                            }}>
                                            {item.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.image}
                                                    alt=''
                                                    className='absolute inset-0 size-full object-cover object-center'
                                                    loading='lazy'
                                                />
                                            ) : null}
                                            <span className='relative z-[1] font-display text-2xl uppercase leading-none text-[#faf9f6]/90 [text-shadow:0_1px_12px_rgba(0,0,0,.45)]'>
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─ Panel 5: What I do ─ */}
                        <section
                            data-panel
                            data-panel-id='services'
                            data-hbg='#2e2b28'
                            data-htext='#faf9f6'
                            data-hborder='#5a524d'
                            className='relative z-[1] flex w-screen shrink-0 flex-col overflow-hidden bg-[#2e2b28] pt-14 text-[#faf9f6] md:h-dvh md:w-max md:pl-16 md:pt-0'
                            aria-label='What I do'>
                            <div className='flex w-full flex-col md:min-h-0 md:w-max md:flex-1 md:flex-row md:items-stretch md:pl-16'>
                                <div className='mb-12 flex flex-col gap-10 px-5 md:mb-0 md:w-[calc(63.6*var(--scale))] md:min-h-0 md:shrink-0 md:justify-between md:gap-0 md:px-0 md:py-[var(--vg)] md:pr-6'>
                                    <p className='font-display text-lg font-normal uppercase leading-none md:text-2xl'>
                                        № 03 — The Craft
                                    </p>
                                    <div className='flex flex-col gap-5'>
                                        <p className='text-[calc(1.1*var(--scale))] font-normal uppercase leading-[1.2]'>
                                            What I do?
                                        </p>
                                        <p className='text-2xl font-normal leading-[1.3] md:text-[length:var(--display-fs)]'>
                                            Building destinations with clarity, care, and intention.
                                        </p>
                                    </div>
                                </div>
                                {SERVICES.map((service, si) => (
                                    <article
                                        key={service.num}
                                        className={`group relative flex h-[70dvh] w-full flex-col justify-between gap-10 overflow-hidden border-t border-[#5f5a54] px-5 py-8 first-of-type:border-t md:h-full md:w-[calc(40*var(--scale))] md:shrink-0 md:gap-0 md:border-l md:border-t-0 md:p-[var(--vg)] ${si % 2 === 1 ? 'md:flex-col-reverse' : ''}`}>
                                        <div
                                            className={`absolute inset-0 -z-[1] transition-[clip-path] duration-700 ease-[cubic-bezier(.3,.86,.36,.95)] group-hover:[clip-path:inset(0%_0%_0%)] ${si % 2 === 1 ? '[clip-path:inset(0%_0%_100%)]' : '[clip-path:inset(100%_0%_0%)]'}`}
                                            aria-hidden='true'>
                                            <div className='absolute inset-0 z-[1] bg-[#1f1d1b]/60' />
                                            <div className='size-full' style={{ background: service.gradient }}>
                                                {service.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={service.image}
                                                        alt=''
                                                        className='size-full object-cover object-center'
                                                        loading='lazy'
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        <p className='font-display text-[calc(7*var(--scale))] leading-none md:text-[calc(9*var(--scale))] md:leading-[1.3] md:tracking-[-0.024em]'>
                                            {service.num}
                                        </p>
                                        <p className='font-display text-[calc(3.2*var(--scale))] font-normal uppercase leading-[1.3] md:text-[length:var(--display-fs)] md:leading-[1.2]'>
                                            {service.title}
                                        </p>
                                        <p className='text-sm leading-[1.3] md:text-base'>{service.text}</p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* ─ Panel 6: Selected experiences ─ */}
                        <section
                            data-panel
                            data-panel-id='clients'
                            data-hbg='#edeae6'
                            data-htext='#2e2b28'
                            data-hborder='#b8b3ac'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#edeae6] text-[#2e2b28] md:h-dvh'
                            aria-label='Selected experiences'>
                            <div className='relative flex min-h-0 flex-1 flex-col gap-10 px-5 py-14 md:gap-0 md:px-0 md:py-0'>
                                <p className='font-display text-lg font-normal uppercase leading-none md:absolute md:right-24 md:top-[var(--vg)] md:text-2xl'>№ 04 — The Company</p>
                                <div className='w-full md:absolute md:left-32 md:top-[var(--vg)] md:max-w-[calc(68*var(--scale))]'>
                                    <p className='mb-5 text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                        Selected experiences
                                    </p>
                                    <ul className='flex min-w-0 flex-col text-[calc(4.2*var(--scale))] font-medium leading-[1.2] md:text-[length:var(--list-fs)]'>
                                        {EXPERIENCES.map((exp, ei) => (
                                            <li
                                                key={exp.name}
                                                className='flex cursor-default items-baseline gap-6 border-t border-[#b8b3ac] py-3 opacity-90 transition-[opacity,padding] duration-300 ease-out first:border-t-0 hover:pl-3 hover:opacity-100'>
                                                <span className='hidden w-10 shrink-0 font-display text-base leading-none text-[#2e2b28]/50 md:block'>
                                                    0{ei + 1}
                                                </span>
                                                <span className='min-w-0 flex-1'>{exp.name}</span>
                                                <span className='shrink-0 text-sm font-normal uppercase tracking-wide text-[#2e2b28]/60 md:text-base'>
                                                    {exp.years}
                                                </span>
                                            </li>
                                        ))}
                                        <li className='border-t border-[#b8b3ac] py-3 opacity-50'>And more</li>
                                    </ul>
                                </div>
                                <p className='text-[calc(1.1*var(--scale))] font-normal uppercase leading-[1.4] md:absolute md:bottom-[var(--vg)] md:right-24 md:max-w-[calc(29.4*var(--scale))] md:text-right'>
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
                            data-hbg='#1f1d1b'
                            data-htext='#ccc'
                            data-hborder='#5a524d'
                            className='relative flex w-screen shrink-0 flex-col overflow-hidden bg-[#1f1d1b] text-[#ccc] md:h-dvh'
                            aria-label='Contact'>
                            <div className='relative flex min-h-[calc(100dvh_-_calc(6*var(--scale)))] flex-1 flex-col justify-between gap-10 px-5 pb-5 pt-14 md:min-h-0 md:px-0 md:py-0'>
                                <div className='flex flex-col gap-5 md:contents'>
                                    <p className='text-[calc(1.1*var(--scale))] font-normal uppercase leading-[1.4] md:absolute md:left-1/2 md:top-[var(--vg)] md:-translate-x-1/2 md:whitespace-nowrap md:text-center'>
                                        Where journeys become destinations
                                    </p>
                                    <div className='w-full leading-none md:absolute md:left-1/2 md:top-1/2 md:w-max md:max-w-none md:-translate-x-1/2 md:-translate-y-[62%]'>
                                        <h2 className='font-display text-[calc(7*var(--scale))] uppercase leading-none tracking-[-0.04em] md:text-center md:text-[calc(16*var(--scale))]'>
                                            <span className='block'>Next</span>
                                            <span className='block italic'>chapter</span>
                                        </h2>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-10 md:contents'>
                                    <div className='flex flex-col gap-4 md:absolute md:bottom-[calc(var(--vg)_+_calc(10*var(--scale)))] md:left-1/2 md:-translate-x-1/2 md:items-center'>
                                        <p className='text-[calc(1.1*var(--scale))] uppercase leading-[1.4]'>
                                            Contact to
                                        </p>
                                        <a
                                            className='link-underline-filled w-fit text-2xl font-medium leading-[1.2] md:text-[length:var(--display-fs)]'
                                            href={`mailto:${SITE.email}`}>
                                            {SITE.email}
                                        </a>
                                    </div>
                                    <div className='flex flex-col gap-5 md:contents'>
                                        <p className='text-[calc(1.1*var(--scale))] font-medium uppercase leading-[1.4] md:hidden'>
                                            social
                                        </p>
                                        <nav
                                            className='flex flex-col gap-1 text-2xl font-medium leading-[1.2] md:absolute md:bottom-[var(--vg)] md:right-24 md:flex-row md:gap-6 md:text-base'
                                            aria-label='Social'>
                                            <a
                                                className='link-underline w-fit'
                                                href={SITE.linkedin}
                                                target='_blank'
                                                rel='noreferrer'>
                                                LinkedIn
                                            </a>
                                        </nav>
                                    </div>
                                    <p className='hidden text-[calc(1*var(--scale))] uppercase leading-[1.4] text-[#ccc]/40 md:absolute md:bottom-[var(--vg)] md:left-32 md:block md:max-w-[calc(30*var(--scale))]'>
                                        {PHOTO_CREDITS}
                                    </p>
                                    <div className='flex flex-col gap-2 border-t border-[#3a3632] pt-5 text-[calc(1.1*var(--scale))] uppercase leading-[1.4] md:hidden'>
                                        <div className='flex items-start justify-between'>
                                            <p>© 2026 — hani roustom</p>
                                            <p>folio — edition</p>
                                        </div>
                                        <p className='text-[#ccc]/40'>{PHOTO_CREDITS}</p>
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
