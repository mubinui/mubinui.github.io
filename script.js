/* =========================================================
   Mubin Ul Islam Chowdhury — Portfolio
   Interactions: nav, reveal, gallery, lightbox, form
   ========================================================= */

(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // -----------------------------------------------------
    // Navigation
    // -----------------------------------------------------
    const navbar = $('.navbar');
    const navMenu = $('#navMenu');
    const hamburger = $('#hamburger');
    const navLinks = $$('.nav-link');
    const sections = $$('section[id]');

    const closeMenu = () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    hamburger?.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top, behavior: 'smooth' });
                    closeMenu();
                }
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
    });

    // Scroll-driven nav state
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 40);

        let current = sections[0]?.id;
        for (const s of sections) {
            if (y + 120 >= s.offsetTop) current = s.id;
        }
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
        });
    };
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
            scrollTicking = true;
        }
    }, { passive: true });
    onScroll();

    // -----------------------------------------------------
    // Reveal on scroll
    // -----------------------------------------------------
    const revealTargets = $$([
        '.section-header',
        '.about-bio',
        '.about-stats > *',
        '.gallery-item',
        '.timeline-item',
        '.project-card',
        '.research-card',
        '.workshop-strip > *',
        '.skills-card',
        '.contact-info',
        '.contact-form'
    ].join(','));

    revealTargets.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => io.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('in'));
    }

    // -----------------------------------------------------
    // Gallery filter + lightbox
    // -----------------------------------------------------
    const gallery = $('#gallery');
    const filterBtns = $$('.filter-btn');
    const items = gallery ? $$('.gallery-item', gallery) : [];

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-selected', String(b === btn));
            });
            items.forEach(item => {
                const match = filter === 'all' || item.dataset.cat === filter;
                item.classList.toggle('is-hidden', !match);
            });
        });
    });

    // Lightbox
    const lightbox = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCount = $('#lbCount');
    const lbClose = $('#lbClose');
    const lbPrev = $('#lbPrev');
    const lbNext = $('#lbNext');

    let currentList = [];
    let currentIndex = 0;
    let lastFocused = null;

    const buildList = () => items.filter(it => !it.classList.contains('is-hidden'));

    const updateLightbox = () => {
        const node = currentList[currentIndex];
        if (!node) return;
        const img = $('img', node);
        lbImg.src = img.src;
        lbImg.alt = img.alt || 'Photo';
        lbCount.textContent = `${currentIndex + 1} / ${currentList.length}`;
    };

    const openLightbox = (node) => {
        currentList = buildList();
        currentIndex = currentList.indexOf(node);
        if (currentIndex < 0) currentIndex = 0;
        updateLightbox();
        lastFocused = document.activeElement;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
        lbClose.focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
        if (lastFocused) lastFocused.focus();
    };

    const prev = () => {
        if (!currentList.length) return;
        currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
        updateLightbox();
    };
    const next = () => {
        if (!currentList.length) return;
        currentIndex = (currentIndex + 1) % currentList.length;
        updateLightbox();
    };

    items.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(item);
            }
        });
    });

    lbClose?.addEventListener('click', closeLightbox);
    lbPrev?.addEventListener('click', prev);
    lbNext?.addEventListener('click', next);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
    });

    // Workshop strip → also opens lightbox via the gallery list
    $$('.workshop-strip img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            // find a matching gallery item by src
            const match = items.find(it => $('img', it).src === img.src);
            if (match) openLightbox(match);
        });
    });

    // -----------------------------------------------------
    // Contact form
    // -----------------------------------------------------
    const form = $('#contactForm');

    const toast = (msg, type = 'info') => {
        $$('.toast').forEach(t => t.remove());
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        el.innerHTML = `<i class="fas fa-${icon}"></i><span>${msg}</span>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 320);
        }, 4200);
    };

    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (!data.name || !data.email || !data.subject || !data.message) {
            toast('Please fill in all fields.', 'error');
            return;
        }
        if (!isEmail(data.email)) {
            toast('Please enter a valid email address.', 'error');
            return;
        }
        const submitBtn = $('.form-submit', form);
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
        submitBtn.disabled = true;
        try {
            await new Promise(r => setTimeout(r, 1100));
            toast("Message sent. I'll get back to you soon.", 'success');
            form.reset();
        } catch {
            toast('Could not send. Please try again later.', 'error');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });

    // -----------------------------------------------------
    // Service worker
    // -----------------------------------------------------
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }

    // -----------------------------------------------------
    // Console signature
    // -----------------------------------------------------
    console.log('%cMubin · Portfolio', 'color:#0A84FF;font-weight:700;font-size:14px');
    console.log('Reach out → uic.mubin@gmail.com');
})();
